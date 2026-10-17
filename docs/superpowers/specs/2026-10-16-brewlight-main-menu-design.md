# Brewlight — Main Menu (slice 1 of the screen flow)

Scope: main menu only. Instructions and level-select screens come later
(see "Fluxo de telas" in `2026-10-16-cozy-cafe-design.md`). Visual direction:
`2026-10-16-brewlight-menu-tipografia.md` (A · Madeira & Âmbar).

## Behavior

- **Iniciar** → navigates to `PlaceholderScreen` ("Coming soon" + Back button).
  It stands in for the future instructions/level-select flow. It does NOT enter
  the game yet; `GameScreen` stays reachable by code but not by the menu.
- **Salvar** → calls `saveProgress({ day, money })` with the current store
  state, then shows a "Saved" label that fades after ~1.5s. Autosave already
  exists; this is an explicit, reassuring action. A failed save shows nothing
  alarming (cozy rule: never stressful).
- **Sair** → rendered on Android only; calls `BackHandler.exitApp()`. Hidden on iOS.

## Architecture (approach A: no router)

- `App.tsx` holds `screen: 'menu' | 'placeholder'` in `useState` and renders
  the matching screen. No new dependencies, so no dev-client rebuild.
  Swap for a router once there are 4+ screens.
- `src/screens/MainMenuScreen.tsx` — plain RN views/`<Text>` (nothing in
  `<Canvas>`). Props: `onStart`. Title "Brewlight", subtitle
  "SUA CAFETERIA ACONCHEGANTE". Palette: Carvão `#2B2729` background, Âmbar
  `#F3B45A` primary button with `#2B1A10` text, Nogueira `#4A2F1F` secondary
  buttons, Creme `#F6E3C7` text. Fonts: Figtree (already loaded in
  `GameScreen`); Fraunces for the logo needs `@expo-google-fonts/fraunces`
  (JS-only, no native rebuild). Fall back to the system font while loading;
  buttons must always render (same lesson as the day-summary soft-lock fix).
- `src/screens/PlaceholderScreen.tsx` — "Coming soon" + Back. Props: `onBack`.

## Persistence interaction (important)

`saveProgress` overwrites storage. If the player taps Salvar before saved
progress has been hydrated into the store, defaults would clobber real
progress. Therefore hydration (`loadProgress` → `hydrateProgress`) must run
once at app launch in `App.tsx`, before the menu is interactive, rather than in
`GameScreen` (the location in the persistence plan's Task 3). Salvar is
disabled until hydration finishes. Coordinate with Task 3: move its hydrate
call to `App.tsx` rather than duplicating it.

## Testing

`react-tests` project (`*.test.tsx` only): menu renders three buttons on
Android and two on iOS; Iniciar calls `onStart`; Salvar calls `saveProgress`
with store `day`/`money` and shows "Saved"; Sair calls `BackHandler.exitApp`;
Placeholder Back calls `onBack`. Mock `saveProgress`.

## Out of scope

Instructions screen, level select, i18n (strings English/PT as in the visual
spec for now), audio, monetization, 3D scene behind the menu.
