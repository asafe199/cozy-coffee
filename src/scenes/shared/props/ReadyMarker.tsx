import React from 'react';

const AMBAR = '#F3B45A';
const mat = { flatShading: true, roughness: 0.8, metalness: 0.05 } as const;

/**
 * An "X" painted on the counter marking where to drop a prepared item to
 * send it to the delivery counter — replaces the old tap-to-finish button.
 * Always the same amber color: dropping here is never blocked, so there's
 * no "disabled" state to show.
 */
export function ReadyMarker({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.5, 0.06, 0.01]} />
        <meshStandardMaterial color={AMBAR} {...mat} />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.5, 0.06, 0.01]} />
        <meshStandardMaterial color={AMBAR} {...mat} />
      </mesh>
    </group>
  );
}
