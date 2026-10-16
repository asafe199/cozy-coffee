import React, { useRef, useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { useSceneCamera } from '../shared/sceneCamera';
import { CupDraggable } from '../CoffeeStation/CupDraggable';
import { BUTTER_ZONE, GRIDDLE_ZONE } from './zones';

// Direction A "Madeira & Âmbar" palette.
const MADEIRA = '#6B4226';
const NOGUEIRA = '#4A2F1F';
const AMBAR = '#F3B45A';
const DISABLED = '#5a5a5a';
const BREAD = '#D9A55C';
const TOASTED = '#8A5428';

const materialProps = { flatShading: true, roughness: 0.8, metalness: 0.05 } as const;
const zones = [GRIDDLE_ZONE, BUTTER_ZONE];

/**
 * Toast station: drag the bread onto the griddle, tap the griddle to start
 * toasting, optionally drag the bread to the butter, then tap "done". How long
 * the bread was toasted is measured from the griddle tap to "done"; the player
 * is never blocked or warned — burnt/untoasted bread only shows up in the
 * review. Local state resets on every visit (the scene remounts per visit).
 */
export function ToastStation() {
  useSceneCamera([0, 1.6, 1.8], [0, 0, 0]);

  const completeItem = useGameStore((state) => state.completeItem);
  const startTransition = useGameStore((state) => state.startTransition);
  const isTransitioning = useGameStore((state) => state.isTransitioning);

  const toastStartRef = useRef<number | null>(null);
  const [breadZone, setBreadZone] = useState<string | null>(null);
  const [hasTouchedButter, setHasTouchedButter] = useState(false);
  const [toasting, setToasting] = useState(false);

  const handleDroppedOn = (zoneId: string | null) => {
    setBreadZone(zoneId);
    if (zoneId === BUTTER_ZONE.id) {
      setHasTouchedButter(true);
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

  // Always leaves: an untouched station records a null prep, which the review
  // treats as a valid worst-case input (never a dead end).
  const handleDone = () => {
    if (isTransitioning) {
      return;
    }
    const start = toastStartRef.current;
    const next = completeItem(
      start === null
        ? null
        : { recipe: 'toast', butterAdded: hasTouchedButter, toastedMs: Date.now() - start }
    );
    startTransition(next);
  };

  return (
    <group>
      {/* Counter surface */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[2.6, 0.1, 2.0]} />
        <meshStandardMaterial color={MADEIRA} {...materialProps} />
      </mesh>

      {/* Griddle: flat slab behind the snap zone; tap to start toasting. */}
      <mesh position={[GRIDDLE_ZONE.x, 0.06, 0]} onPointerDown={handleToast}>
        <boxGeometry args={[0.8, 0.12, 0.6]} />
        <meshStandardMaterial color={toasting ? AMBAR : NOGUEIRA} {...materialProps} />
      </mesh>

      {/* Butter block, offset beside BUTTER_ZONE's center so the snapped bread doesn't swallow it. */}
      <mesh position={[BUTTER_ZONE.x, 0.04, BUTTER_ZONE.z + 0.25]}>
        <boxGeometry args={[0.16, 0.08, 0.1]} />
        <meshStandardMaterial color="#F7E48A" {...materialProps} />
      </mesh>

      <CupDraggable onDroppedOn={handleDroppedOn} zones={zones} y={0.04}>
        <boxGeometry args={[0.22, 0.08, 0.22]} />
        <meshStandardMaterial color={toasting ? TOASTED : BREAD} {...materialProps} />
      </CupDraggable>

      {/* Done trigger: amber once toasting has started. */}
      <mesh position={[0, 0.05, 0.85]} onPointerDown={handleDone}>
        <boxGeometry args={[0.5, 0.1, 0.25]} />
        <meshStandardMaterial color={toasting ? AMBAR : DISABLED} {...materialProps} />
      </mesh>
    </group>
  );
}
