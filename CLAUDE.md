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

**Added later (outside the original plan, via GitHub Copilot on a different
machine) — reviewed, 2 real bugs found and fixed:**
- A second recipe: toast (`ToastStation`, `GRIDDLE_ZONE`, `BUTTER_ZONE`,
  `TOAST_MIN_MS`, `TOAST_BURN_THRESHOLD_MS`)
- Multi-item orders with per-item review (`OrderItem`, `Recipe`)
- Shifts/day structure: `ShiftId`, `Clock`, `ORDERS_PER_SHIFT`
- Economy: `ITEM_PRICES`, `orderValue`, `stationForItem`
- A fix for a Metro/Hermes crash (`three` ESM resolution)
- The generated `android/` native project got committed (intentional —
  EAS Build benefits from having it present; remember lesson 3's gotcha
  about stale local `android/build/` cruft)
- Fixed: the day-closed summary's only dismiss button was gated behind
  font-loading, which could soft-lock the game — now always renders.
- Fixed: delivering the day's last order used to silently pre-generate a
  "day 2" order before the summary was dismissed — now skipped when
  `dayOver` is true.
- Shift constant: `ORDERS_PER_SHIFT` was Copilot's `4`, corrected to
  **`10`** to match the design doc's "~10 pedidos no máximo por turno".

**EAS Build / dev-client pipeline is set up and confirmed working**
(account `stackoverlflow`, project `brewlight-scaffold`). A dev-client APK
has been built in the cloud, installed on an emulator via `adb`, and the
app has been confirmed actually running — not just building — with
Reanimated 4 functioning. This was the hard part; see "Hard-won lessons."

**Latest status (2026-10-17) — see `docs/PROGRESS.md` for the full log.**
Persistence (day/money, hydrated in `App.tsx`), main menu, instructions,
level select, options (hints toggle + language PT/EN/ES), i18n of all
in-game text, order queue, single-world camera pan, 5 playable levels, and
5 recipes (coffee, toast, juice, pancakes, salad) are all implemented and
committed on the working branch. `npx tsc --noEmit` is clean and
`npx jest` passes (116 tests). Visuals/physics tuning is NOT verified
on-device from the authoring environment — expect small alignment fixes.

## Not yet done

1. **Monetization/IAP** — `FULL_VERSION_UNLOCKED = true` in `src/game/levels.ts` is a placeholder; levels 2-5 are open. Wire the real purchase and flip it.
2. **Audio** — lofi, royalty-free; not sourced/wired.
3. **New café background** — the user will supply one (the procedural backdrop was removed; background is flat `#2B2729` / per-level theme).
4. **On-device tuning** — appliance/zone positions of the new stations (`src/scenes/RecipeStation/specs.ts`), toaster slot, coffee bay/spout, pan speed.
5. **More cafe mechanics ideas** — milk frothing / latte art (barista research), upgrade purchases with in-game money (`upgradeCost`, `canUpgrade` exist but are unused in the UI), decor that varies per level.

## Project structure

```
src/
  game/          — pure game logic (orders, review scoring, pricing, clock). No React/3D imports.
  state/         — zustand store (useGameStore). No rendering knowledge.
  scenes/
    OrderBoard/        — order board scene
    CoffeeStation/      — coffee station scene + CupDraggable + drop zones
    ToastStation/       — toast station scene
    RecipeStation/      — generic station for juice/pancakes/salad (specs.ts = per-recipe data)
    DeliveryCounter/    — delivery counter scene
    FadeTransition/     — the hard-cut fade overlay between scenes
    shared/             — dragSway, world layout, CameraRig, props (baked models, steam, liquid)
    GameScene.tsx        — <Canvas> root, switches between scenes by store.scene
  screens/
    GameScreen.tsx        — top-level screen: GameScene + FadeTransition + HUD (RN <Text>, not in-Canvas)
docs/superpowers/specs/   — design docs (read these for "why")
docs/superpowers/plans/   — implementation plans
```

## 3D props

Props (machine, toaster, cup, bread) are Kenney CC0 models baked to TS geometry (`src/scenes/shared/props/`, see `docs/ASSETS.md`). Render with `<ModelParts>`; do not add glTF loaders (RN texture loading is fragile). Visuals are unverified on-device; tune `scale` in the station files.

Scenes live side by side in one world (`src/scenes/shared/world.ts`); `CameraRig` glides the camera to `pendingScene ?? scene`. Stations stay mounted and are keyed by order/item to reset. Do not reintroduce per-scene camera setup.

## Levels (1-5)

`src/game/levels.ts` `levelConfig(level)` drives orders per shift, max items per order, price multiplier, table scale/color and lighting/background theme. `recipesForLevel`: L1 coffee; L2 +toast; L3 +juice; L4 +pancakes; L5 +salad. `useGameStore.selectLevel` starts a fresh shift. The world layout is level-aware: `sceneX(scene, level)` (world.ts) packs only the stations the level serves, and `neighborScene(scene, dir, level)` (navigation.ts) skips the rest.

## Recipes

Adding a coffee/toast-style recipe: extend `Recipe`/`OrderItem`/`ItemPrep` (`src/game/types.ts`), `STATION` + `makeItem` (`orders.ts`), `ITEM_PRICES` (`menu.ts`), review rules (`review.ts`), i18n words/hints (`strings.ts`, `orderWords`), `HINTS` in `GameScreen.tsx`. Juice/pancakes/salad share `ExtraRecipe` (`wantsExtra`/`extraAdded`/`processMs`) and one component, `RecipeStation`, driven by `SPECS` in `src/scenes/RecipeStation/specs.ts`. Draggables must have the model's geometry on the draggable mesh itself (children of `CupDraggable` must be `ModelParts`/meshes, not a wrapping group, or the mesh is not hit-testable).

## Docs for agents

- `docs/PROGRESS.md` — chronological log of what was built, decisions and open items.
- `docs/ASSETS.md` — model sources and the regenerate command.
