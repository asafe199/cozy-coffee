import React from 'react';
import { Text } from '@react-three/drei';
import { useGameStore } from '../../state/gameStore';
import { useSceneCamera } from '../shared/sceneCamera';

// Direction A "Madeira & Âmbar" palette (docs/superpowers/specs/2026-10-16-brewlight-menu-tipografia.md).
// Figtree (the direction's chosen interface font) is not wired up here — expo-font /
// @expo-google-fonts/figtree / expo-asset are not installed in this project, and adding a
// new dependency for drei's in-canvas <Text> is out of scope for this best-effort ask. drei's
// default font is used; only the color palette below is applied.
const NOGUEIRA = '#4A2F1F';
const MADEIRA = '#6B4226';
const CREME = '#F6E3C7';

/**
 * Order board scene: shows the current order (or a placeholder before the
 * first one is generated) and acts as the tap target that starts the next
 * order and cuts to the coffee station.
 */
export function OrderBoard() {
  useSceneCamera([0, 0, 2.2], [0, 0, 0]);

  const currentOrder = useGameStore((state) => state.currentOrder);
  const requestNextOrder = useGameStore((state) => state.requestNextOrder);
  const startTransition = useGameStore((state) => state.startTransition);

  const handleTap = () => {
    // Never overwrite an order mid-flight: only generate one when there isn't one already.
    if (!currentOrder) {
      requestNextOrder();
    }
    startTransition('coffeeStation');
  };

  const label = currentOrder
    ? `Coffee${currentOrder.wantsSugar ? ' with sugar' : ''}`
    : 'Tap for next order';

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
      <Text
        position={[0, 0, 0.05]}
        fontSize={0.14}
        color={CREME}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.3}
      >
        {label}
      </Text>
    </group>
  );
}
