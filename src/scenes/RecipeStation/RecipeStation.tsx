import React, { useEffect, useRef, useState } from 'react';
import { levelConfig } from '../../game/levels';
import { useGameStore } from '../../state/gameStore';
import { stationForItem } from '../../game/orders';
import { CupDraggable } from '../CoffeeStation/CupDraggable';
import { ReadyMarker } from '../shared/props/ReadyMarker';
import { ModelParts } from '../shared/props/ModelParts';
import { Flame } from '../shared/props/Flame';
import { RecipeItemView } from './RecipeItemView';
import { SPECS } from './specs';
import { READY_ZONE } from '../CoffeeStation/dropZones';
import { TOAST_MIN_MS, TOAST_BURN_THRESHOLD_MS } from '../../game/review';
import type { ExtraRecipe } from '../../game/types';

const materialProps = { flatShading: true, roughness: 0.8, metalness: 0.05 } as const;
const BURN_DARK = '#2a1810';

function lerpHex(a: string, b: string, t: number): string {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const b2 = Math.round(ab + (bb - ab) * t);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b2).toString(16).slice(1)}`;
}

// Pancakes-only: gold at TOAST_MIN_MS (just cooked), gradually darkening to burnt by
// TOAST_BURN_THRESHOLD_MS, mirroring the toast station's time-based doneness.
function cookTintFor(elapsedMs: number, baseTint: string): string {
  const t = Math.min(1, Math.max(0, (elapsedMs - TOAST_MIN_MS) / (TOAST_BURN_THRESHOLD_MS - TOAST_MIN_MS)));
  return lerpHex(baseTint, BURN_DARK, t);
}

/**
 * Generic station for juice, pancakes and salad: drag the item onto the
 * appliance, tap the appliance to run it, optionally drag the item to the
 * extra (ice / honey / dressing), then drag it onto the READY_ZONE marker to
 * send it on. Like the toast station, the player is never blocked: skipping
 * steps only costs stars in the review, and an untouched station records a
 * null prep.
 */
export function RecipeStation({ recipe }: { recipe: ExtraRecipe }) {
  const spec = SPECS[recipe];
  const completeItem = useGameStore((state) => state.completeItem);
  const startTransition = useGameStore((state) => state.startTransition);
  const isTransitioning = useGameStore((state) => state.isTransitioning);
  const level = useGameStore((state) => state.level);
  const { tableScale, tableColor } = levelConfig(level);
  const isActive = useGameStore(
    (state) =>
      !!state.currentOrder &&
      stationForItem(state.currentOrder.items[state.itemIndex] ?? state.currentOrder.items[0]) === spec.scene,
  );

  const startRef = useRef<number | null>(null);
  const [itemZone, setItemZone] = useState<string | null>(null);
  const [extraAdded, setExtraAdded] = useState(false);
  const [processed, setProcessed] = useState(false);
  // Pancakes only: the "after" model/tint lag behind `processed` by real time (see cookTintFor).
  const [cooked, setCooked] = useState(false);
  const [cookTint, setCookTint] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!processed || !spec.appliance.heated) {
      return;
    }
    const tick = () => {
      const start = startRef.current;
      if (start === null) return;
      const elapsed = Date.now() - start;
      setCooked(elapsed >= TOAST_MIN_MS);
      setCookTint(cookTintFor(elapsed, spec.item.tintAfter ?? '#ffffff'));
    };
    tick();
    const id = setInterval(tick, 180);
    return () => clearInterval(id);
  }, [processed, spec.appliance.heated, spec.item.tintAfter]);

  const handleDroppedOn = (zoneId: string | null) => {
    setItemZone(zoneId);
    if (zoneId === spec.extraZone.id) {
      setExtraAdded(true);
    }
    if (zoneId === READY_ZONE.id) {
      if (isTransitioning || !isActive) {
        return;
      }
      const start = startRef.current;
      const next = completeItem(
        start === null ? null : { recipe, extraAdded, processMs: Date.now() - start },
      );
      startTransition(next);
    }
  };

  const handleProcess = () => {
    if (isTransitioning || processed || itemZone !== spec.applianceZone.id) {
      return;
    }
    startRef.current = Date.now();
    setProcessed(true);
  };

  return (
    <group>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[2.6 * tableScale, 0.1, 2.0 * tableScale]} />
        <meshStandardMaterial color={tableColor} {...materialProps} />
      </mesh>

      <mesh position={[spec.applianceZone.x, 0, spec.appliance.z]} onPointerDown={handleProcess}>
        <ModelParts data={spec.appliance.model} scale={spec.appliance.scale} offsetY={spec.appliance.offsetY} />
      </mesh>

      {spec.appliance.heated && (
        <Flame
          active={processed && itemZone === spec.applianceZone.id}
          position={[spec.applianceZone.x, 0.02, spec.appliance.z]}
        />
      )}

      {spec.extraProp.model ? (
        <mesh position={[spec.extraZone.x, 0, spec.extraZone.z + 0.25]}>
          <ModelParts data={spec.extraProp.model} scale={spec.extraProp.scale} />
        </mesh>
      ) : (
        // Ice bucket: a small tub of cubes beside the drop zone.
        <group position={[spec.extraZone.x, 0, spec.extraZone.z + 0.25]}>
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
      )}

      <CupDraggable onDroppedOn={handleDroppedOn} zones={[spec.applianceZone, spec.extraZone, READY_ZONE]} y={0.02}>
        <RecipeItemView
          spec={spec}
          processed={processed}
          extraAdded={extraAdded}
          offsetY={-0.02}
          cooked={spec.appliance.heated ? cooked : undefined}
          tint={spec.appliance.heated ? cookTint : undefined}
        />
      </CupDraggable>

      <ReadyMarker position={[READY_ZONE.x, 0.06, READY_ZONE.z]} />
    </group>
  );
}
