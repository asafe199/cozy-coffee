import React, { useRef, useState } from 'react';
import { levelConfig } from '../../game/levels';
import { useGameStore } from '../../state/gameStore';
import { stationForItem } from '../../game/orders';
import { CupDraggable } from '../CoffeeStation/CupDraggable';
import { Steam } from '../shared/props/Steam';
import { ReadyMarker } from '../shared/props/ReadyMarker';
import { ModelParts } from '../shared/props/ModelParts';
import { CoffeeLiquid } from '../shared/props/CoffeeLiquid';
import { BLENDER, GLASS } from '../shared/props/models.generated';
import { READY_ZONE } from '../CoffeeStation/dropZones';
import { APPLIANCE_ZONE, EXTRA_ZONE } from './dropZones';
import { BASKET_MODELS, FRUIT_MODELS, JUICE_FLAVORS, JUICE_FLAVOR_IDS } from './flavors';
import type { FruitId, JuiceFlavor } from '../../game/types';

const materialProps = { flatShading: true, roughness: 0.8, metalness: 0.05 } as const;

// Two staggered rows of baskets behind the blender (5 + 4 = 9 ingredients),
// each with its own small draggable fruit resting just in front of its basket.
// Low-risk layout/tuning, per the design doc ("builder's call").
const LAYOUT: { fruit: FruitId; basketX: number; basketZ: number; originX: number; originZ: number }[] = [
  { fruit: 'orange', basketX: -1.0, basketZ: -0.4, originX: -1.0, originZ: -0.2 },
  { fruit: 'lemon', basketX: -0.5, basketZ: -0.4, originX: -0.5, originZ: -0.2 },
  { fruit: 'watermelon', basketX: 0, basketZ: -0.4, originX: 0, originZ: -0.2 },
  { fruit: 'pineapple', basketX: 0.5, basketZ: -0.4, originX: 0.5, originZ: -0.2 },
  { fruit: 'strawberry', basketX: 1.0, basketZ: -0.4, originX: 1.0, originZ: -0.2 },
  { fruit: 'banana', basketX: -0.75, basketZ: -0.75, originX: -0.75, originZ: -0.55 },
  { fruit: 'chocolate', basketX: -0.25, basketZ: -0.75, originX: -0.25, originZ: -0.55 },
  { fruit: 'mango', basketX: 0.25, basketZ: -0.75, originX: 0.25, originZ: -0.55 },
  { fruit: 'vanilla', basketX: 0.75, basketZ: -0.75, originX: 0.75, originZ: -0.55 },
];

const NEUTRAL_LIQUID_COLOR = '#8a7a5a';

/** Cosmetic only: the glass's liquid color reflects what was ACTUALLY blended, not the order. */
function liquidColorFor(used: Set<FruitId>): string {
  if (used.size === 0) return NEUTRAL_LIQUID_COLOR;
  const key = [...used].sort().join(',');
  const exact = JUICE_FLAVOR_IDS.find((f) => [...JUICE_FLAVORS[f].ingredients].sort().join(',') === key);
  if (exact) return JUICE_FLAVORS[exact].color;
  // No exact recipe match (wrong combo): fall back to the first ingredient's own single-fruit color.
  const first = [...used][0];
  const single = JUICE_FLAVOR_IDS.find(
    (f) => JUICE_FLAVORS[f].ingredients.length === 1 && JUICE_FLAVORS[f].ingredients[0] === first
  );
  return single ? JUICE_FLAVORS[single].color : NEUTRAL_LIQUID_COLOR;
}

/**
 * Juice/milkshake station: bespoke (not RecipeStation-driven), because the
 * interaction is "drag several small ingredients into the blender" rather
 * than "one item, one optional extra". 9 ingredient baskets sit behind the
 * blender, always visible; each has its own tiny draggable fruit whose only
 * valid drop target is APPLIANCE_ZONE. Dropping a fruit there adds it to a
 * local Set (no undo, no limit — the set at the moment the blender is tapped
 * is what's locked in and used for review). Tapping the blender starts the
 * process (same startRef/Date.now() pattern as toast/pancakes); the glass is
 * a separate draggable that catches the pour visually while in
 * APPLIANCE_ZONE and processing is true, can detour through EXTRA_ZONE for
 * ice, and is sent on by dropping it on READY_ZONE — always accepted, blender
 * touched or not, ingredients right or wrong (never a dead end).
 */
