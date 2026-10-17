import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export const COFFEE_COLOR = '#4A2A18';
const RADIUS = 0.07;
const MAX_HEIGHT = 0.1;

interface CoffeeLiquidProps {
  filled: boolean;
  // Local y of the cup's inner floor.
  baseY?: number;
  // Seconds to fill; 0 jumps straight to full (for already-served cups).
  seconds?: number;
  color?: string;
  radius?: number;
  maxHeight?: number;
}

/** Coffee surface rising inside a cup; render as a child of the cup mesh. */
export function CoffeeLiquid({
  filled,
  baseY = -0.045,
  seconds = 1.4,
  color = COFFEE_COLOR,
  radius = RADIUS,
  maxHeight = MAX_HEIGHT,
}: CoffeeLiquidProps) {
  const ref = useRef<THREE.Mesh>(null);
  const progress = useRef(filled && seconds === 0 ? 1 : 0);
  useFrame((_s, delta) => {
    const m = ref.current;
    if (!m) return;
    const target = filled ? 1 : 0;
    const step = seconds === 0 ? 1 : delta / seconds;
    progress.current += Math.sign(target - progress.current) * Math.min(Math.abs(target - progress.current), step);
    const p = progress.current;
    m.visible = p > 0.01;
    m.scale.y = Math.max(p, 0.001);
    m.position.y = baseY + (maxHeight / 2) * p;
  });
  return (
    <mesh ref={ref} visible={false}>
      <cylinderGeometry args={[radius, radius * 0.9, maxHeight, 14]} />
      <meshStandardMaterial color={color} roughness={0.3} />
    </mesh>
  );
}

/** Thin stream falling from the spout while a pour is in progress. */
export function PourStream({
  active,
  position,
  length,
  seconds = 1.4,
}: {
  active: boolean;
  position: [number, number, number];
  length: number;
  seconds?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);
  useFrame((_s, delta) => {
    if (!ref.current) return;
    elapsed.current = active ? elapsed.current + delta : 0;
    ref.current.visible = active && elapsed.current < seconds;
  });
  return (
    <mesh ref={ref} position={position} visible={false}>
      <cylinderGeometry args={[0.012, 0.012, length, 8]} />
      <meshStandardMaterial color={COFFEE_COLOR} roughness={0.3} />
    </mesh>
  );
}
