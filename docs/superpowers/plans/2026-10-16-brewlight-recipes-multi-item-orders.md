# Brewlight — Recipes & Multi-Item Orders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the core-loop slice with a second recipe (toast with butter) and
orders that contain 1–2 items, visiting one station per item before delivery.

**Architecture:** `Order` becomes `{ id, items: OrderItem[] }` (discriminated union
on `recipe`). The store tracks `itemIndex` and `preps: (ItemPrep | null)[]`; each
station reports its prep via `completeItem(prep)`, which routes to the next
item's station or to the delivery counter. `calculateReview` aggregates over
items. Pure logic (orders/review/routing) is test-first; scenes reuse the
existing `CupDraggable`/drop-zone pattern.

**Tech Stack:** Existing (Expo, R3F, zustand, jest-expo). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-16-cozy-cafe-design.md`
(sections "Loop central", "Receitas / menu", "Sistema de avaliação").

## Global Constraints

- Delivery is never blocked by validation; consequences only in the review.
- No visible timers or pressure; burn/slow only affect the review afterwards.
- Low-poly flat-shaded `MeshStandardMaterial`, Madeira & Âmbar palette.
- Landscape only; English strings for now (localization is a later plan).
- Review is rule-based per item (spec: "sistema simples baseado em regras").

---

## Task 1: Types, order generation, review aggregation (pure logic)

**Files:** Modify `src/game/types.ts`, `src/game/orders.ts`, `src/game/review.ts`;
Test `src/game/orders.test.ts`, `src/game/review.test.ts`.

**Interfaces:**
- Produces: `Recipe`, `OrderItem`, `Order`, `CoffeePrep`, `ToastPrep`, `ItemPrep`;
  `generateOrder(rng?)`; `calculateReview(order, preps: (ItemPrep|null)[])`;
  `TOAST_BURN_THRESHOLD_MS`.

- [ ] Write failing tests: orders have 1–2 items; rng deterministic; review per
  item (missing sugar, missing butter, burned toast, too slow coffee), null prep
  for any item → `order_never_prepared`, stars clamped to ≥1, preps shorter than
  items treated as null.
- [ ] Implement types + generator + review.
- [ ] Run `npx jest src/game` → PASS. Commit.

## Task 2: Store routing

**Files:** Modify `src/state/gameStore.ts`; Test `src/state/gameStore.test.ts`.

**Interfaces:** Consumes Task 1. Produces state `itemIndex`, `preps`; actions
`completeItem(prep: ItemPrep | null): SceneId` (records prep; returns next scene:
next item's station or `deliveryCounter`), `stationForItem(item)`, and
`deliverOrder()` (no args; uses `preps`, resets `itemIndex`/`preps`).
Replaces `pendingPrep`/`setPendingPrep`.

- [ ] Failing tests: single-item order routes straight to delivery; two-item
  order routes station → station → delivery; deliver with no preps is a valid
  worst-case review; deliver resets state; `requestNextOrder` resets progress.
- [ ] Implement; `npx jest src/state` → PASS. Commit.

## Task 3: Toast station + station wiring

**Files:** Create `src/scenes/ToastStation/ToastStation.tsx`,
`src/scenes/ToastStation/zones.ts` (+ test); Modify `CoffeeStation.tsx`,
`DeliveryCounter.tsx`, `OrderBoard.tsx`, `GameScene.tsx`, `types.ts` (`SceneId`
adds `'toastStation'`).

- [ ] Failing test for toast zones (`GRIDDLE_ZONE`, `BUTTER_ZONE`) via `resolveDropZone`.
- [ ] ToastStation: drag bread slice (generalized draggable) to the griddle, tap
  griddle to toast (records toast start), drag to butter, "done" records
  `ToastPrep { butterAdded, toastedMs }`.
- [ ] CoffeeStation "done" calls `completeItem` and starts the returned transition;
  OrderBoard starts the transition to the station of item 0; DeliveryCounter
  calls `deliverOrder()` then `requestNextOrder()`.
- [ ] `npx tsc --noEmit` and `npx jest` pass. Commit.

## Task 4: HUD + on-device verification

**Files:** Modify `src/screens/GameScreen.tsx`.

- [ ] Order label lists all items ("Coffee with sugar + Toast with butter").
- [ ] Run on the emulator: complete a 2-item order, confirm review star HUD updates.
- [ ] Commit.
