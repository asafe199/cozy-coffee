import React, { useRef, useState } from 'react';
import { levelConfig } from '../../game/levels';
import { useGameStore } from '../../state/gameStore';
import { stationForItem } from '../../game/orders';
import { CupDraggable } from '../CoffeeStation/CupDraggable';
import { ModelParts } from '../shared/props/ModelParts';
import { RecipeItemView } from './RecipeItemView';
import { SPECS } from './specs';
import type { ExtraRecipe } from '../../game/types';

const AMBAR = '#F3B45A';
const DISABLED = '#5a5a5a';
const materialProps = { flatShading: true, roughness: 0.8, metalness: 0.05 } as const;

/**
 * Generic station for juice, pancakes and salad: drag the item onto the
 * appliance, tap the appliance to run it, optionally drag the item to the
 * extra (ice / honey / dressing), then tap "done". Like the toast station, the
 * player is never blocked: skipping steps only costs stars in the review, and
 * an untouched station records a null prep.
 */
export function RecipeStation({ recipe }: { recipe: ExtraRecipe }) {
  const spec = SPECS[recipe];
  const completeItem = useGameStore((state) => state.completeItem);
  const startTransition = useGameStore((state) => state.startTransition);
  const isTransitioning = useGameStore((state) => state.isTransitioning);
  const level = useGameStore((state) => state.level);
  const { tableScale, tableColor } = levelConfig(level);
  const isActive = useGameStore(
    (state) =>
      !!state.currentOrder &&
      stationForItem(state.currentOrder.items[state.itemIndex] ?? state.currentOrder.items[0]) === spec.scene,
  );

  const startRef = useRef<number | null>(null);
  const [itemZone, setItemZone] = useState<string | null>(null);
  const [extraAdded, setExtraAdded] = useState(false);
  const [processed, setProcessed] = useState(false);

  const handleDroppedOn = (zoneId: string | null) => {
    setItemZone(zoneId);
    if (zoneId === spec.extraZone.id) {
      setExtraAdded(true);
    }
  };

  const handleProcess = () => {
    if (isTransitioning || processed || itemZone !== spec.applianceZone.id) {
      return;
    }
    startRef.current = Date.now();
    setProcessed(true);
  };

  const handleDone = () => {
    if (isTransitioning || !isActive) {
      return;
    }
    const start = startRef.current;
    const next = completeItem(
      start === null ? null : { recipe, extraAdded, processMs: Date.now() - start },
    );
    startTransition(next);
  };

  return (
    <group>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[2.6 * tableScale, 0.1, 2.0 * tableScale]} />
        <meshStandardMaterial color={tableColor} {...materialProps} />
      </mesh>

      <mesh position={[spec.applianceZone.x, 0, spec.appliance.z]} onPointerDown={handleProcess}>
        <ModelParts data={spec.appliance.model} scale={spec.appliance.scale} offsetY={spec.appliance.offsetY} />
      </mesh>

      {spec.extraProp.model ? (
        <mesh position={[spec.extraZone.x, 0, spec.extraZone.z + 0.25]}>
          <ModelParts data={spec.extraProp.model} scale={spec.extraProp.scale} />
        </mesh>
      ) : (
        // Ice bucket: a small tub of cubes beside the drop zone.
        <group position={[spec.extraZone.x, 0, spec.extraZone.z + 0.25]}>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.1, 0.08, 0.1, 12]} />
            <meshStandardMaterial color="#8fb8d6" {...materialProps} />
          </mesh>
          {[-0.04, 0.03, 0].map((x, i) => (
            <mesh key={i} position={[x, 0.11, (i - 1) * 0.03]} rotation={[0.3 * i, 0.5 * i, 0]}>
              <boxGeometry args={[0.05, 0.05, 0.05]} />
              <meshStandardMaterial color="#d9f1ff" transparent opacity={0.85} {...materialProps} />
            </mesh>
          ))}
        </group>
      )}

      <CupDraggable onDroppedOn={handleDroppedOn} zones={[spec.applianceZone, spec.extraZone]} y={0.02}>
        <RecipeItemView spec={spec} processed={processed} extraAdded={extraAdded} offsetY={-0.02} />
      </CupDraggable>

      <mesh position={[0, 0.05, 0.85]} onPointerDown={handleDone}>
        <boxGeometry args={[0.5, 0.1, 0.25]} />
        <meshStandardMaterial color={processed ? AMBAR : DISABLED} {...materialProps} />
      </mesh>
    </group>
  );
}
