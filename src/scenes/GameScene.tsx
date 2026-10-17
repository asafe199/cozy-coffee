import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useGameStore } from '../state/gameStore';
import { OrderBoard } from './OrderBoard/OrderBoard';
import { CoffeeStation } from './CoffeeStation/CoffeeStation';
import { DeliveryCounter } from './DeliveryCounter/DeliveryCounter';
import { ToastStation } from './ToastStation/ToastStation';
import { CameraRig } from './shared/CameraRig';
import { levelConfig } from '../game/levels';
import { SCENE_X } from './shared/world';

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
  const theme = useGameStore((state) => levelConfig(state.level).theme);
  const pendingScene = useGameStore((state) => state.pendingScene);
  const stationKey = useGameStore((state) => `${state.currentOrder?.id ?? 'none'}:${state.itemIndex}`);

  return (
    <Canvas>
      {/* Carvão — Direction A's designated scene background. */}
      <color attach="background" args={[theme.background]} />
      <hemisphereLight args={[theme.skyLight, 0x4a3420, 0.6]} />
      <directionalLight color={theme.sunLight} intensity={1.3} position={[5, 7, 4]} />
      <CameraRig target={pendingScene ?? scene} />
      <group position={[SCENE_X.orderBoard, 0, 0]}>
        <OrderBoard />
      </group>
      {/* Stations stay mounted so the camera can glide between them; keying on
          the order/item resets their local state for each new task. */}
      <group position={[SCENE_X.coffeeStation, 0, 0]}>
        <CoffeeStation key={stationKey} />
      </group>
      <group position={[SCENE_X.toastStation, 0, 0]}>
        <ToastStation key={stationKey} />
      </group>
      <group position={[SCENE_X.deliveryCounter, 0, 0]}>
        <DeliveryCounter />
      </group>
    </Canvas>
  );
}
