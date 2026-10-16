import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { useSceneCamera } from '../shared/sceneCamera';

// Direction A "Madeira & Âmbar" palette.
const MADEIRA = '#6B4226';
const AMBAR = '#F3B45A';

/**
 * Delivery counter scene: a single tap target that delivers the prepared
 * coffee (using whatever pendingPrep the coffee station stashed — null is a
 * valid, non-crashing input per the "never block delivery" spec rule),
 * requests the next order, and cuts back to the order board.
 */
export function DeliveryCounter() {
  useSceneCamera([0, 0.8, 1.8], [0, 0.3, 0]);

  const deliverOrder = useGameStore((state) => state.deliverOrder);
  const requestNextOrder = useGameStore((state) => state.requestNextOrder);
  const startTransition = useGameStore((state) => state.startTransition);
  const pendingPrep = useGameStore((state) => state.pendingPrep);
  const setPendingPrep = useGameStore((state) => state.setPendingPrep);

  const handleDeliver = () => {
    deliverOrder(pendingPrep);
    setPendingPrep(null);
    requestNextOrder();
    startTransition('orderBoard');
    // Temporary visibility into the review outcome; Task 8 adds the real HUD.
    // eslint-disable-next-line no-console
    console.log('reviews', useGameStore.getState().reviews);
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
