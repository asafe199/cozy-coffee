import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import { MACHINE_ZONE, SUGAR_ZONE, Zone, resolveDropZone } from './dropZones';
import { computeSwayAngle } from '../shared/dragSway';

const CUP_ORIGIN = { x: 0, z: 0 };
// Cylinder height 0.12 (see geometry below), so half-height 0.06 sits the
// cup's base exactly on the counter's top surface (y=0) instead of sunk
// into it.
const CUP_Y = 0.06;

interface CupDraggableProps {
  onDroppedOn: (zoneId: string | null) => void;
  zones?: Zone[];
  // Replaces the default cup geometry/material (used by other stations' draggables).
  children?: React.ReactNode;
  y?: number;
}

type CaptureTarget = {
  setPointerCapture: (id: number) => void;
  releasePointerCapture: (id: number) => void;
};

// R3F's canvas-level event target (state.events.connected) is a real EventTarget-like
// object (addEventListener/removeEventListener/dispatchEvent) that every pointer event,
// including 'lostpointercapture', passes through on its way to per-mesh handlers.
type CanvasEventTarget = {
  addEventListener: (type: string, listener: (event: { pointerId?: number }) => void) => void;
  removeEventListener: (type: string, listener: (event: { pointerId?: number }) => void) => void;
};

