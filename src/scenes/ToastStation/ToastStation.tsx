import { levelConfig } from '../../game/levels';
import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { stationForItem } from '../../game/orders';
import { CupDraggable } from '../CoffeeStation/CupDraggable';
import { Steam } from '../shared/props/Steam';
import { ReadyMarker } from '../shared/props/ReadyMarker';
import { ModelParts } from '../shared/props/ModelParts';
import { BOWL, BREAD, TOASTER } from '../shared/props/models.generated';
import { BREAD_SWEET, BREAD_WHEAT, BUTTER_PAT, WHEAT_DECOR } from '../shared/props/toastVariety.generated';
import type { ModelData } from '../shared/props/modelData';
import { READY_ZONE } from '../CoffeeStation/dropZones';
import { BUTTER_ZONE, GRIDDLE_ZONE } from './zones';
import { toastTint } from './toastTint';

const materialProps = { flatShading: true, roughness: 0.8, metalness: 0.05 } as const;
const zones = [GRIDDLE_ZONE, BUTTER_ZONE, READY_ZONE];
// How often the bread's tint is recomputed while toasting. A slow color fade
// over seconds doesn't need per-frame precision, so a plain timer (matching
// the "lightest thing that reads as smooth" bar, not useFrame) is enough.
const TINT_TICK_MS = 180;

// Three bread options, lined up inside one basket on the counter — purely
// cosmetic (confirmed with the user: any of them works for any order, same
// "drag whichever you want" pattern as the juice ingredients).
interface BreadOption {
  key: string;
  model: ModelData;
  scale: number;
  originX: number;
}
const BREAD_BASKET: [number, number, number] = [0.45, 0, -0.45];
const BREAD_BASKET_SCALE = 0.75;
// Resting height inside the basket; a dropped bread springs back to here.
const BREAD_Y = 0.18;
const BREAD_OPTIONS: BreadOption[] = [
  { key: 'default', model: BREAD, scale: 0.22, originX: 0.23 },
  { key: 'wheat', model: BREAD_WHEAT, scale: 0.24, originX: 0.45 },
  { key: 'sweet', model: BREAD_SWEET, scale: 0.26, originX: 0.67 },
];

/**
 * Toast station: drag any of the 3 bread options (BREAD_OPTIONS — cosmetic
 * choice only, review never checks which one) onto the griddle, tap it to
 * start toasting, optionally drag that bread to the butter, then drag it onto
 * the READY_ZONE marker to send it on. How long the bread was toasted is
 * measured from the griddle tap to that drop; the player is never blocked or
 * warned — burnt/untoasted bread only shows up in the review. Local state
 * resets on every visit (the scene remounts per visit).
 */
