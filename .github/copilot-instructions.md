# Brewlight — read CLAUDE.md first

Full project context, current status, and hard-won technical lessons live
in `CLAUDE.md` at the repo root. Read it before making changes — this repo
has moved between tools and machines and that file is kept up to date as
the single source of truth.

The five things that have cost the most time when skipped:

1. `react-native-gesture-handler` cannot attach to a mesh inside the R3F
   `<Canvas>`. Use R3F's own pointer events (`onPointerDown` etc.) for any
   draggable/tappable 3D object instead.
2. This project is pinned to `react-native-reanimated@4.7.1`. Do not
   downgrade to 3.x — it does not run on this Expo SDK/React Native
   version (confirmed by a runtime crash and by Expo's own compatibility
   docs). Reanimated 4.x needs `react-native-worklets`, which Expo Go does
   not bundle — this project only runs via a custom dev client, never Expo Go.
3. Build the Android dev client via `eas build --platform android --profile
   development` (cloud). Do not try `expo run:android` on Windows — its
   native codegen paths exceed Windows' 260-char path limit and there is
   no known local fix; EAS Build's Linux builders don't have this problem.
4. `@react-three/drei`'s `<Text>` cannot render in React Native (it needs a
   browser `document` object). All UI/order text is plain React Native
   `<Text>` in `GameScreen.tsx`'s overlay, never inside the `<Canvas>`.
5. Keep `jest.config.js`'s `react-tests` project matching `*.test.tsx`
   only — it previously also matched `*.test.ts` and double-ran every pure
   logic test suite through a broken setup.

See `CLAUDE.md` for the full current status (what's built, what's reviewed,
what's still open) and the project's non-negotiable design rule: the game
must never feel stressful.