/** True if a canvas-level 'lostpointercapture' event is for the pointer we're tracking. */
export function isLostCaptureForPointer(
  event: { pointerId?: number },
  trackedPointerId: number | null
): boolean {
  return trackedPointerId !== null && event.pointerId === trackedPointerId;
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
export function CupDraggable({
  onDroppedOn,
  zones = [MACHINE_ZONE, SUGAR_ZONE],
  children,
  y = CUP_Y,
}: CupDraggableProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const posX = useSharedValue(CUP_ORIGIN.x);
  const posZ = useSharedValue(CUP_ORIGIN.z);
  const rotZ = useSharedValue(0);
  const posY = useSharedValue(y);
  const rotX = useSharedValue(0);
  // Previous frame's posX while dragging, used only to diff a per-frame velocity for sway
  // (Task 9). Reset to null whenever dragging stops so the position spring-back's own
  // velocity is never mistaken for drag velocity.
  const prevDragX = useRef<number | null>(null);
  const isDragging = useRef(false);
  // The capture target/pointerId recorded at pointerdown time, when event.target is
  // unambiguously scoped to the cup. onPointerUp can fire with event.target scoped to
  // whichever element's hit happened to be processed first (the catcher plane, if the
  // release lands there) — releasing through that mis-scoped target is a silent no-op, so
  // release is always done through this stored reference instead of the release event's own.
  const capturedTarget = useRef<CaptureTarget | null>(null);
  const trackedPointerId = useRef<number | null>(null);
  // Offset between the finger's first touch point and the cup's position at
  // that moment, so the cup keeps the same point under the finger for the
  // whole drag instead of snapping its center to wherever it was grabbed.
  const grabOffsetX = useRef(0);
  const grabOffsetZ = useRef(0);

  // Keeps the callback passed to the canvas-level listener (registered once, see useEffect
  // below) from closing over a stale onDroppedOn/finalize if this component re-renders.
  const finalizeRef = useRef<(zone: { x: number; z: number; id: string; y?: number; rotX?: number } | null) => void>(
    () => {}
  );

  // Shared end-of-drag logic: snap to a zone's center and report it, or spring back to the
  // cup's origin and report null. Used by a clean release and by the lost-capture listener.
  const finalize = (zone: { x: number; z: number; id: string; y?: number; rotX?: number } | null) => {
    isDragging.current = false;
    capturedTarget.current?.releasePointerCapture(trackedPointerId.current ?? -1);
    capturedTarget.current = null;
    trackedPointerId.current = null;
    // Settle the sway back to level immediately on release, independent of the position
    // spring-back below — without this, diffing the spring-back's own motion next frame
    // would read as drag velocity and keep the cup swaying instead of leveling out.
    rotZ.value = withSpring(0);
    if (zone) {
      const z = zone as Zone;
      posY.value = withSpring(z.y ?? y);
      rotX.value = withSpring(z.rotX ?? 0);
      posX.value = withSpring(zone.x);
      posZ.value = withSpring(zone.z);
      onDroppedOn(zone.id);
    } else {
      posY.value = withSpring(y);
      rotX.value = withSpring(0);
      posX.value = withSpring(CUP_ORIGIN.x);
      posZ.value = withSpring(CUP_ORIGIN.z);
      onDroppedOn(null);
    }
  };
  finalizeRef.current = finalize;

  // Canvas-level 'lostpointercapture' listener: RN's PanResponder dispatches this when the
  // gesture is terminated outside a normal release (an OS edge-swipe or system overlay steals
  // the touch responder mid-drag — confirmed in @react-three/fiber's native build source).
  // R3F's own internal handling of this event only clears its bookkeeping and never calls a
  // per-mesh onLostPointerCapture prop (confirmed by reading its event core), so the only way
  // to actually hear about this is to listen on the canvas-level target directly, the same
  // object R3F itself dispatches the event through.
  const connected = useThree((state) => state.events.connected) as CanvasEventTarget | undefined;
  useEffect(() => {
    if (!connected) {
      return;
    }
    const handleLostCapture = (event: { pointerId?: number }) => {
      if (!isDragging.current || !isLostCaptureForPointer(event, trackedPointerId.current)) {
        return;
      }
      // Gesture was torn down by the OS, not by the player — always return to origin,
      // never snap to a zone, per the "never stay stuck" requirement.
      finalizeRef.current(null);
    };
    connected.addEventListener('lostpointercapture', handleLostCapture);
    return () => connected.removeEventListener('lostpointercapture', handleLostCapture);
  }, [connected]);

  const handleMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging.current) {
      return;
    }
    // Stations sit at different world x; positions are local to the station group.
    const originX = meshRef.current?.parent?.position.x ?? 0;
    posX.value = event.point.x - originX - grabOffsetX.current;
    posZ.value = event.point.z - grabOffsetZ.current;
  };

  const handleUp = () => {
    if (!isDragging.current) {
      return;
    }
    finalize(resolveDropZone({ x: posX.value, z: posZ.value }, zones));
  };

  useFrame((_state, delta) => {
    if (!meshRef.current) {
      return;
    }
    meshRef.current.position.x = posX.value;
    meshRef.current.position.z = posZ.value;
    meshRef.current.position.y = posY.value;
    meshRef.current.rotation.x = rotX.value;

    // Pendulum sway (Task 9): a pure per-frame diff of position over elapsed time, not
    // anything that infers intent from a lack of events (see the lostpointercapture history
    // above for why timing-based "idle" guesses are off the table here). Only computed while
    // actively dragging — once released, finalize() above drives rotZ back to 0 directly, so
    // the position spring-back's own velocity is never fed into this as if it were a drag.
    if (isDragging.current) {
      const velocityX =
        prevDragX.current !== null && delta > 0 ? (posX.value - prevDragX.current) / delta : 0;
      rotZ.value = withSpring(computeSwayAngle(velocityX));
      prevDragX.current = posX.value;
    } else {
      prevDragX.current = null;
    }
    meshRef.current.rotation.z = rotZ.value;
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
        position={[CUP_ORIGIN.x, y, CUP_ORIGIN.z]}
        onPointerDown={(event: ThreeEvent<PointerEvent>) => {
          isDragging.current = true;
          // Record where on the cup the finger actually landed, relative to
          // the cup's current position, so the first onPointerMove doesn't
          // snap the cup's center to the touch point (see handleMove).
          const originX = meshRef.current?.parent?.position.x ?? 0;
          grabOffsetX.current = event.point.x - originX - posX.value;
          grabOffsetZ.current = event.point.z - posZ.value;
          // Lift off the counter (and out of any slot) while carried.
          posY.value = withSpring(y + 0.1);
          rotX.value = withSpring(0);
          // Captures this pointerId to the cup so onPointerMove/onPointerUp keep firing even
          // if the finger strays past the catcher plane's bounds — without this, a release
          // outside any hit-testable geometry would never reach handleUp and strand
          // isDragging as true forever. event.target here is unambiguously the cup (this is
          // the pointerdown handler), so it's safe to store for release later.
          const target = event.target as unknown as CaptureTarget;
          target.setPointerCapture(event.pointerId);
          capturedTarget.current = target;
          trackedPointerId.current = event.pointerId;
        }}
        onPointerUp={handleUp}
      >
        {children ?? (
          <>
            <cylinderGeometry args={[0.1, 0.08, 0.12, 16]} />
            <meshStandardMaterial color="white" />
          </>
        )}
      </mesh>
    </>
  );
}
