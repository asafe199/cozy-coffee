import React, { useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import { MACHINE_ZONE, SUGAR_ZONE, resolveDropZone } from './dropZones';

const CUP_ORIGIN = { x: 0, z: 0 };
const CUP_Y = 0.05;

interface CupDraggableProps {
  onDroppedOn: (zoneId: string | null) => void;
}

/**
 * Draggable cup mesh for the CoffeeStation scene. Drag is driven by R3F's
 * native pointer events (onPointerDown/Move/Up) rather than
 * react-native-gesture-handler's GestureDetector: GestureDetector needs a
 * native host view ref to attach to, but meshes inside <Canvas> are
 * reconciled by three.js/R3F's own renderer, not React Native's — there is
 * no native view here to wrap. @react-three/fiber's native build already
 * dispatches these pointer events itself (via RN's PanResponder under the
 * hood), so this stays self-contained with no extra wiring required from
 * whoever mounts this inside their <Canvas>.
 *
 * Position is kept in reanimated shared values (not React state) and
 * written onto the mesh every frame via useFrame, per the brief.
 */
export function CupDraggable({ onDroppedOn }: CupDraggableProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const posX = useSharedValue(CUP_ORIGIN.x);
  const posZ = useSharedValue(CUP_ORIGIN.z);
  const isDragging = useRef(false);

  const handleMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging.current) {
      return;
    }
    posX.value = event.point.x;
    posZ.value = event.point.z;
  };

  const handleUp = () => {
    if (!isDragging.current) {
      return;
    }
    isDragging.current = false;

    const zone = resolveDropZone(
      { x: posX.value, z: posZ.value },
      [MACHINE_ZONE, SUGAR_ZONE]
    );

    if (zone) {
      posX.value = withSpring(zone.x);
      posZ.value = withSpring(zone.z);
      onDroppedOn(zone.id);
    } else {
      posX.value = withSpring(CUP_ORIGIN.x);
      posZ.value = withSpring(CUP_ORIGIN.z);
      onDroppedOn(null);
    }
  };

  useFrame(() => {
    if (!meshRef.current) {
      return;
    }
    meshRef.current.position.x = posX.value;
    meshRef.current.position.z = posZ.value;
  });

  return (
    <>
      {/* Invisible full-table catcher: reports absolute world x/z under the
          finger for the whole drag, independent of where the cup currently
          sits (raycasting is geometry-based and ignores opacity/visibility
          of appearance, only `visible` gates it — kept true, just see-through). */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
      >
        <planeGeometry args={[4, 4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh
        ref={meshRef}
        position={[CUP_ORIGIN.x, CUP_Y, CUP_ORIGIN.z]}
        onPointerDown={() => {
          isDragging.current = true;
        }}
        onPointerUp={handleUp}
      >
        <cylinderGeometry args={[0.1, 0.08, 0.12, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </>
  );
}
