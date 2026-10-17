# Brewlight — Project Context

Read this before touching anything. This file exists because development has
moved between multiple machines and AI tools (Claude Code on Windows, GitHub
Copilot on a Mac) and context kept getting lost between sessions. Keep it
updated as the project moves — it's the single source of truth for "where
are we and why."

## What this is

A mobile cozy/ASMR coffee-shop simulation game. First-person camera, you're
an employee preparing orders by dragging objects around in 3D. The whole
design premise is **the game must never feel stressful** — no hard timers,
no punishing mid-action feedback, delivery is never blocked. That rule
overrides almost every other design decision in this codebase; when in
doubt, that's the tiebreaker.

Full design vision: `docs/superpowers/specs/2026-10-16-cozy-cafe-design.md`
Visual direction (chosen: "A · Madeira & Âmbar"): `docs/superpowers/specs/2026-10-16-brewlight-menu-tipografia.md`

## Tech stack — exact versions matter here, see "Hard-won lessons" below

- Expo SDK **58** (`~58.0.13`), React Native **0.88.0**
- `react-native-reanimated` **4.7.1** (NOT 3.x — see lessons)
- `react-native-worklets` 0.13.0 (reanimated 4's separate native engine)
- `@react-three/fiber` + `expo-gl` for 3D — native, not a WebView
- `@react-three/drei` for 3D helpers (but NOT its `<Text>` — see lessons)
- `react-native-gesture-handler` (used for non-3D UI only — see lessons)
- `zustand` for state
- Jest (`jest-expo` + a custom `logic-tests`/`react-tests` project split —
  see `jest.config.js`)
- EAS Build for cloud native builds (account: `stackoverlflow` on expo.dev,
  project `brewlight-scaffold`, id `494eff88-5a39-48f1-b047-e6eb67c0adcc`)

## Hard-won lessons — do not relearn these the expensive way

1. **`react-native-gesture-handler`'s `GestureDetector` cannot attach to a
   mesh inside R3F's `<Canvas>`.** Verified by reading both libraries'
   source: `GestureDetector` needs a native host-view ref; an R3F mesh is a
   Three.js scene-graph node, not a native view. For any interactive 3D
   object (drag, tap), use React Three Fiber's own built-in pointer events
   (`onPointerDown`/`onPointerMove`/`onPointerUp` as mesh props) instead.
   `gesture-handler` is still correctly used for non-3D things (it's a
   dependency of reanimated's RN plumbing). See `CupDraggable.tsx` for the
   established pattern (pointer capture + a canvas-level `lostpointercapture`
   listener — NOT a timeout — to detect the finger leaving the screen; a
   timeout-based approach was tried and rejected because RN's native touch
   pipeline emits zero events for a stationary-but-held finger, which would
   falsely yank objects away from a player who paused deliberately).
2. **Reanimated 3.x does not work with Expo SDK 58 / RN 0.88.** Confirmed
   both by a runtime crash (`findHostInstance.ts` requiring a shim file that
   no longer exists in RN 0.88) and by Expo's own SDK 58 docs, which
   prescribe reanimated 4.6+. Reanimated 4.x requires `react-native-worklets`,
   a native module **not bundled in stock Expo Go** — so this project
   cannot run in plain Expo Go. It needs a custom development build.
3. **On Windows, building that dev client locally (`expo run:android`) hits
   a hard wall**: react-native-gesture-handler's New Architecture C++
   codegen path (`rngesturehandler_codegen_autolinked_build/...`) exceeds
   Windows' 260-character MAX_PATH, even with `LongPathsEnabled` registry
   set (the bundled `ninja.exe` doesn't respect it). Tried and failed:
   shortening the project path, `subst`-ing a short virtual drive (broke
   Gradle's subprocess path resolution differently), `-DCMAKE_OBJECT_PATH_MAX`
   gradle arg (didn't help locally either). **The fix that works: build via
   EAS Build (cloud, Linux builders) instead of locally.** `eas.json` and
   the EAS project are already configured — just run
   `eas build --platform android --profile development`.
   - Gotcha hit once: a *locally* generated `android/build/` (gitignored,
     never committed) can still get picked up by `eas build`'s local
     project archive step if left on disk, and it can embed an absolute
     Windows path that breaks the Linux build. If a cloud build fails with
     a path like `.../build/android/D:/...`, delete local
     `android/build`, `android/app/build`, `android/app/.cxx` and retry.
4. **drei's `<Text>` cannot render on React Native.** It (via
   `troika-three-text`) unconditionally calls
   `document.createElement('canvas')` to build its font atlas — no
   `document` global exists in RN, so this crashes on first render. Any
   text — order labels, HUD, etc. — must be plain React Native `<Text>` in
   a 2D overlay (see `GameScreen.tsx`), never inside the `<Canvas>`.
5. **`jest.config.js` has two projects** (`logic-tests` for pure `.ts` game
   logic, `react-tests` for `.tsx` component tests). `react-tests`' glob
   must stay `*.test.tsx` only — it was briefly `*.test.ts` too, which
   double-ran every logic suite through the wrong (broken) reanimated mock
   setup. If you add a new pure-logic test file, add its path to
   `logic-tests`' `testMatch` array explicitly.
6. **Install deps with `npm install <pkg>@<version>`, not always
   `npx expo install`** — `expo install` will try to "correct" reanimated
   back to whatever it thinks SDK 58 wants, which is right for 4.x but will
   fight you if you're deliberately testing something else.

## How to run this project right now

There is no Expo-Go path (see lesson 2). To test:

1. A dev-client build already exists (rebuild if dependencies changed):
   `eas build --platform android --profile development`
   (cloud build, ~10-15 min, no local Android toolchain needed)
2. Install the resulting APK on an emulator/device (the build command prints
   a QR/link; or `adb install -r <downloaded-apk>`)
3. `npx expo start --dev-client`
4. Open the installed app (not Expo Go) on the device — it connects to
   Metro automatically.

Tests: `npx jest` (should be 5 suites, all passing, pure logic only — no
automated tests for the 3D/gesture/animation layer, that's deliberate, see
the vertical-slice plan's scope note).
Typecheck: `npx tsc --noEmit` (should be clean).

## Current state (keep this section current)

**Done, reviewed, merged (the "Core Loop Vertical Slice" — 9-task plan,
each task individually code-reviewed, plus a final whole-branch review with
a fix wave):** the core gameplay loop — order board → coffee station (drag
cup, pour, add sugar, mark done) → delivery counter → rule-based review →
back to order board — for a single recipe (coffee). Low-poly 3D visual
style, Madeira & Âmbar color/typography direction, drag-sway "juice"
physics. Plan: `docs/superpowers/plans/2026-10-16-brewlight-core-loop-vertical-slice.md`

**Added later (outside this plan, via GitHub Copilot on a different
machine — not yet code-reviewed as of this writing):**
- A second recipe: toast (`ToastStation`, `GRIDDLE_ZONE`, `BUTTER_ZONE`,
  `TOAST_MIN_MS`, `TOAST_BURN_THRESHOLD_MS`)
- Multi-item orders with per-item review (`OrderItem`, `Recipe`)
- Shifts/day structure: `ShiftId`, `Clock`, `ORDERS_PER_SHIFT`
- Economy: `ITEM_PRICES`, `orderValue`, `stationForItem`
- A fix for a Metro/Hermes crash (`three` ESM resolution)
- The generated `android/` native project got committed (this is
  intentional now, since EAS Build benefits from having it present rather
  than regenerating via prebuild each time — just remember lesson 3's
  gotcha about stale local `android/build/` cruft)

A code review of everything in the second bullet is in progress / may
already be done by the time you read this — check for a recent commit or
ask the human partner for the findings if unclear.

## Not yet done (per the original design doc's scope)

Progression/leveling (5 levels), equipment upgrades, 3 languages (PT/EN/ES
— currently English-only strings), audio (direction decided: lofi,
royalty-free — not sourced yet), persistence (local-only, not yet wired),
monetization/IAP (free download, level 1 free, IAP unlocks the rest — not
yet implemented). The shifts/economy/toast work above is a step toward some
of this but wasn't planned through the same brainstorm→plan→review process
as the vertical slice — worth reconciling with the original design doc.

## Project structure

```
src/
  game/          — pure game logic (orders, review scoring, pricing, clock). No React/3D imports.
  state/         — zustand store (useGameStore). No rendering knowledge.
  scenes/
    OrderBoard/        — order board scene
    CoffeeStation/      — coffee station scene + CupDraggable + drop zones
    ToastStation/       — toast station scene (added later, not yet reviewed)
    DeliveryCounter/    — delivery counter scene
    FadeTransition/     — the hard-cut fade overlay between scenes
    shared/             — dragSway (pendulum physics), sceneCamera
    GameScene.tsx        — <Canvas> root, switches between scenes by store.scene
  screens/
    GameScreen.tsx        — top-level screen: GameScene + FadeTransition + HUD (RN <Text>, not in-Canvas)
docs/superpowers/specs/   — design docs (read these for "why")
docs/superpowers/plans/   — implementation plans
```
