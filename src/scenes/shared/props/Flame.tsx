import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const TONGUES = 3;
const COLORS = ['#ff8a3d', '#ffc14d', '#ff6a2d'];

/** Small flickering flame cones; render beside/under a hot appliance while something cooks on it. */
export function Flame({ active, position = [0, 0, 0] }: { active: boolean; position?: [number, number, number] }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const t = useRef(0);
  useFrame((_s, delta) => {
    t.current += delta;
    refs.current.forEach((m, i) => {
      if (!m) return;
      m.visible = active;
      if (!active) return;
      const flicker = Math.sin(t.current * 9 + i * 2.1) * 0.5 + Math.sin(t.current * 17 + i) * 0.5;
      const s = 0.75 + flicker * 0.18;
      m.scale.set(s, 0.85 + flicker * 0.25, s);
      m.position.x = (i - (TONGUES - 1) / 2) * 0.045 + Math.sin(t.current * 6 + i * 3) * 0.012;
      (m.material as THREE.MeshBasicMaterial).opacity = 0.75 + flicker * 0.2;
    });
  });
  return (
    <group position={position}>
      {Array.from({ length: TONGUES }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => { refs.current[i] = m; }}
          position={[(i - (TONGUES - 1) / 2) * 0.045, 0.03, 0]}
          visible={false}
        >
          <coneGeometry args={[0.025, 0.07, 6]} />
          <meshBasicMaterial color={COLORS[i % COLORS.length]} transparent opacity={0.85} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