export function JuiceStation() {
  const completeItem = useGameStore((state) => state.completeItem);
  const startTransition = useGameStore((state) => state.startTransition);
  const isTransitioning = useGameStore((state) => state.isTransitioning);
  const level = useGameStore((state) => state.level);
  const { tableScale, tableColor } = levelConfig(level);
  const isActive = useGameStore(
    (state) =>
      !!state.currentOrder &&
      stationForItem(state.currentOrder.items[state.itemIndex] ?? state.currentOrder.items[0]) === 'juiceStation'
  );
  const currentItem = useGameStore(
    (state) => state.currentOrder?.items[state.itemIndex] ?? state.currentOrder?.items[0] ?? null
  );
  const requestedFlavor: JuiceFlavor | null =
    currentItem && currentItem.recipe === 'juice' ? currentItem.flavor : null;

  const startRef = useRef<number | null>(null);
  // Frozen at blend-start time; fruits dropped in afterward keep landing in the
  // blender visually (never blocked) but stop affecting the locked-in result.
  const ingredientsUsedRef = useRef<Set<FruitId> | null>(null);
  const [bowl, setBowl] = useState<Set<FruitId>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [cupZone, setCupZone] = useState<string | null>(null);
  const [extraAdded, setExtraAdded] = useState(false);

  const handleFruitDropped = (fruit: FruitId) => (zoneId: string | null) => {
    if (zoneId === APPLIANCE_ZONE.id) {
      setBowl((prev) => (prev.has(fruit) ? prev : new Set(prev).add(fruit)));
    }
  };

  const handleBlend = () => {
    if (isTransitioning || processing) {
      return;
    }
    startRef.current = Date.now();
    ingredientsUsedRef.current = new Set(bowl);
    setProcessing(true);
  };

  const handleGlassDroppedOn = (zoneId: string | null) => {
    setCupZone(zoneId);
    if (zoneId === EXTRA_ZONE.id) {
      setExtraAdded(true);
    }
    if (zoneId === READY_ZONE.id) {
      if (isTransitioning || !isActive) {
        return;
      }
      const start = startRef.current;
      const next = completeItem(
        start === null
          ? null
          : {
              recipe: 'juice',
              // shortcut: falls back to 'orange' if somehow reached while inactive; isActive
              // guards this in practice, so requestedFlavor is never actually null here.
              flavor: requestedFlavor ?? 'orange',
              ingredientsUsed: Array.from(ingredientsUsedRef.current ?? new Set<FruitId>()),
              extraAdded,
              processMs: Date.now() - start,
            }
      );
      startTransition(next);
    }
  };

  const displayColor = liquidColorFor(ingredientsUsedRef.current ?? bowl);

  return (
    <group>
      {/* Counter surface */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[2.6 * tableScale, 0.1, 2.0 * tableScale]} />
        <meshStandardMaterial color={tableColor} {...materialProps} />
      </mesh>

      {/* Blender (Kenney, CC0); tap it to start blending whatever's in the bowl so far. */}
      <mesh position={[0, 0, -0.1]} onPointerDown={handleBlend}>
        <ModelParts data={BLENDER} scale={0.8} />
      </mesh>
      <Steam active={processing} position={[0, 0.35, -0.1]} />

      {/* 9 decorative ingredient baskets, always visible — never draggable. */}
      {LAYOUT.map(({ fruit, basketX, basketZ }) => (
        <mesh key={fruit} position={[basketX, 0, basketZ]}>
          <ModelParts data={BASKET_MODELS[fruit]} scale={0.32} />
        </mesh>
      ))}

      {/* Ice bucket beside EXTRA_ZONE, same visual as the old RecipeStation juice spec. */}
      <group position={[EXTRA_ZONE.x, 0, EXTRA_ZONE.z + 0.25]}>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.1, 12]} />
          <meshStandardMaterial color="#8fb8d6" {...materialProps} />
        </mesh>
        {[-0.04, 0.03, 0].map((x, i) => (
          <mesh key={i} position={[x, 0.11, (i - 1) * 0.03]} rotation={[0.3 * i, 0.5 * i, 0]}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshStandardMaterial color="#d9f1ff" transparent opacity={0.85} {...materialProps} />
          </mesh>
        ))}
      </group>

      {/* One small draggable fruit per ingredient; its only valid drop target is the blender. */}
      {LAYOUT.map(({ fruit, originX, originZ }) => (
        <CupDraggable
          key={fruit}
          onDroppedOn={handleFruitDropped(fruit)}
          zones={[APPLIANCE_ZONE]}
          origin={{ x: originX, z: originZ }}
          y={0.03}
        >
          <ModelParts data={FRUIT_MODELS[fruit]} scale={0.13} offsetY={-0.03} />
        </CupDraggable>
      ))}

      <CupDraggable onDroppedOn={handleGlassDroppedOn} zones={[APPLIANCE_ZONE, EXTRA_ZONE, READY_ZONE]} y={0.04}>
        <ModelParts data={GLASS} scale={0.28} offsetY={-0.04} />
        <CoffeeLiquid
          filled={processing && cupZone === APPLIANCE_ZONE.id}
          color={displayColor}
          baseY={-0.03}
          radius={0.065}
          maxHeight={0.12}
        />
      </CupDraggable>

      <ReadyMarker position={[READY_ZONE.x, 0.06, READY_ZONE.z]} />
    </group>
  );
}