export function ToastStation() {
  const completeItem = useGameStore((state) => state.completeItem);
  const startTransition = useGameStore((state) => state.startTransition);
  const isTransitioning = useGameStore((state) => state.isTransitioning);
  const level = useGameStore((state) => state.level);
  const { tableScale, tableColor } = levelConfig(level);
  // Done only counts at the station the current item belongs to (the player can pan anywhere).
  const isActive = useGameStore(
    (state) =>
      !!state.currentOrder &&
      stationForItem(state.currentOrder.items[state.itemIndex] ?? state.currentOrder.items[0]) === 'toastStation'
  );

  const toastStartRef = useRef<number | null>(null);
  // One zone per bread option — each is independently draggable, so each needs
  // its own snapped/unsnapped state (see BREAD_OPTIONS above).
  const [breadZones, setBreadZones] = useState<Record<string, string | null>>({});
  const [hasTouchedButter, setHasTouchedButter] = useState(false);
  const [toasting, setToasting] = useState(false);
  const [tint, setTint] = useState('#ffffff');

  // Darkens the bread continuously while toasting, instead of snapping tint
  // the instant the player taps the griddle — the player can still drag it
  // off to READY_ZONE at any point mid-fade, nothing here blocks that.
  useEffect(() => {
    if (!toasting) {
      setTint('#ffffff');
      return;
    }
    const tick = () => {
      const start = toastStartRef.current;
      setTint(toastTint(start === null ? 0 : Date.now() - start));
    };
    tick();
    const id = setInterval(tick, TINT_TICK_MS);
    return () => clearInterval(id);
  }, [toasting]);

  // Always completes: an untouched station records a null prep, which the
  // review treats as a valid worst-case input (never a dead end). Any of the
  // 3 breads reaching READY_ZONE delivers — whichever one the player actually
  // dragged there, cosmetic choice only, nothing here scores which model it was.
  const handleDroppedOn = (key: string) => (zoneId: string | null) => {
    setBreadZones((prev) => ({ ...prev, [key]: zoneId }));
    if (zoneId === BUTTER_ZONE.id) {
      setHasTouchedButter(true);
    }
    if (zoneId === READY_ZONE.id) {
      if (isTransitioning || !isActive) {
        return;
      }
      const start = toastStartRef.current;
      const next = completeItem(
        start === null
          ? null
          : { recipe: 'toast', butterAdded: hasTouchedButter, toastedMs: Date.now() - start }
      );
      startTransition(next);
    }
  };

  const canToast = !toasting && Object.values(breadZones).includes(GRIDDLE_ZONE.id);

  const handleToast = () => {
    if (isTransitioning || !canToast) {
      return;
    }
    toastStartRef.current = Date.now();
    setToasting(true);
  };

  return (
    <group>
      {/* Counter surface */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[2.6 * tableScale, 0.1, 2.0 * tableScale]} />
        <meshStandardMaterial color={tableColor} {...materialProps} />
      </mesh>

      {/* Toaster model (Kenney, CC0) behind the snap zone; tap to start toasting. */}
      <mesh position={[GRIDDLE_ZONE.x, 0, 0]} onPointerDown={handleToast}>
        <ModelParts data={TOASTER} scale={0.7} />
      </mesh>
      <Steam active={toasting} position={[GRIDDLE_ZONE.x, 0.5, GRIDDLE_ZONE.z]} />

      {/* Real butter pat (hand-modeled — no ready-made CC0 "stick of butter"
          existed), offset beside BUTTER_ZONE's center so the snapped bread
          doesn't swallow it. */}
      <mesh position={[BUTTER_ZONE.x, 0.04, BUTTER_ZONE.z + 0.25]}>
        <ModelParts data={BUTTER_PAT} scale={0.26} />
      </mesh>

      {/* Decorative wheat behind the toaster — never draggable, just atmosphere. */}
      <mesh position={[GRIDDLE_ZONE.x, 0, -0.35]}>
        <ModelParts data={WHEAT_DECOR} scale={0.5} />
      </mesh>

      {/* Bread basket: the three options sit in it instead of lying loose on the
          counter. Squashed vertically into a shallow basket so the bread resting
          in it still reads from the player's angle instead of sinking out of sight. */}
      <mesh position={BREAD_BASKET} scale={[1, 0.5, 1]}>
        <ModelParts data={BOWL} scale={BREAD_BASKET_SCALE} />
      </mesh>

      {BREAD_OPTIONS.map(({ key, model, scale, originX }) => (
        <CupDraggable
          key={key}
          onDroppedOn={handleDroppedOn(key)}
          zones={zones}
          origin={{ x: originX, z: BREAD_BASKET[2] }}
          y={BREAD_Y}
        >
          {/* offsetY=-0.04 settles the bread into the basket (just under its
              BREAD_Y resting height) in every other state. GRIDDLE_ZONE
              rotates the whole mesh 90° about X, which remaps that same
              y-offset into a z-depth offset instead (rotating a point by 90°
              about X turns its old y into its new z) — applied there, it would
              push the standing bread off-center in the toaster's depth instead
              of sitting flush on anything. So while snapped to the griddle,
              center it on this bread's own thin axis instead. Only the bread
              actually in the griddle shows the toasting tint; the other two
              stay their natural color until it's their turn. */}
          <ModelParts
            data={model}
            scale={scale}
            offsetY={breadZones[key] === GRIDDLE_ZONE.id ? -(model.height * scale) / 2 : -0.04}
            tint={breadZones[key] === GRIDDLE_ZONE.id ? tint : '#ffffff'}
          />
        </CupDraggable>
      ))}

      <ReadyMarker position={[READY_ZONE.x, 0.06, READY_ZONE.z]} />
    </group>
  );
}
