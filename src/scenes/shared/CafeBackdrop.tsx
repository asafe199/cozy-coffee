import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ModelParts } from './props/ModelParts';
import { CUP_EMPTY } from './props/models.generated';

const PLASTER = '#C99D72';
const WAINSCOT = '#5A3822';
const MADEIRA = '#6B4226';
const NOGUEIRA = '#4A2F1F';
const GLASS = '#FFE2A8';
const PLANT = '#5E8A5A';
const POT = '#A8532F';
const mat = { flatShading: true, roughness: 0.85, metalness: 0.05 } as const;

function Window({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.8, 0.9, 0.04]} />
        <meshBasicMaterial color={GLASS} />
      </mesh>
      {/* Frame + cross bars */}
      {[
        [0, 0.47, 0.88, 0.07],
        [0, -0.47, 0.88, 0.07],
        [-0.43, 0, 0.07, 0.94],
        [0.43, 0, 0.07, 0.94],
        [0, 0, 0.04, 0.9],
        [0, 0, 0.8, 0.04],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0.03]}>
          <boxGeometry args={[w, h, 0.05]} />
          <meshStandardMaterial color={MADEIRA} {...mat} />
        </mesh>
      ))}
    </group>
  );
}

function Lamp({ position, drop, phase = 0 }: { position: [number, number, number]; drop: number; phase?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.8 + phase) * 0.05;
  });
  return (
    <group position={position} ref={ref}>
      <mesh position={[0, drop / 2, 0]}>
        <cylinderGeometry args={[0.008, 0.008, drop, 6]} />
        <meshStandardMaterial color={NOGUEIRA} {...mat} />
      </mesh>
      <mesh>
        <coneGeometry args={[0.16, 0.14, 12, 1, true]} />
        <meshStandardMaterial color="#2F4A3E" side={2} {...mat} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshBasicMaterial color={GLASS} />
      </mesh>
    </group>
  );
}

function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.1, 0.07, 0.2, 10]} />
        <meshStandardMaterial color={POT} {...mat} />
      </mesh>
      {[
        [0, 0.3, 0, 0.14],
        [-0.08, 0.24, 0.02, 0.09],
        [0.08, 0.26, -0.02, 0.1],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 8, 8]} />
          <meshStandardMaterial color={PLANT} {...mat} />
        </mesh>
      ))}
    </group>
  );
}

function Shelf({ position, cups }: { position: [number, number, number]; cups: number }) {
  return (
    <group position={position}>
      <mesh position={[0, -0.02, 0.1]}>
        <boxGeometry args={[1.5, 0.04, 0.2]} />
        <meshStandardMaterial color={MADEIRA} {...mat} />
      </mesh>
      {Array.from({ length: cups }, (_, i) => (
        <mesh key={i} position={[-0.6 + i * (1.2 / Math.max(cups - 1, 1)), 0, 0.1]}>
          <ModelParts data={CUP_EMPTY} scale={0.13} />
        </mesh>
      ))}
    </group>
  );
}


/** Dust motes drifting in the warm light. */
function Motes({ area, count = 14 }: { area: [number, number, number]; count?: number }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const seeds = useRef(Array.from({ length: count }, (_, i) => ({ x: Math.sin(i * 12.9) , y: Math.cos(i * 7.3), z: Math.sin(i * 3.1), s: 0.2 + (i % 5) * 0.08 })));
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    seeds.current.forEach((d, i) => {
      const m = refs.current[i];
      if (!m) return;
      m.position.set(
        d.x * area[0] + Math.sin(t * d.s + i) * 0.12,
        ((d.y * 0.5 + 0.5 + t * 0.02 * d.s * 4) % 1) * area[1],
        d.z * area[2]
      );
    });
  });
  return (
    <group>
      {seeds.current.map((_, i) => (
        <mesh key={i} ref={(m) => { refs.current[i] = m; }}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshBasicMaterial color={GLASS} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/** Steam wisps rising and fading from a point. */
function Steam({ position }: { position: [number, number, number] }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      const k = (clock.elapsedTime * 0.25 + i / 3) % 1;
      m.position.set(Math.sin(k * 6 + i) * 0.03, k * 0.35, 0);
      m.scale.setScalar(0.6 + k);
      (m.material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - k);
    });
  });
  return (
    <group position={position}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(m) => { refs.current[i] = m; }}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/** String of warm bulbs that gently twinkle. */
function StringLights({ y, z, width }: { y: number; z: number; width: number }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const n = 9;
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      if (m) m.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2 + i * 1.7) * 0.25);
    });
  });
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const u = i / (n - 1);
        return (
          <mesh key={i} ref={(m) => { refs.current[i] = m; }} position={[(u - 0.5) * width, y - Math.sin(u * Math.PI) * 0.12, z]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color={i % 2 ? '#FFD27A' : '#FFB35A'} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Wall clock with a moving second hand. */
function WallClock({ position }: { position: [number, number, number] }) {
  const hand = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (hand.current) hand.current.rotation.z = -clock.elapsedTime * 0.5;
  });
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.04, 20]} />
        <meshStandardMaterial color="#F6E3C7" {...mat} />
      </mesh>
      <group ref={hand} position={[0, 0, 0.03]}>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.012, 0.1, 0.01]} />
          <meshStandardMaterial color={NOGUEIRA} {...mat} />
        </mesh>
      </group>
      <mesh position={[0.03, 0, 0.03]} rotation={[0, 0, 1.2]}>
        <boxGeometry args={[0.02, 0.07, 0.01]} />
        <meshStandardMaterial color={NOGUEIRA} {...mat} />
      </mesh>
    </group>
  );
}

