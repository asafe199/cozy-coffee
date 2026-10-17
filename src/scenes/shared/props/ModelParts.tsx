import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { ModelData } from './modelData';

interface ModelPartsProps {
  data: ModelData;
  // Multiplier applied to the model (its largest dimension is 1).
  scale: number;
  // Vertical shift, for parents whose origin isn't the model's base.
  offsetY?: number;
  // Multiplies the baked vertex colors (e.g. darker while toasting).
  tint?: string;
}

/** Geometry + vertex-colored material for a baked low-poly model; use as mesh children. */
export function ModelParts({ data, scale, offsetY = 0, tint = '#ffffff' }: ModelPartsProps) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(data.normals, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(data.colors, 3));
    g.setIndex(data.indices);
    g.scale(scale, scale, scale);
    g.translate(0, offsetY, 0);
    return g;
  }, [data, scale, offsetY]);

  return (
    <>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial vertexColors color={tint} roughness={0.8} metalness={0.05} />
    </>
  );
}
