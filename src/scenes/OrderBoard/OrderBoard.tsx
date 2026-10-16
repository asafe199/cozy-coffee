import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { useSceneCamera } from '../shared/sceneCamera';

// Direction A "Madeira & Âmbar" palette (docs/superpowers/specs/2026-10-16-brewlight-menu-tipografia.md).
const NOGUEIRA = '#4A2F1F';
const MADEIRA = '#6B4226';

/**
 * Order board scene: shows the current order (or a placeholder before the
 * first one is generated) and acts as the tap target that starts the next
 * order and cuts to the coffee station.
 */
export function OrderBoard() {
  useSceneCamera([0, 0, 2.2], [0, 0, 0]);

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

  return (
    <group>
      <mesh position={[0, 0, 0]} onPointerDown={handleTap}>
        <boxGeometry args={[1.6, 1.0, 0.08]} />
        <meshStandardMaterial color={NOGUEIRA} flatShading roughness={0.8} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.56, 0.01]}>
        <boxGeometry args={[1.7, 0.08, 0.1]} />
        <meshStandardMaterial color={MADEIRA} flatShading roughness={0.8} metalness={0.05} />
      </mesh>
    </group>
  );
}
