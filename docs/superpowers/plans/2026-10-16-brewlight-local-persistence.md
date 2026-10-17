# Brewlight — Local Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist the player's day count and money locally so progress
survives an app restart, with no backend — the foundation the upcoming
progression and main-menu plans both depend on.

**Architecture:** A small persistence module wraps
`@react-native-async-storage/async-storage` behind two pure-ish async
functions (`saveProgress`/`loadProgress`) operating on a small, explicit
`PersistedProgress` shape. The game store gains a `hydrateProgress` action
that applies loaded data at startup, and calls `saveProgress` at the two
points where persisted fields actually change (`deliverOrder`,
`startNextDay`). `GameScreen` loads and hydrates once on mount.

**Tech Stack:** `@react-native-async-storage/async-storage` (the
established RN community package for this — Expo-compatible, autolinked).
Jest tests use the package's own official mock
(`@react-native-async-storage/async-storage/jest/async-storage-mock`).

**Spec:** `D:\workspace\hub\cozy-cafe\docs\superpowers\specs\2026-10-16-cozy-cafe-design.md`
(see "Persistência: 100% local no aparelho... Sem conta de usuário, sem
autenticação, sem sincronização em nuvem")

## Scope note

This plan persists only `day` and `money` — the two fields that already
exist on the store and already represent cross-day progress. It does NOT
persist `dayEarnings`/`dayReviews`/`reviews` (per-day or session-transient,
reset by `startNextDay`/irrelevant across restarts) or `scene`/`currentOrder`
/`isTransitioning` (mid-action session state — restoring a player into the
middle of a drag or a fade would be confusing, not helpful; a restart
should land on the order board). A later progression plan will extend
`PersistedProgress` with a `level` field the same way earlier plans
extended `GameState` incrementally — that's explicitly not this plan's job.

## Global Constraints

- Local-only persistence, no backend, no auth, no cloud sync (spec).
- Prefer established open-source libraries over custom equivalents (spec)
  — use `@react-native-async-storage/async-storage`, not a hand-rolled
  file/SQLite wrapper.
- The game must never feel stressful / never get stuck — persistence I/O
  must never block the UI or leave the app unable to proceed if a read/write
  fails (e.g. corrupted storage, first-ever launch with nothing saved).

## Review Focus

- First-ever launch, nothing saved yet — `loadProgress()` must return a
  clean "nothing here" result, not throw, and the store must fall back to
  its existing defaults (`day: 1, money: 0`). Covered in Task 1.
- Saved data from a future version with an unrecognized/malformed shape
  (e.g. `money` as a string, or extra fields) — hydration must not crash
  the app or produce `NaN` money; invalid fields fall back to defaults.
  Covered in Task 1.
- A `startNextDay()` call happening before the previous `saveProgress()`
  call for that same tick has resolved — the final persisted state must
  still reflect the latest values, not a stale overwrite. Covered in Task 2
  (save is called with the fresh post-update state each time, not a
  captured stale closure).
- `AsyncStorage.setItem`/`getItem` rejecting (storage full, platform I/O
  error) — must not crash the app or leave `hydrateProgress` uncalled;
  the store proceeds with defaults and the error is swallowed, not thrown
  into the render tree. Covered in Task 1.
- Hydration racing the very first `deliverOrder()`/`startNextDay()` call —
  if the player somehow acts before the async load resolves, a later
  resolved load must not clobber progress the player already made in that
  session. Covered in Task 3 (hydrate before anything else can run, and
  document why the ordering is safe).

---

## Task 1: Persistence Module

**Files:**
- Create: `src/game/persistence.ts`
- Test: `src/game/persistence.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces:
  ```ts
  export interface PersistedProgress { day: number; money: number; }
  export async function saveProgress(data: PersistedProgress): Promise<void>;
  export async function loadProgress(): Promise<PersistedProgress | null>;
  ```
  Task 2 imports both and the `PersistedProgress` type verbatim.

- [ ] **Step 1: Write failing tests using the package's official AsyncStorage mock**

```ts
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveProgress, loadProgress, PersistedProgress } from './persistence';

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('loadProgress returns null when nothing has been saved yet', async () => {
  expect(await loadProgress()).toBeNull();
});

test('saveProgress then loadProgress round-trips day and money', async () => {
  await saveProgress({ day: 3, money: 42 });
  expect(await loadProgress()).toEqual({ day: 3, money: 42 });
});

test('loadProgress returns null for malformed stored JSON', async () => {
  await AsyncStorage.setItem('brewlight.progress', 'not json');
  expect(await loadProgress()).toBeNull();
});

test('loadProgress returns null when stored fields have the wrong type', async () => {
  await AsyncStorage.setItem('brewlight.progress', JSON.stringify({ day: '3', money: 42 }));
  expect(await loadProgress()).toBeNull();
});

test('saveProgress does not throw when AsyncStorage.setItem rejects', async () => {
  jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('disk full'));
  await expect(saveProgress({ day: 1, money: 0 })).resolves.toBeUndefined();
});

