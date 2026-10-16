import React, { useRef, useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { useSceneCamera } from '../shared/sceneCamera';
import { CupDraggable } from './CupDraggable';
import { MACHINE_ZONE, SUGAR_ZONE } from './dropZones';

// Direction A "Madeira & Âmbar" palette.
const MADEIRA = '#6B4226';
const NOGUEIRA = '#4A2F1F';
const AMBAR = '#F3B45A';
const CREME = '#F6E3C7';
const DISABLED = '#5a5a5a';

const materialProps = { flatShading: true, roughness: 0.8, metalness: 0.05 } as const;

/**
 * Coffee station scene: the machine (tap once the cup is on MACHINE_ZONE to
 * pour), the sugar packet, the draggable cup, and a "done" trigger that only
 * does anything once poured. Local component state (poured/cupZone/
 * hasTouchedSugar/entry time) is intentionally not lifted to the store: this
 * component unmounts/remounts fresh every time the player enters/leaves the
 * station (GameScene renders only one scene at a time), which is exactly the
 * reset behavior we want between visits.
 */
export function CoffeeStation() {
  useSceneCamera([0, 1.6, 1.8], [0, 0, 0]);

  const startTransition = useGameStore((state) => state.startTransition);
  const setPendingPrep = useGameStore((state) => state.setPendingPrep);

  const entryTimeRef = useRef<number>(Date.now());
  const [cupZone, setCupZone] = useState<string | null>(null);
  const [hasTouchedSugar, setHasTouchedSugar] = useState(false);
  const [poured, setPoured] = useState(false);

  const handleDroppedOn = (zoneId: string | null) => {
    setCupZone(zoneId);
    if (zoneId === SUGAR_ZONE.id) {
      setHasTouchedSugar(true);
    }
  };

  const canPour = !poured && cupZone === MACHINE_ZONE.id;

  const handlePour = () => {
    if (!canPour) {
      return;
    }
    setPoured(true);
  };

  const handleDone = () => {
    if (!poured) {
      return;
    }
    setPendingPrep({
      sugarAdded: hasTouchedSugar,
      prepTimeMs: Date.now() - entryTimeRef.current,
    });
    startTransition('deliveryCounter');
  };

  return (
    <group>
      {/* Counter surface */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[2.6, 0.1, 2.0]} />
        <meshStandardMaterial color={MADEIRA} {...materialProps} />
      </mesh>

      {/* Coffee machine, geometry/material approach reused from the approved
          preview (preview-3d-lowpoly-v2.html): box body + top + spout + two
          knobs. Tap the body to pour, once the cup is on MACHINE_ZONE. */}
      <group position={[MACHINE_ZONE.x, 0, MACHINE_ZONE.z]}>
        <mesh position={[0, 0.31, 0]} onPointerDown={handlePour}>
          <boxGeometry args={[0.62, 0.62, 0.42]} />
          <meshStandardMaterial color={poured ? AMBAR : '#a8532f'} {...materialProps} />
        </mesh>
        <mesh position={[0, 0.69, 0]} onPointerDown={handlePour}>
          <boxGeometry args={[0.5, 0.14, 0.36]} />
          <meshStandardMaterial color={NOGUEIRA} {...materialProps} />
        </mesh>
        <mesh position={[0, 0.27, 0.25]}>
          <boxGeometry args={[0.08, 0.22, 0.08]} />
          <meshStandardMaterial color="#3a2a20" {...materialProps} />
        </mesh>
        {[-0.16, 0.16].map((kx) => (
          <mesh key={kx} position={[kx, 0.45, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.05, 10]} />
            <meshStandardMaterial color="#6fa088" {...materialProps} />
          </mesh>
        ))}
      </group>

      {/* Sugar packet */}
      <mesh position={[SUGAR_ZONE.x, 0.03, SUGAR_ZONE.z]}>
        <boxGeometry args={[0.14, 0.06, 0.1]} />
        <meshStandardMaterial color={CREME} {...materialProps} />
      </mesh>

      <CupDraggable onDroppedOn={handleDroppedOn} />

      {/* Done trigger: enabled (amber) only once poured. */}
      <mesh position={[0, 0.05, 0.85]} onPointerDown={handleDone}>
        <boxGeometry args={[0.5, 0.1, 0.25]} />
        <meshStandardMaterial color={poured ? AMBAR : DISABLED} {...materialProps} />
      </mesh>
    </group>
  );
}
