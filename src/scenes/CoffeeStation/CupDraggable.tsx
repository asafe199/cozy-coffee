import React, { useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import { MACHINE_ZONE, SUGAR_ZONE, resolveDropZone } from './dropZones';

const CUP_ORIGIN = { x: 0, z: 0 };
const CUP_Y = 0.05;
// shortcut: if no pointermove/down reaches us for this long while "dragging", treat the
// gesture as abandoned (finger lifted off-screen, or RN's responder was stolen by an OS
// edge-gesture mid-drag) and recover. Needed because R3F's native event core never invokes
// a user onLostPointerCapture handler on gesture termination (confirmed by reading its
// source: the 'onLostPointerCapture' case in handlePointer() only clears internal capture
// bookkeeping, it never calls instance.handlers.onLostPointerCapture) — so that case is
// otherwise invisible to this component. 400ms is comfortably longer than the gap between
// real touchmove samples (even a near-still finger keeps producing them from hand tremor),
// so this shouldn't fire during a deliberate mid-drag pause; upgrade to a shorter value only
// if real-device testing shows recovery feels sluggish.
const ABANDONED_DRAG_MS = 400;

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
  const lastActivity = useRef(0);

  // Shared end-of-drag logic: snap to a zone's center and report it, or spring back to the
  // cup's origin and report null. Used by both a clean release and the abandoned-drag watchdog.
  const finalize = (zone: { x: number; z: number; id: string } | null) => {
    isDragging.current = false;
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

  const handleMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging.current) {
      return;
    }
    lastActivity.current = Date.now();
    posX.value = event.point.x;
    posZ.value = event.point.z;
  };

  const handleUp = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging.current) {
      return;
    }
    (event.target as unknown as { releasePointerCapture: (id: number) => void }).releasePointerCapture(
      event.pointerId
    );
    finalize(resolveDropZone({ x: posX.value, z: posZ.value }, [MACHINE_ZONE, SUGAR_ZONE]));
  };

  useFrame(() => {
    if (!meshRef.current) {
      return;
    }
    if (isDragging.current && Date.now() - lastActivity.current > ABANDONED_DRAG_MS) {
      // No pointer event reached us for a while while supposedly dragging — the gesture
      // was abandoned (finger left the screen / responder stolen). Always return to origin,
      // never snap to a zone, per the "never stay stuck" requirement.
      finalize(null);
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
        onPointerDown={(event: ThreeEvent<PointerEvent>) => {
          isDragging.current = true;
          lastActivity.current = Date.now();
          // Captures this pointerId to the cup so onPointerMove/onPointerUp keep
          // firing even if the finger strays past the catcher plane's bounds —
          // without this, a release outside any hit-testable geometry would
          // never reach handleUp and strand isDragging as true forever.
          (event.target as unknown as { setPointerCapture: (id: number) => void }).setPointerCapture(
            event.pointerId
          );
        }}
        onPointerUp={handleUp}
      >
        <cylinderGeometry args={[0.1, 0.08, 0.12, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </>
  );
}