test('loadProgress does not throw when AsyncStorage.getItem rejects', async () => {
  jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('io error'));
  await expect(loadProgress()).resolves.toBeNull();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest src/game/persistence.test.ts`
Expected: FAIL — `saveProgress`/`loadProgress` are not defined.

- [ ] **Step 3: Install the dependency**

Run: `npx expo install @react-native-async-storage/async-storage`

- [ ] **Step 4: Implement `src/game/persistence.ts`**

A single storage key, e.g. `const STORAGE_KEY = 'brewlight.progress';`.
`saveProgress` JSON-stringifies and calls `AsyncStorage.setItem`, wrapped
in try/catch that swallows any error (log via `console.warn`, do not
rethrow — persistence failures must never surface to the caller/UI).
`loadProgress` calls `AsyncStorage.getItem`, returns `null` if the key is
absent, the JSON fails to parse, or the parsed shape doesn't have
`day`/`money` both as `number` (write a small type guard rather than
trusting `JSON.parse`'s output blindly); wrapped in try/catch returning
`null` on any thrown error.

- [ ] **Step 5: Add this test file to `jest.config.js`'s `logic-tests` project**

This project's established convention (see every prior `*.test.ts` file):
pure-logic test files are listed explicitly in the `logic-tests` project's
`testMatch` array so they run under `testEnvironment: 'node'` rather than
the `react-tests` project.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx jest src/game/persistence.test.ts`
Expected: PASS, all 7 tests.

- [ ] **Step 7: Commit**

```bash
git add src/game/persistence.ts src/game/persistence.test.ts jest.config.js package.json package-lock.json
git commit -m "feat: add local persistence module for day/money progress"
```

---

## Task 2: Store Integration

**Files:**
- Modify: `src/state/gameStore.ts`
- Test: `src/state/gameStore.test.ts`

**Interfaces:**
- Consumes: `saveProgress`, `loadProgress`, `PersistedProgress` from Task 1
  (`src/game/persistence.ts`).
- Produces: adds to `GameState`/the store's action set:
  ```ts
  hydrateProgress: (data: PersistedProgress) => void;
  ```
  Task 3 imports `loadProgress` (Task 1) and `useGameStore` (this task) to
  wire the two together at app startup; it does not need any other new
  export from this task.

- [ ] **Step 1: Write failing tests**

```ts
test('hydrateProgress applies a loaded day and money onto the store', () => {
  useGameStore.getState().hydrateProgress({ day: 5, money: 120 });
  const s = useGameStore.getState();
  expect(s.day).toBe(5);
  expect(s.money).toBe(120);
});

test('deliverOrder persists the updated day/money', async () => {
  const saveProgress = jest.spyOn(require('../game/persistence'), 'saveProgress')
    .mockResolvedValue(undefined);
  useGameStore.getState().requestNextOrder();
  useGameStore.getState().beginOrder();
  useGameStore.getState().deliverOrder();
  await Promise.resolve(); // let the fire-and-forget save's microtask run
  expect(saveProgress).toHaveBeenCalledWith({
    day: useGameStore.getState().day,
    money: useGameStore.getState().money,
  });
});

test('startNextDay persists the updated day', async () => {
  const saveProgress = jest.spyOn(require('../game/persistence'), 'saveProgress')
    .mockResolvedValue(undefined);
  useGameStore.setState({ dayOver: true } as Partial<GameStore>);
  useGameStore.getState().startNextDay();
  await Promise.resolve();
  expect(saveProgress).toHaveBeenCalledWith({
    day: useGameStore.getState().day,
    money: useGameStore.getState().money,
  });
});
```

(These three tests join the existing `gameStore.test.ts` file and its
existing `beforeEach` reset — extend that reset object with any field this
task adds, same as every prior task that touched this file.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest src/state/gameStore.test.ts`
Expected: FAIL — `hydrateProgress` is not defined / `saveProgress` never called.

- [ ] **Step 3: Implement `hydrateProgress` and wire `saveProgress` calls**

`hydrateProgress(data)` is a plain `set({ day: data.day, money: data.money })`.
In `deliverOrder` and `startNextDay`, after the existing `set(...)` call,
read the fresh post-update state via `get()` and call
`saveProgress({ day: get().day, money: get().money })` — fire-and-forget
(do not `await` inside these synchronous store actions; per Task 1,
`saveProgress` never throws, so no `.catch` is needed either).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest src/state/gameStore.test.ts`
Expected: PASS (existing tests plus the 3 new ones).

- [ ] **Step 5: Commit**

```bash
git add src/state/gameStore.ts src/state/gameStore.test.ts
git commit -m "feat: wire persistence into the game store (hydrate + autosave)"
```

---

## Task 3: App Bootstrap

**Files:**
- Modify: `src/screens/GameScreen.tsx`

**Interfaces:**
- Consumes: `loadProgress` (Task 1), `useGameStore().hydrateProgress` (Task 2).
- Produces: nothing new for later tasks — this is a leaf integration point.

- [ ] **Step 1: Load and hydrate once on mount**

Add a `useEffect(() => { ... }, [])` in `GameScreen` that calls
`loadProgress()` and, if it resolves non-null, calls the store's
`hydrateProgress(result)`. This must run before the player can take any
action that calls `deliverOrder`/`startNextDay` — since those are only
reachable by tapping through the order board → station → delivery counter
loop (several fade transitions deep), and `loadProgress()` resolves from a
local read in well under a frame in practice, document this ordering
assumption in a one-line comment rather than adding a loading-gate UI (no
task in this plan asks for one, and the Global Constraint against ever
blocking the UI argues against gating render on this async call).

- [ ] **Step 2: Verify with a type-check and the full suite**

Run: `npx tsc --noEmit` — expect clean.
Run: `npx jest` — expect all suites passing (no new automated test for
this step; it's a thin effect wiring two already-tested units together,
consistent with this codebase's established pattern of leaving final UI
wiring to manual verification — see the original vertical-slice plan's
Task 8).

- [ ] **Step 3: Manual verification**

On a device/emulator: play through enough orders to end a day and start
the next (changing `day`/`money` from their defaults), fully close and
reopen the app, confirm the HUD's `Day N` and the day-summary's earnings
reflect the persisted values rather than resetting to `Day 1`/`$0`.

- [ ] **Step 4: Commit**

```bash
git add src/screens/GameScreen.tsx
git commit -m "feat: hydrate persisted progress on app launch"
```
