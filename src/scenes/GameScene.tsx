import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useGameStore } from '../state/gameStore';
import { OrderBoard } from './OrderBoard/OrderBoard';
import { CoffeeStation } from './CoffeeStation/CoffeeStation';
import { DeliveryCounter } from './DeliveryCounter/DeliveryCounter';

/**
 * The <Canvas> root rendered by GameScreen (Task 8). Lighting matches the
 * approved low-poly reference scene (preview-3d-lowpoly-v2.html): warm
 * hemisphere fill + a directional "sun". Renders exactly one of the three
 * scene groups based on the store's `scene` field — since `scene` only ever
 * changes inside completeTransition()'s single `set()` call (invoked by
 * FadeTransition while the screen is fully black), the outgoing scene
 * unmounts and the incoming one mounts in the same React commit, so there is
 * never a frame with zero or two scenes rendered.
 */
export function GameScene() {
  const scene = useGameStore((state) => state.scene);

  return (
    <Canvas>
      <hemisphereLight args={[0xfff1d6, 0x4a3420, 0.6]} />
      <directionalLight color={0xffdca0} intensity={1.3} position={[5, 7, 4]} />
      {scene === 'orderBoard' && <OrderBoard />}
      {scene === 'coffeeStation' && <CoffeeStation />}
      {scene === 'deliveryCounter' && <DeliveryCounter />}
    </Canvas>
  );
}
