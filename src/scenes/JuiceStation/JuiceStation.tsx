import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
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

const BLENDER_POS: [number, number, number] = [APPLIANCE_ZONE.x, 0, -0.2];
const BLENDER_SCALE = 0.8;
// The jar sits on top of the motor base — roughly the top 55% of the model's
// normalized height (1.0 * BLENDER_SCALE). Lid rests at the jar mouth; liquid
// fills the jar body below it. Approximate (no separate lid/jar geometry
// exists — BLENDER is one baked mesh), tune once seen on-device.
const JAR_BASE_Y = 0.3 * BLENDER_SCALE;
const JAR_TOP_Y = 0.68 * BLENDER_SCALE;
const LID_Y = 0.72 * BLENDER_SCALE;
const LID_LIFT_SECONDS = 0.4;
// Baskets and fruit are sized for a phone touch target, not just readability —
// bumped up from an earlier pass that looked fine on a desktop preview but
// was too small to reliably grab on a real device.
const BASKET_SCALE = 0.42;
const FRUIT_SCALE = 0.2;

// Two staggered rows filling the back of the counter, to the right of the
// blender so nothing stands in front of them. Each basket's draggable fruit sits
// just ahead of it, close enough to read as "take one from this bowl". Spacing
// (0.5 between same-row baskets, 0.58 between rows) leaves a real gap around
// each ~0.42m-wide basket instead of them touching edge-to-edge.
const ROW_BACK = -0.9;
const ROW_FRONT = -0.32;
const FRUIT_GAP = 0.2;
const LAYOUT: { fruit: FruitId; basketX: number; basketZ: number }[] = [
  { fruit: 'orange', basketX: -0.75, basketZ: ROW_BACK },
  { fruit: 'lemon', basketX: -0.25, basketZ: ROW_BACK },
  { fruit: 'watermelon', basketX: 0.25, basketZ: ROW_BACK },
  { fruit: 'pineapple', basketX: 0.75, basketZ: ROW_BACK },
  { fruit: 'strawberry', basketX: 1.25, basketZ: ROW_BACK },
  { fruit: 'banana', basketX: -0.5, basketZ: ROW_FRONT },
  { fruit: 'chocolate', basketX: 0, basketZ: ROW_FRONT },
  { fruit: 'mango', basketX: 0.5, basketZ: ROW_FRONT },
  { fruit: 'vanilla', basketX: 1.0, basketZ: ROW_FRONT },
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
 * is what's locked in and used for review). The jar's lid pops open and its
 * level rises as soon as the first fruit lands, colored by whatever's
 * actually in there (never the order's real flavor — a wrong guess should
 * look wrong). Tapping the blender starts the process (same
 * startRef/Date.now() pattern as toast/pancakes); the glass is a separate
 * draggable that catches the pour visually while in APPLIANCE_ZONE and
 * processing is true, can detour through EXTRA_ZONE for ice, and is sent on
 * by dropping it on READY_ZONE — always accepted, blender touched or not,
 * ingredients right or wrong (never a dead end). Station state (including
 * the jar) resets the instant the glass reaches READY_ZONE.
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
      // The station stays mounted until the fade finishes, so reset right away —
      // the delivered glass shouldn't still look full if it's glimpsed mid-fade.
      setBowl(new Set());
      setProcessing(false);
      setExtraAdded(false);
      setCupZone(null);
      startRef.current = null;
      ingredientsUsedRef.current = null;
      startTransition(next);
    }
  };

  const bowlForDisplay = ingredientsUsedRef.current ?? bowl;
  const displayColor = liquidColorFor(bowlForDisplay);
  // Jar fill reads as "most recipes use 1-2 ingredients" — 3 ingredients looks full,
  // not just the rare 2-ingredient combos sitting at a meager 2/9.
  const jarFill = Math.min(bowlForDisplay.size / 3, 1);

  const lidRef = useRef<THREE.Mesh>(null);
  const liquidRef = useRef<THREE.Mesh>(null);
  const lidOpenRef = useRef(0);
  useFrame((_state, delta) => {
    const targetOpen = bowlForDisplay.size > 0 ? 1 : 0;
    lidOpenRef.current += Math.sign(targetOpen - lidOpenRef.current) *
      Math.min(Math.abs(targetOpen - lidOpenRef.current), delta / LID_LIFT_SECONDS);
    const t = lidOpenRef.current;
    if (lidRef.current) {
      lidRef.current.position.set(BLENDER_POS[0] + 0.22 * t, LID_Y + 0.12 * t, BLENDER_POS[2] - 0.08 * t);
      lidRef.current.rotation.z = t * 0.5;
    }
    if (liquidRef.current) {
      const h = Math.max(jarFill, 0.001);
      liquidRef.current.visible = jarFill > 0.01;
      liquidRef.current.scale.y = h;
      liquidRef.current.position.y = JAR_BASE_Y + ((JAR_TOP_Y - JAR_BASE_Y) * h) / 2;
    }
  });

  return (
    <group>
      {/* Counter surface */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[2.6 * tableScale, 0.1, 2.0 * tableScale]} />
        <meshStandardMaterial color={tableColor} {...materialProps} />
      </mesh>

      {/* Blender (Kenney, CC0); tap it to start blending whatever's in the bowl so far. */}
      <mesh position={BLENDER_POS} onPointerDown={handleBlend}>
        <ModelParts data={BLENDER} scale={BLENDER_SCALE} />
      </mesh>

      {/* Level rising inside the jar as fruit goes in — no separate lid/jar geometry
          exists on the baked BLENDER model, so this is a simple added cylinder, same
          approach as the cup's own CoffeeLiquid. */}
      <mesh ref={liquidRef} position={[BLENDER_POS[0], JAR_BASE_Y, BLENDER_POS[2]]} visible={false}>
        <cylinderGeometry args={[0.13, 0.12, JAR_TOP_Y - JAR_BASE_Y, 14]} />
        <meshStandardMaterial color={displayColor} roughness={0.3} />
      </mesh>

      {/* Lid: sits on the jar mouth, pops up and tilts aside once the first fruit goes in. */}
      <mesh ref={lidRef} position={[BLENDER_POS[0], LID_Y, BLENDER_POS[2]]}>
        <cylinderGeometry args={[0.145, 0.145, 0.03, 16]} />
        <meshStandardMaterial color="#2a2a2a" {...materialProps} />
      </mesh>

      <Steam active={processing} position={[BLENDER_POS[0], 0.35, BLENDER_POS[2]]} />

      {/* 9 decorative ingredient baskets, always visible — never draggable. */}
      {LAYOUT.map(({ fruit, basketX, basketZ }) => (
        <mesh key={fruit} position={[basketX, 0, basketZ]}>
          <ModelParts data={BASKET_MODELS[fruit]} scale={BASKET_SCALE} />
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
      {LAYOUT.map(({ fruit, basketX, basketZ }) => (
        <CupDraggable
          key={fruit}
          onDroppedOn={handleFruitDropped(fruit)}
          zones={[APPLIANCE_ZONE]}
          origin={{ x: basketX, z: basketZ + FRUIT_GAP }}
          y={0.03}
        >
          <ModelParts data={FRUIT_MODELS[fruit]} scale={FRUIT_SCALE} offsetY={-0.03} />
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
