# Brewlight — progress log

Written for handing the project to another tool (Claude Code). Read `CLAUDE.md` first; this is the chronological detail. Answer the user in Portuguese; they test on a device and report problems (the authoring environment cannot see visuals).

## Verification state
`npx tsc --noEmit` clean; `npx jest` 116 tests passing (logic-tests + react-tests projects). Nothing visual was verified on-device by the author.

## Timeline (newest last)
1. Main menu → instructions → level select → game; i18n module (PT default, EN, ES); progression logic; order queue (max 3 pending, faster at peak, never expiring).
2. Kenney CC0 models baked to TS geometry (`scripts/convert-glb.cjs`, `docs/ASSETS.md`); order board as chalkboard; per-scene hint banner.
3. Procedural café backdrop was built, then removed at the user's request (they will supply their own background).
4. Single world with smooth camera pan (`CameraRig`, arrows ◀ ▶, `world.ts`, `navigation.ts`).
5. Options screen: "Dicas" (hints) toggle persisted via `src/game/settings.ts`; `HintBanner` fades in/out (4 s hold). Language selector (PT/EN/ES) persisted; changing it remounts the screens via a keyed Fragment in `App.tsx`.
6. Dynamics pass: cup fills inside the drip bay with rising liquid + pour stream; bread stands upright in the toaster; flat delivery counter with computer, register, tip jar and served items built from preps; coffee-table decor (stacked cups, cloths, apron).
7. Fix: order board was unreachable after the single-world refactor (`COUNTER_ORDER` now starts with `orderBoard`; board colour brightened).
8. i18n of HUD, day summary and order descriptions (`tf()` for `{placeholders}`, `orderWords()`).
9. Levels 1-5 (`levelConfig`): orders/shift 6/8/10/12/14, items/order 1/2/2/3/3, price ×1/1.2/1.45/1.75/2.1, table scale 1→1.4 and darker wood, lighting theme. Level 1 = coffee only.
10. New recipes via generic `RecipeStation`: juice (blender + ice, L3), pancakes (pan + honey, timed, L4), salad (board + dressing, L5). Review: missing extra −1; pancakes raw (<1.5 s) or burnt (>9 s) −1.
11. Level-aware world layout so low levels never pan across locked stations.
12. Steam above hot items (`Steam.tsx`) and liquid slosh while the cup is carried (`CoffeeLiquid`).

Research notes: Wikipedia (Cooking Mama, Barista) — step-by-step mini-games per recipe; barista flow (espresso → milk frothing → latte art) is the source for the next-idea list below.

## Hard rules (see CLAUDE.md for the reasons)
- Never stressful: no hard timers, delivery never blocked, skipped steps only cost stars.
- R3F pointer events for 3D drag (not gesture-handler); RN `<Text>` for all text; reanimated pinned 4.7.1; EAS cloud builds; `react-tests` matches `*.test.tsx` only (new pure-TS tests go in `logic-tests` testMatch in `jest.config.js`).
- RNTL v14: `await render/fireEvent`.
- Commit trailer: `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`; commit at each logical checkpoint.

## Open items / ideas
- IAP: flip `FULL_VERSION_UNLOCKED` in `levels.ts` once purchases exist (LevelSelectScreen takes a `fullVersion` prop).
- Audio (lofi), user-supplied background, on-device tuning of zones (`RecipeStation/specs.ts`, `dropZones.ts`, `ToastStation/zones.ts`).
- Café mechanics ideas: milk frothing + latte art, spending money on upgrades (`upgradeCost`/`canUpgrade` unused in UI), per-level decor, more recipes (Kenney Food Kit has croissant, cupcake, donut, sandwich, waffle, ice cream...).
- Untracked and not ours: `.idea/`.