/** Framed poster with a simple colored motif. */
function Poster({ position, color, tilt = 0 }: { position: [number, number, number]; color: string; tilt?: number }) {
  return (
    <group position={position} rotation={[0, 0, tilt]}>
      <mesh>
        <boxGeometry args={[0.34, 0.44, 0.03]} />
        <meshStandardMaterial color={MADEIRA} {...mat} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.28, 0.38, 0.01]} />
        <meshStandardMaterial color="#F6E3C7" {...mat} />
      </mesh>
      <mesh position={[0, 0.03, 0.03]}>
        <circleGeometry args={[0.08, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, -0.12, 0.03]}>
        <boxGeometry args={[0.18, 0.03, 0.005]} />
        <meshBasicMaterial color={NOGUEIRA} />
      </mesh>
    </group>
  );
}

/**
 * Cafe backdrop: plaster wall, wood wainscot, windows, pendant lamps, plants.
 * 'counter' sits behind the station counters (camera looks down at them);
 * 'board' is a flat wall behind the order board (camera looks straight on).
 */
export function CafeBackdrop({ variant }: { variant: 'counter' | 'board' }) {
  if (variant === 'board') {
    return (
      <group>
        <mesh position={[0, 0, -0.2]}>
          <boxGeometry args={[6, 5, 0.05]} />
          <meshStandardMaterial color={PLASTER} {...mat} />
        </mesh>
        <mesh position={[0, -1.2, -0.17]}>
          <boxGeometry args={[6, 1.4, 0.05]} />
          <meshStandardMaterial color={WAINSCOT} {...mat} />
        </mesh>
        <Window position={[-1.6, 0.2, -0.15]} />
        <Window position={[1.6, 0.2, -0.15]} />
        <Lamp position={[-0.9, 1.5, 0.1]} drop={0.4} phase={1} />
        <Lamp position={[0.9, 1.5, 0.1]} drop={0.4} />
        <Plant position={[-1.45, -1.55, 0.1]} />
        <Plant position={[1.45, -1.55, 0.1]} />
        <StringLights y={1.55} z={-0.1} width={3.4} />
        <WallClock position={[0, 1.15, -0.12]} />
        <Poster position={[-1.15, 0.2, -0.15]} color="#A8532F" tilt={0.03} />
        <Poster position={[1.15, 0.2, -0.15]} color="#6FA088" tilt={-0.03} />
        <Motes area={[1.8, 2.4, 0.6]} />
        <pointLight position={[0, 0.6, 1]} color={0xffd8a0} intensity={0.8} />
      </group>
    );
  }
  return (
    <group>
      <mesh position={[0, 1, -1.25]}>
        <boxGeometry args={[6, 4, 0.05]} />
        <meshStandardMaterial color={PLASTER} {...mat} />
      </mesh>
      <mesh position={[0, 0.2, -1.2]}>
        <boxGeometry args={[6, 0.5, 0.05]} />
        <meshStandardMaterial color={WAINSCOT} {...mat} />
      </mesh>
      <Shelf position={[-0.2, 0.85, -1.25]} cups={5} />
      <Shelf position={[-0.2, 1.2, -1.25]} cups={4} />
      <Window position={[1.55, 0.95, -1.2]} />
      <Lamp position={[-1.3, 1.45, -0.9]} drop={0.5} />
      <Lamp position={[1.0, 1.45, -0.9]} drop={0.5} phase={2} />
      <Plant position={[-1.35, 0, -1.0]} />
      <StringLights y={1.6} z={-1.1} width={3.2} />
      <WallClock position={[0.9, 1.3, -1.2]} />
      <Poster position={[0.5, 1.0, -1.2]} color="#A8532F" tilt={0.03} />
      <Steam position={[0.3, 1.2, -1.1]} />
      <Motes area={[1.4, 1.6, 0.8]} />
      <pointLight position={[0, 1.2, 0.2]} color={0xffd8a0} intensity={0.6} />
    </group>
  );
}
