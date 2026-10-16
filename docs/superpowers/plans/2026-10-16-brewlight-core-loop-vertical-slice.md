# Brewlight — Core Loop Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and prove the foundational Brewlight gameplay loop end to end —
view one coffee order, cut (fade) to the coffee station, prepare it by
dragging objects, deliver it, and receive a rule-based review — on the
approved stack, so the rest of the game (more recipes, progression, economy,
localization) can be built on a validated foundation.

**Architecture:** A single-screen Expo/React Native app. A Zustand store
holds all game state (current scene, current order, transition flag, review
log) and exposes pure actions; it has no knowledge of rendering. A
`@react-three/fiber` `<Canvas>` (running natively via `expo-gl`, not a
WebView) renders one of three scene groups — order board, coffee station,
delivery counter — chosen by the store's `scene` field. Scene changes are
hard cuts, not camera pans: a full-screen overlay fades to black, the store
swaps `scene`, the overlay fades back in. Drag interactions use
`react-native-gesture-handler` + `react-native-reanimated` shared values,
read into the 3D scene each frame via R3F's `useFrame`.

**Tech Stack:** Expo (TypeScript template), `expo-gl`, `@react-three/fiber`,
`@react-three/drei`, `react-native-gesture-handler`, `react-native-reanimated`,
`zustand`. Test runner: `jest` with the `jest-expo` preset.

**Spec:** `D:\workspace\hub\cozy-cafe\docs\superpowers\specs\2026-10-16-cozy-cafe-design.md`

## Scope note

The design doc covers a full game (5 progression levels, multiple recipes,
multi-item orders, day/shift clock, 3 languages, IAP paywall, audio). That
is too much for one plan and one subsystem — this plan intentionally covers
only the **first vertical slice**: a single recipe (coffee), a single
pending order at a time, no progression/economy, no localization (English
strings only), no audio, no persistence. Each of those is a separate
subsystem and gets its own follow-up plan once this slice is proven to
work and feel right on-device. Building the slice first validates the
riskiest unknowns (R3F-on-native performance, the fade-cut feel, the drag
gesture feel) before investing in content breadth.

## Global Constraints

- Orientation is landscape-only (spec: "Orientação do dispositivo: paisagem").
- 3D visual style is low-poly stylized: simple geometry (boxes, cylinders,
  cones), flat-shaded `MeshStandardMaterial`, warm palette, no real-time
  global illumination, no heavy PBR (spec: "Estilo visual"). Reuse the
  approved reference scene's geometry/material approach at
  `.superpowers/brainstorm/843-1792170485/content/preview-3d-lowpoly-v2.html`.
- Prefer established open-source libraries over custom equivalents —
  `@react-three/drei`, `react-native-gesture-handler`,
  `react-native-reanimated`, `zustand` — per spec's "Performance e
  bibliotecas" constraint. Write custom code only for game-specific logic.
- Delivery is never blocked by validation. A player can always deliver
  whatever prep state exists, correct or not — consequences only ever show
  up afterward, in the review (spec: "Não existe bloqueio de entrega").
- No hard timers, no punishing mid-action feedback, nothing that creates
  pressure while the player is acting (spec anti-meta: the game must never
  become stressful).
- Stack is React Native + Expo + React Three Fiber via `expo-gl` — not a
  WebView/Capacitor wrapper (spec: "Empacotamento mobile").

## Review Focus

- Delivering before ever visiting the coffee station (`prep` is `null`) —
  must produce a valid (worst-case) review, not a crash. Covered in Task 4.
- Double-triggering a scene transition while one is already in flight
  (e.g. rapid double-tap) — must be a no-op, not a corrupted/stuck scene
  state. Covered in Task 2.
- Order generation must be deterministic under test (seedable RNG) so the
  sugar-preference randomness doesn't produce flaky tests. Covered in
  Task 3.
- Releasing the dragged cup outside any valid drop zone — must resolve to
  a defined zone (e.g. snap back to origin), never leave the interaction in
  an undefined state. Covered in Task 6.
