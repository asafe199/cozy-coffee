import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { useSceneCamera } from '../shared/sceneCamera';

// Direction A "Madeira & Âmbar" palette.
const MADEIRA = '#6B4226';
const AMBAR = '#F3B45A';

/**
 * Delivery counter scene: a single tap target that delivers the current
 * order (using whatever per-item preps were collected along the way — a
 * null prep is a valid, non-crashing input per the "never block delivery"
 * spec rule), requests the next order (unless this delivery just ended the
 * day), and cuts back to the order board.
 */
export function DeliveryCounter() {
  useSceneCamera([0, 0.8, 1.8], [0, 0.3, 0]);

  const deliverOrder = useGameStore((state) => state.deliverOrder);
  const requestNextOrder = useGameStore((state) => state.requestNextOrder);
  const startTransition = useGameStore((state) => state.startTransition);
  const isTransitioning = useGameStore((state) => state.isTransitioning);

  const handleDeliver = () => {
    if (isTransitioning) {
      return;
    }
    deliverOrder();
    // deliverOrder() can end the day (dayOver=true) — don't generate the
    // next day's order until the player has dismissed the day summary and
    // called startNextDay(); otherwise an order gets silently queued up
    // before the "fresh start" the day-closed gate implies.
    if (!useGameStore.getState().dayOver) {
      requestNextOrder();
    }
    startTransition('orderBoard');
  };

  return (
    <group>
      <mesh position={[0, 0.3, 0]} onPointerDown={handleDeliver}>
        <boxGeometry args={[1.4, 0.6, 0.6]} />
        <meshStandardMaterial color={MADEIRA} flatShading roughness={0.8} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.65, 0]} onPointerDown={handleDeliver}>
        <boxGeometry args={[1.5, 0.1, 0.65]} />
        <meshStandardMaterial color={AMBAR} flatShading roughness={0.8} metalness={0.05} />
      </mesh>
    </group>
  );
}
