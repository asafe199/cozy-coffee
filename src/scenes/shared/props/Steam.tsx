import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const WISPS = 3;

/** Soft puffs that rise, drift and fade above something hot; render as a child of the dish. */
export function Steam({ active, position = [0, 0, 0] }: { active: boolean; position?: [number, number, number] }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const t = useRef(0);
  useFrame((_s, delta) => {
    t.current += delta;
    refs.current.forEach((m, i) => {
      if (!m) return;
      m.visible = active;
      if (!active) return;
      const phase = (t.current * 0.45 + i / WISPS) % 1;
      m.position.set(Math.sin(phase * 5 + i * 2) * 0.02, phase * 0.2, Math.cos(phase * 4 + i) * 0.015);
      const s = 0.6 + phase * 0.8;
      m.scale.setScalar(s);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - phase);
    });
  });
  return (
    <group position={position}>
      {Array.from({ length: WISPS }, (_, i) => (
        <mesh key={i} ref={(m) => { refs.current[i] = m; }} visible={false}>
          <sphereGeometry args={[0.025, 8, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
