import React from 'react';
import { ModelParts } from './ModelParts';
import { CUP_EMPTY } from './models.generated';

const mat = { flatShading: true, roughness: 0.9, metalness: 0.02 } as const;

function CupStack({ position, count }: { position: [number, number, number]; count: number }) {
  return (
    <group position={position}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[0, i * 0.045, 0]}>
          <ModelParts data={CUP_EMPTY} scale={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function Cloth({ position, color, rotY = 0, folds = 2 }: { position: [number, number, number]; color: string; rotY?: number; folds?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {Array.from({ length: folds }, (_, i) => (
        <mesh key={i} position={[0, 0.012 + i * 0.026, 0]} rotation={[0, i * 0.12, 0]}>
          <boxGeometry args={[0.3, 0.024, 0.2]} />
          <meshStandardMaterial color={i % 2 ? '#F6E3C7' : color} {...mat} />
        </mesh>
      ))}
    </group>
  );
}

/** Apron hanging from a small wooden post. */
function ApronPost({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.9, 8]} />
        <meshStandardMaterial color="#4A2F1F" {...mat} />
      </mesh>
      <mesh position={[0, 0.88, 0.06]}>
        <boxGeometry args={[0.04, 0.04, 0.16]} />
        <meshStandardMaterial color="#4A2F1F" {...mat} />
      </mesh>
      <mesh position={[0, 0.62, 0.14]}>
        <boxGeometry args={[0.3, 0.42, 0.02]} />
        <meshStandardMaterial color="#3E5C76" {...mat} />
      </mesh>
      <mesh position={[0, 0.5, 0.16]}>
        <boxGeometry args={[0.2, 0.1, 0.015]} />
        <meshStandardMaterial color="#5B7C99" {...mat} />
      </mesh>
      <mesh position={[0, 0.85, 0.12]}>
        <boxGeometry args={[0.18, 0.04, 0.02]} />
        <meshStandardMaterial color="#2C4358" {...mat} />
      </mesh>
    </group>
  );
}

/** Non-interactive props for the coffee counter: cups, cloths, apron. Keeps clear of the drop zones. */
export function CoffeeDecor() {
  return (
    <group>
      <CupStack position={[0.95, 0, -0.55]} count={5} />
      <CupStack position={[0.62, 0, -0.62]} count={3} />
      <mesh position={[0.3, 0, -0.65]}>
        <ModelParts data={CUP_EMPTY} scale={0.2} />
      </mesh>
      <mesh position={[0.12, 0, -0.6]}>
        <ModelParts data={CUP_EMPTY} scale={0.2} />
      </mesh>
      <Cloth position={[-0.15, 0, -0.65]} color="#A8532F" rotY={0.15} folds={3} />
      <Cloth position={[-0.9, 0, -0.7]} color="#6FA088" rotY={-0.2} />
      <ApronPost position={[1.15, 0, -0.2]} />
    </group>
  );
}
