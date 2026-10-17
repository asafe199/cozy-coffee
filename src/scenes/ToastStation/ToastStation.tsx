import { levelConfig } from '../../game/levels';
import React, { useRef, useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { stationForItem } from '../../game/orders';
import { CupDraggable } from '../CoffeeStation/CupDraggable';
import { Steam } from '../shared/props/Steam';
import { ReadyMarker } from '../shared/props/ReadyMarker';
import { ModelParts } from '../shared/props/ModelParts';
import { BREAD, TOASTER } from '../shared/props/models.generated';
import { READY_ZONE } from '../CoffeeStation/dropZones';
import { BUTTER_ZONE, GRIDDLE_ZONE } from './zones';

const materialProps = { flatShading: true, roughness: 0.8, metalness: 0.05 } as const;
const zones = [GRIDDLE_ZONE, BUTTER_ZONE, READY_ZONE];

/**
 * Toast station: drag the bread onto the griddle, tap the griddle to start
 * toasting, optionally drag the bread to the butter, then drag it onto the
 * READY_ZONE marker to send it on. How long the bread was toasted is measured
 * from the griddle tap to that drop; the player is never blocked or warned —
 * burnt/untoasted bread only shows up in the review. Local state resets on
 * every visit (the scene remounts per visit).
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
  const [breadZone, setBreadZone] = useState<string | null>(null);
  const [hasTouchedButter, setHasTouchedButter] = useState(false);
  const [toasting, setToasting] = useState(false);

  // Always completes: an untouched station records a null prep, which the
  // review treats as a valid worst-case input (never a dead end).
  const handleDroppedOn = (zoneId: string | null) => {
    setBreadZone(zoneId);
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

  const canToast = !toasting && breadZone === GRIDDLE_ZONE.id;

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

      {/* Butter block, offset beside BUTTER_ZONE's center so the snapped bread doesn't swallow it. */}
      <mesh position={[BUTTER_ZONE.x, 0.04, BUTTER_ZONE.z + 0.25]}>
        <boxGeometry args={[0.16, 0.08, 0.1]} />
        <meshStandardMaterial color="#F7E48A" {...materialProps} />
      </mesh>

      <CupDraggable onDroppedOn={handleDroppedOn} zones={zones} y={0.04}>
        <ModelParts data={BREAD} scale={0.3} offsetY={-0.04} tint={toasting ? '#8a5a3a' : '#ffffff'} />
      </CupDraggable>

      <ReadyMarker position={[READY_ZONE.x, 0.06, READY_ZONE.z]} />
    </group>
  );
}