- First launch has no current order yet — the store's initial state must
  represent "no order" distinctly from "has an order with no items done",
  and the UI must not assume `currentOrder` is always defined. Covered in
  Task 2.

---

## Task 1: Project Scaffold

**Files:**
- Create: `app.json`, `package.json`, `tsconfig.json`, `App.tsx` (via Expo
  TypeScript template)
- Create: `jest.config.js`
- Create: `jest.setup.js`

**Interfaces:**
- Produces: a bootable Expo + TypeScript project at the repo root
  (`D:\workspace\hub\cozy-cafe`) with all runtime and test dependencies
  installed. Every later task assumes this structure exists.

- [ ] **Step 1: Scaffold the Expo TypeScript app in place**

Run: `npx create-expo-app@latest . --template blank-typescript` (from
`D:\workspace\hub\cozy-cafe`)

- [ ] **Step 2: Install runtime dependencies at Expo-compatible versions**

Run: `npx expo install three @react-three/fiber @react-three/drei expo-gl expo-gl-cpp zustand react-native-gesture-handler react-native-reanimated`

- [ ] **Step 3: Install test dependencies**

Run: `npm install --save-dev jest jest-expo @testing-library/react-native @types/three`

- [ ] **Step 4: Configure Jest**

`jest.config.js` uses `preset: 'jest-expo'` and
`setupFiles: ['./jest.setup.js']`. `jest.setup.js` contains
`import 'react-native-reanimated/mock';` plus the gesture-handler Jest
setup (`import 'react-native-gesture-handler/jestSetup';`).

- [ ] **Step 5: Set landscape-only orientation**

In `app.json`, under `expo`, set `"orientation": "landscape"`.

- [ ] **Step 6: Verify the scaffold boots**

Run: `npx expo start`, open in a simulator or Expo Go.
Expected: the default template screen loads in landscape with no red-screen
error.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Brewlight Expo project"
```

---

## Task 2: Core Types + Game Store

**Files:**
- Create: `src/game/types.ts`
- Create: `src/state/gameStore.ts`
- Test: `src/state/gameStore.test.ts`

**Interfaces:**
- Consumes: nothing (first logic task).
- Produces (`src/game/types.ts`):
  ```ts
  export type SceneId = 'orderBoard' | 'coffeeStation' | 'deliveryCounter';
  export interface Order { id: string; recipe: 'coffee'; wantsSugar: boolean; }
  export interface CoffeePrep { sugarAdded: boolean; prepTimeMs: number; }
  export interface ReviewResult { stars: 1 | 2 | 3 | 4 | 5; comments: string[]; }
  ```
- Produces (`src/state/gameStore.ts`), a Zustand store with this shape:
  ```ts
  interface GameState {
    scene: SceneId;
    isTransitioning: boolean;
    pendingScene: SceneId | null;
    currentOrder: Order | null;
    reviews: ReviewResult[];
    requestNextOrder: () => void;
    startTransition: (target: SceneId) => void;
    completeTransition: () => void;
    deliverOrder: (prep: CoffeePrep | null) => void;
  }
  ```
  Later tasks (3, 4, 5, 7, 8) import `useGameStore` and these exact field
  and method names.

- [ ] **Step 1: Write failing store tests**

```ts
test('initial state has no current order and is not transitioning', () => {
  const s = useGameStore.getState();
  expect(s.currentOrder).toBeNull();
  expect(s.isTransitioning).toBe(false);
  expect(s.scene).toBe('orderBoard');
});

test('startTransition sets isTransitioning and pendingScene', () => {
  useGameStore.getState().startTransition('coffeeStation');
  const s = useGameStore.getState();
  expect(s.isTransitioning).toBe(true);
  expect(s.pendingScene).toBe('coffeeStation');
  expect(s.scene).toBe('orderBoard'); // not swapped yet
});

test('startTransition is a no-op while already transitioning', () => {
  useGameStore.getState().startTransition('coffeeStation');
  useGameStore.getState().startTransition('deliveryCounter');
  expect(useGameStore.getState().pendingScene).toBe('coffeeStation');
});

