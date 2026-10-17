import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { CafeBackdrop } from '../shared/CafeBackdrop';

// Direction A "Madeira & Âmbar" palette (docs/superpowers/specs/2026-10-16-brewlight-menu-tipografia.md).
const NOGUEIRA = '#4A2F1F';
const MADEIRA = '#6B4226';
const CHALK_GREEN = '#2F4A3E';
const CREME = '#F6E3C7';
const AMBAR = '#F3B45A';

/**
 * Order board scene: shows the current order (or a placeholder before the
 * first one is generated) and acts as the tap target that starts the next
 * order and cuts to the coffee station.
 */
export function OrderBoard() {
  const beginOrder = useGameStore((state) => state.beginOrder);
  const startTransition = useGameStore((state) => state.startTransition);
  const isTransitioning = useGameStore((state) => state.isTransitioning);

  const handleTap = () => {
    if (isTransitioning) {
      return;
    }
    // beginOrder never overwrites an order that's already in flight.
    startTransition(beginOrder());
  };

  const mat = { flatShading: true, roughness: 0.8, metalness: 0.05 } as const;
  // Paper order notes pinned to the board: x, y, tilt (rad).
  const notes: [number, number, number][] = [
    [-0.45, 0.15, 0.06],
    [0, 0.2, -0.04],
    [0.45, 0.12, 0.05],
  ];

  return (
    <group>
      <CafeBackdrop variant="board" />
      {/* Chalkboard (tap to start the next order); text lives in the RN overlay. */}
      <mesh position={[0, 0, 0]} onPointerDown={handleTap}>
        <boxGeometry args={[1.6, 1.0, 0.06]} />
        <meshStandardMaterial color={CHALK_GREEN} {...mat} />
      </mesh>
      {/* Wooden frame */}
      {[
        [0, 0.54, 1.76, 0.08],
        [0, -0.54, 1.76, 0.08],
        [-0.84, 0, 0.08, 1.16],
        [0.84, 0, 0.08, 1.16],
      ].map(([x, y, w, h]) => (
        <mesh key={`${x},${y}`} position={[x, y, 0.02]}>
          <boxGeometry args={[w, h, 0.1]} />
          <meshStandardMaterial color={MADEIRA} {...mat} />
        </mesh>
      ))}
      {/* Pinned paper notes with a pin each */}
      {notes.map(([x, y, tilt]) => (
        <group key={x} position={[x, y, 0.04]} rotation={[0, 0, tilt]}>
          <mesh>
            <boxGeometry args={[0.3, 0.38, 0.01]} />
            <meshStandardMaterial color={CREME} {...mat} />
          </mesh>
          <mesh position={[0, 0.15, 0.015]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color={AMBAR} {...mat} />
          </mesh>
        </group>
      ))}
      {/* Chalk shelf */}
      <mesh position={[0, -0.62, 0.08]}>
        <boxGeometry args={[1.5, 0.05, 0.12]} />
        <meshStandardMaterial color={NOGUEIRA} {...mat} />
      </mesh>
    </group>
  );
}
