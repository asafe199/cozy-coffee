import React from 'react';
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

function Lamp({ position, drop }: { position: [number, number, number]; drop: number }) {
  return (
    <group position={position}>
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
          <boxGeometry args={[9, 5, 0.05]} />
          <meshStandardMaterial color={PLASTER} {...mat} />
        </mesh>
        <mesh position={[0, -1.2, -0.17]}>
          <boxGeometry args={[9, 1.4, 0.05]} />
          <meshStandardMaterial color={WAINSCOT} {...mat} />
        </mesh>
        <Window position={[-1.6, 0.2, -0.15]} />
        <Window position={[1.6, 0.2, -0.15]} />
        <Lamp position={[-0.9, 1.5, 0.1]} drop={0.4} />
        <Lamp position={[0.9, 1.5, 0.1]} drop={0.4} />
        <Plant position={[-1.45, -1.55, 0.1]} />
        <Plant position={[1.45, -1.55, 0.1]} />
        <pointLight position={[0, 0.6, 1]} color={0xffd8a0} intensity={0.8} />
      </group>
    );
  }
  return (
    <group>
      <mesh position={[0, 1, -1.25]}>
        <boxGeometry args={[9, 4, 0.05]} />
        <meshStandardMaterial color={PLASTER} {...mat} />
      </mesh>
      <mesh position={[0, 0.2, -1.2]}>
        <boxGeometry args={[9, 0.5, 0.05]} />
        <meshStandardMaterial color={WAINSCOT} {...mat} />
      </mesh>
      <Shelf position={[-0.2, 0.85, -1.25]} cups={5} />
      <Shelf position={[-0.2, 1.2, -1.25]} cups={4} />
      <Window position={[1.55, 0.95, -1.2]} />
      <Lamp position={[-1.3, 1.45, -0.9]} drop={0.5} />
      <Lamp position={[1.0, 1.45, -0.9]} drop={0.5} />
      <Plant position={[-1.35, 0, -1.0]} />
      <pointLight position={[0, 1.2, 0.2]} color={0xffd8a0} intensity={0.6} />
    </group>
  );
}