test('completeTransition swaps scene and clears the flag', () => {
  useGameStore.getState().startTransition('coffeeStation');
  useGameStore.getState().completeTransition();
  const s = useGameStore.getState();
  expect(s.scene).toBe('coffeeStation');
  expect(s.isTransitioning).toBe(false);
  expect(s.pendingScene).toBeNull();
});

test('deliverOrder appends a review and clears currentOrder', () => {
  useGameStore.getState().requestNextOrder();
  useGameStore.getState().deliverOrder({ sugarAdded: true, prepTimeMs: 1000 });
  const s = useGameStore.getState();
  expect(s.reviews).toHaveLength(1);
  expect(s.currentOrder).toBeNull();
});
```

(Reset the store's state before each test, e.g. via a `beforeEach` that
calls `useGameStore.setState(initialState, true)`.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest src/state/gameStore.test.ts`
Expected: FAIL — `useGameStore` is not defined.

- [ ] **Step 3: Implement `src/game/types.ts` and `src/state/gameStore.ts`**

`deliverOrder(prep)` calls `calculateReview` — for this task, inline a
placeholder that returns `{ stars: 5, comments: [] }` (Task 4 replaces it
with the real import once `review.ts` exists, and re-running this task's
tests must still pass unchanged since they only assert review *count*, not
content).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest src/state/gameStore.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/types.ts src/state/gameStore.ts src/state/gameStore.test.ts
git commit -m "feat: add game store with scene transition guard"
```

---

## Task 3: Order Generation

**Files:**
- Create: `src/game/orders.ts`
- Test: `src/game/orders.test.ts`

**Interfaces:**
- Consumes: `Order` from `src/game/types.ts` (Task 2).
- Produces:
  ```ts
  export function generateOrder(rng?: () => number): Order;
  ```
  Task 2's store imports this in `requestNextOrder` once this task lands
  (wire it in this task's implementation step, replacing any placeholder).

- [ ] **Step 1: Write failing tests**

```ts
test('generateOrder returns a coffee order with a unique id', () => {
  const a = generateOrder();
  const b = generateOrder();
  expect(a.recipe).toBe('coffee');
  expect(a.id).not.toBe(b.id);
});

