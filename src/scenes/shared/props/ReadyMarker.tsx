import React from 'react';

const CREME = '#F6E3C7';
const AMBAR = '#F3B45A';
const mat = { flatShading: true, roughness: 0.8, metalness: 0.05 } as const;

/**
 * An empty plate sitting on the counter marking where to drop a prepared
 * item to send it to the delivery counter — replaces the old "X" marker
 * (itself a replacement for an even older tap-to-finish button). Same
 * drop-to-complete mechanic, just reads as "put it on the plate" instead of
 * an abstract X. Always the same look: dropping here is never blocked, so
 * there's no "disabled" state to show.
 */
export function ReadyMarker({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.005, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.01, 20]} />
        <meshStandardMaterial color={CREME} {...mat} />
      </mesh>
      <mesh position={[0, 0.011, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.002, 20]} />
        <meshStandardMaterial color={AMBAR} {...mat} />
      </mesh>
    </group>
  );
}
