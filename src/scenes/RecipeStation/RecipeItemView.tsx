import { Steam } from '../shared/props/Steam';
import React from 'react';
import { ModelParts } from '../shared/props/ModelParts';
import { CoffeeLiquid } from '../shared/props/CoffeeLiquid';
import type { RecipeSpec } from './specs';

const mat = { flatShading: true, roughness: 0.6, metalness: 0.05 } as const;

function Extra({ kind, size }: { kind: RecipeSpec['extraKind']; size: number }) {
  if (kind === 'ice') {
    return (
      <group position={[0, 0.17 * size, 0]}>
        {[-0.03, 0.02, 0].map((x, i) => (
          <mesh key={i} position={[x, i * 0.02, (i - 1) * 0.02]} rotation={[0.3 * i, 0.5 * i, 0]}>
            <boxGeometry args={[0.04, 0.04, 0.04]} />
            <meshStandardMaterial color="#d9f1ff" transparent opacity={0.85} {...mat} />
          </mesh>
        ))}
      </group>
    );
  }
  if (kind === 'honey') {
    return (
      <mesh position={[0, 0.07 * size, 0]}>
        <cylinderGeometry args={[0.07 * size, 0.07 * size, 0.012, 14]} />
        <meshStandardMaterial color="#E8A317" {...mat} />
      </mesh>
    );
  }
  return (
    <mesh position={[0, 0.07 * size, 0]}>
      <cylinderGeometry args={[0.06 * size, 0.06 * size, 0.012, 14]} />
      <meshStandardMaterial color="#C9D76B" {...mat} />
    </mesh>
  );
}

interface Props {
  spec: RecipeSpec;
  processed: boolean;
  extraAdded: boolean;
  // Multiplier for a bigger rendering (the counter shows items larger than the station).
  size?: number;
  // Seconds for the glass to fill; 0 shows it already full.
  fillSeconds?: number;
  // Vertical shift of the whole dish, for parents whose origin isn't its base.
  offsetY?: number;
}

/** The dish as it looks at each step; render as children of a mesh/group at the item's base. */
export function RecipeItemView({ spec, processed, extraAdded, size = 1, fillSeconds = 1.4, offsetY = 0 }: Props) {
  const model = processed ? spec.item.after : spec.item.before;
  return (
    <>
      <ModelParts data={model} scale={spec.item.scale * size} offsetY={offsetY} tint={processed ? spec.item.tintAfter : undefined} />
      {spec.liquidColor && (
        <group scale={size} position={[0, offsetY, 0]}>
          <CoffeeLiquid
            filled={processed}
            baseY={0.01}
            seconds={fillSeconds}
            color={spec.liquidColor}
            radius={0.07}
            maxHeight={0.17}
          />
        </group>
      )}
      {spec.recipe === 'pancakes' && (
        <Steam active={processed} position={[0, offsetY + 0.06 * size, 0]} />
      )}
      {extraAdded && (
        <group position={[0, offsetY, 0]}>
          <Extra kind={spec.extraKind} size={size} />
        </group>
      )}
    </>
  );
}