test('generateOrder is deterministic for a given rng', () => {
  const fixedRng = () => 0.1; // < 0.5 → wantsSugar true, per implementation
  const order = generateOrder(fixedRng);
  expect(order.wantsSugar).toBe(true);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest src/game/orders.test.ts`
Expected: FAIL — `generateOrder` is not defined.

- [ ] **Step 3: Implement `generateOrder` in `src/game/orders.ts`**

Default parameter `rng: () => number = Math.random`. `id` from
`` `order-${Date.now()}-${Math.floor(rng() * 1e6)}` ``. `wantsSugar: rng() < 0.5`.
Wire `useGameStore`'s `requestNextOrder` (Task 2) to call
`generateOrder()` for its real implementation.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest src/game/orders.test.ts src/state/gameStore.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/orders.ts src/game/orders.test.ts src/state/gameStore.ts
git commit -m "feat: add deterministic order generation"
```

---

## Task 4: Review Calculation

**Files:**
- Create: `src/game/review.ts`
- Test: `src/game/review.test.ts`

**Interfaces:**
- Consumes: `Order`, `CoffeePrep`, `ReviewResult` from `src/game/types.ts`
  (Task 2).
- Produces:
  ```ts
  export const PREP_TIME_THRESHOLD_MS = 8000;
  export function calculateReview(order: Order, prep: CoffeePrep | null): ReviewResult;
  ```
  Task 2's store wires `deliverOrder` to call this for real (replacing its
  placeholder) once this task lands.

- [ ] **Step 1: Write failing tests**

```ts
const order: Order = { id: '1', recipe: 'coffee', wantsSugar: true };

test('never-prepared delivery (prep is null) is worst-case, not a crash', () => {
  const result = calculateReview(order, null);
  expect(result.stars).toBe(1);
  expect(result.comments).toContain('order_never_prepared');
});

test('perfect prep within time, correct sugar, yields 5 stars with no comments', () => {
  const result = calculateReview(order, { sugarAdded: true, prepTimeMs: 1000 });
  expect(result.stars).toBe(5);
  expect(result.comments).toHaveLength(0);
});

test('missing requested sugar lowers stars and adds a comment', () => {
  const result = calculateReview(order, { sugarAdded: false, prepTimeMs: 1000 });
  expect(result.stars).toBe(4);
  expect(result.comments).toContain('missing_sugar');
});

test('prep time over the threshold lowers stars and adds a comment', () => {
  const result = calculateReview(order, { sugarAdded: true, prepTimeMs: 9000 });
  expect(result.stars).toBe(4);
  expect(result.comments).toContain('too_slow');
});

test('stars never drop below 1 even with every rule failing', () => {
  const result = calculateReview(order, { sugarAdded: false, prepTimeMs: 20000 });
  expect(result.stars).toBeGreaterThanOrEqual(1);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest src/game/review.test.ts`
Expected: FAIL — `calculateReview` is not defined.

- [ ] **Step 3: Implement `calculateReview` in `src/game/review.ts`**

`prep === null` short-circuits to `{ stars: 1, comments: ['order_never_prepared'] }`.
Otherwise start `stars = 5`, push `'missing_sugar'` and decrement if
`order.wantsSugar !== prep.sugarAdded`, push `'too_slow'` and decrement if
`prep.prepTimeMs > PREP_TIME_THRESHOLD_MS`, clamp `stars` to a minimum of 1.
Wire `useGameStore`'s `deliverOrder` (Task 2) to call this for real.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest src/game/review.test.ts src/state/gameStore.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game/review.ts src/game/review.test.ts src/state/gameStore.ts
git commit -m "feat: add rule-based review calculation"
```

---

## Task 5: Fade Transition Component

**Files:**
- Create: `src/scenes/FadeTransition/FadeTransition.tsx`

**Interfaces:**
- Consumes: `useGameStore` (`isTransitioning`, `completeTransition`) from
  Task 2.
- Produces: `<FadeTransition />` — a full-screen black `Animated.View`
  overlay, rendered once in `GameScreen` (Task 8) above the 3D canvas.
  No props; it reads the store directly.

- [ ] **Step 1: Implement `FadeTransition`**

A `View` with `position: 'absolute'`, `inset: 0`, `backgroundColor: 'black'`,
whose `opacity` is a reanimated shared value. A `useEffect` on
`isTransitioning`: when it becomes `true`, `withTiming(opacity, 1, {duration: 250})`,
and on the animation's `onFinish` callback call the store's
`completeTransition()` then `withTiming(opacity, 0, {duration: 250})` to fade
back in. `pointerEvents="none"` so it never blocks touches once transparent.

- [ ] **Step 2: Manual verification**

Run the app, call `startTransition('coffeeStation')` from a temporary debug
button, confirm the screen fades to black and back, and that `scene` in the
store only changes while the screen is fully black (no visible scene pop).

- [ ] **Step 3: Commit**

```bash
git add src/scenes/FadeTransition/FadeTransition.tsx
git commit -m "feat: add fade-cut transition overlay"
```

---

## Task 6: Drop Zones + Draggable Cup

**Files:**
- Create: `src/scenes/CoffeeStation/dropZones.ts`
- Test: `src/scenes/CoffeeStation/dropZones.test.ts`
- Create: `src/scenes/CoffeeStation/CupDraggable.tsx`

**Interfaces:**
- Produces (`dropZones.ts`):
  ```ts
  export interface Zone { id: string; x: number; z: number; radius: number; }
  export const MACHINE_ZONE: Zone;
  export const SUGAR_ZONE: Zone;
  export function resolveDropZone(position: { x: number; z: number }, zones: Zone[]): Zone | null;
  ```
- Produces (`CupDraggable.tsx`): `<CupDraggable onDroppedOn={(zoneId: string | null) => void} />`,
  a draggable R3F mesh used inside `CoffeeStation` (Task 7).

- [ ] **Step 1: Write failing `resolveDropZone` tests**

```ts
const zones: Zone[] = [{ id: 'machine', x: 0, z: 0, radius: 0.3 }];

test('position inside a zone resolves to that zone', () => {
  expect(resolveDropZone({ x: 0.1, z: 0.1 }, zones)?.id).toBe('machine');
});

test('position outside every zone resolves to null', () => {
  expect(resolveDropZone({ x: 5, z: 5 }, zones)).toBeNull();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest src/scenes/CoffeeStation/dropZones.test.ts`
Expected: FAIL — `resolveDropZone` is not defined.

- [ ] **Step 3: Implement `dropZones.ts`**

`resolveDropZone` returns the first zone where the Euclidean distance from
`position` to `(zone.x, zone.z)` is `<= zone.radius`, else `null`.
`MACHINE_ZONE` and `SUGAR_ZONE` are concrete coordinates matched to
`CoffeeStation`'s layout (defined together with Task 7, since the two must
agree on the same coordinate space — `CoffeeStation` positions its meshes
at exactly these zone centers).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest src/scenes/CoffeeStation/dropZones.test.ts`
Expected: PASS

- [ ] **Step 5: Implement `CupDraggable`**

A `react-native-gesture-handler` `Gesture.Pan()` drives a reanimated
`{x, z}` shared-value position; an R3F `useFrame` writes that value onto
the cup mesh's `position` each frame (reanimated shared values must be read
with `.value` inside `useFrame`, not bound reactively, since R3F renders
outside React's commit cycle). On gesture end, call
`resolveDropZone(currentPosition, [MACHINE_ZONE, SUGAR_ZONE])`; if `null`,
animate the shared value back to the cup's origin position
(`withSpring`); otherwise animate it to the resolved zone's center and
call `onDroppedOn(zone.id)`.

- [ ] **Step 6: Manual verification**

Run the app with `CupDraggable` rendered standalone (temporary test scene),
drag the cup onto the machine zone and confirm it snaps there; drag it to
empty space and confirm it springs back to origin instead of sticking.

- [ ] **Step 7: Commit**

```bash
git add src/scenes/CoffeeStation/dropZones.ts src/scenes/CoffeeStation/dropZones.test.ts src/scenes/CoffeeStation/CupDraggable.tsx
git commit -m "feat: add drop-zone resolution and draggable cup"
```

---

## Task 7: Scene Assembly (Order Board, Coffee Station, Delivery Counter)

**Files:**
- Create: `src/scenes/OrderBoard/OrderBoard.tsx`
- Create: `src/scenes/CoffeeStation/CoffeeStation.tsx`
- Create: `src/scenes/DeliveryCounter/DeliveryCounter.tsx`
- Create: `src/scenes/GameScene.tsx`
- Modify: `src/state/gameStore.ts` — add `pendingPrep: CoffeePrep | null`
  and `setPendingPrep: (prep: CoffeePrep | null) => void` to `GameState`,
  mirroring how `pendingScene` is already handled.

**Interfaces:**
- Consumes: `useGameStore` (Task 2), `CupDraggable` + zones (Task 6).
- Produces: `<GameScene />` — the `<Canvas>` root rendered by `GameScreen`
  (Task 8). Internally switches between the three scene components based on
  `scene` from the store. Produces the `pendingPrep`/`setPendingPrep`
  additions to `GameState` that `GameScreen` (Task 8) does not need but
  later recipe-expansion plans will reuse.

- [ ] **Step 1: Implement `OrderBoard`**

An R3F group: a flat board mesh plus `@react-three/drei`'s `<Text>` showing
the current order (`"Coffee" + (wantsSugar ? " with sugar" : "")`, or a
"no order yet" placeholder when `currentOrder` is `null`). A drei `<Html>`
or a mesh used as a tap target calls `requestNextOrder()` (Task 2's store,
only when `currentOrder` is `null`) then `startTransition('coffeeStation')`.

- [ ] **Step 2: Implement `CoffeeStation`**

Reuse the low-poly geometry/material approach from the approved preview
(`preview-3d-lowpoly-v2.html`): machine body (`BoxGeometry`), spout, two
knobs, positioned so the machine's drop point matches `MACHINE_ZONE` from
Task 6. Place `CupDraggable` in the scene. A sugar packet mesh at
`SUGAR_ZONE`. A "pour" trigger (tap on the machine once the cup is on
`MACHINE_ZONE`) that marks the coffee as poured. A visible "done" trigger
(only enabled once poured) that computes
`{ sugarAdded: <cup touched SUGAR_ZONE>, prepTimeMs: <elapsed since station entry> }`
and calls `startTransition('deliveryCounter')`, stashing the computed prep
for `DeliveryCounter` to read (lift it into the store as a new
`pendingPrep: CoffeePrep | null` field — extend `GameState` from Task 2
with this field and a `setPendingPrep` action, following the same pattern
as `pendingScene`).

- [ ] **Step 3: Implement `DeliveryCounter`**

A counter mesh. A tap target calls `deliverOrder(pendingPrep)` (Task 2/4),
then `requestNextOrder()`, then `startTransition('orderBoard')`.

- [ ] **Step 4: Implement `GameScene`**

A `<Canvas>` with the lighting setup from the approved preview (hemisphere
+ directional light, matching warm palette). Renders `OrderBoard`,
`CoffeeStation`, or `DeliveryCounter` based on `scene` from the store —
never more than one at a time, so `isTransitioning` always hides the
outgoing scene before the incoming one mounts (rely on `FadeTransition`,
Task 5, to guarantee the swap happens while the screen is black).

- [ ] **Step 5: Manual verification**

Run the app end to end: see the order board with a generated order, tap to
go to the coffee station (screen fades), drag the cup to the machine and
pour, drag it to the sugar packet (or skip it), mark done, fade to the
delivery counter, tap to deliver, fade back to the order board with a new
order and the review reflected (temporary console.log of `reviews` is
acceptable here — Task 8 adds the real HUD).

- [ ] **Step 6: Commit**

```bash
git add src/scenes/OrderBoard src/scenes/CoffeeStation/CoffeeStation.tsx src/scenes/DeliveryCounter src/scenes/GameScene.tsx src/state/gameStore.ts
git commit -m "feat: assemble order board, coffee station, and delivery counter scenes"
```

---

## Task 8: Game Screen + HUD

**Files:**
- Create: `src/screens/GameScreen.tsx`
- Modify: `App.tsx`

**Interfaces:**
- Consumes: `GameScene` (Task 7), `FadeTransition` (Task 5), `useGameStore`
  (Task 2).
- Produces: `<GameScreen />`, the app's single screen.

- [ ] **Step 1: Implement `GameScreen`**

Renders `GameScene` (Task 7) filling the screen, `FadeTransition` (Task 5)
as a sibling overlay on top, and a minimal HUD `Text` in a corner showing
the most recent review's stars (`reviews[reviews.length - 1]?.stars`), so
the full loop's outcome is visible without relying on console logs.

- [ ] **Step 2: Wire `App.tsx`**

`App.tsx` renders `GestureHandlerRootView` (required root wrapper for
`react-native-gesture-handler`) containing `GameScreen`.

- [ ] **Step 3: Full manual verification pass**

Run: `npx expo start`, launch on a physical mid-range Android device or
iOS device (not only a simulator — this is the first real check of the
spec's "performático" / mobile-performance constraint). Play through at
least 3 full order cycles. Confirm: landscape orientation is enforced, the
fade cut never shows a visual pop of the new scene before the screen is
black, dragging the cup feels responsive (no visible lag between finger and
object), and the HUD star count updates correctly after each delivery,
including a delivery with no sugar (4 stars) and a delivery of `null` prep
by backing out without visiting the station if that path is reachable from
the UI (1 star, no crash).

- [ ] **Step 4: Run the full test suite**

Run: `npx jest`
Expected: all tests from Tasks 2-4 and 6 PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/GameScreen.tsx App.tsx
git commit -m "feat: wire game screen and complete core loop vertical slice"
```
