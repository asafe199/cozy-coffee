import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { ItemPrep } from '../../game/types';
import { TOAST_BURN_THRESHOLD_MS, TOAST_MIN_MS } from '../../game/review';
import { ModelParts } from '../shared/props/ModelParts';
import { CoffeeLiquid } from '../shared/props/CoffeeLiquid';
import { BREAD, CUP_EMPTY } from '../shared/props/models.generated';

// Direction A "Madeira & Âmbar" palette.
const MADEIRA = '#6B4226';
const NOGUEIRA = '#4A2F1F';
const TOP = '#B07A3A';
const CREME = '#F6E3C7';
const mat = { flatShading: true, roughness: 0.8, metalness: 0.05 } as const;

const TOP_Y = 0.78;

function toastTint(prep: ItemPrep | null | undefined): string {
  if (!prep || prep.recipe !== 'toast' || prep.toastedMs < TOAST_MIN_MS) return '#ffffff';
  return prep.toastedMs >= TOAST_BURN_THRESHOLD_MS ? '#3a2418' : '#8a5a3a';
}

function ServedItem({ recipe, prep, x }: { recipe: 'coffee' | 'toast'; prep: ItemPrep | null | undefined; x: number }) {
  if (recipe === 'coffee') {
    const poured = prep?.recipe === 'coffee';
    return (
      <group position={[x, TOP_Y, 0.2]}>
        {/* saucer */}
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 0.02, 16]} />
          <meshStandardMaterial color={CREME} {...mat} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <ModelParts data={CUP_EMPTY} scale={0.3} />
        </mesh>
        <group position={[0, 0.02, 0]} scale={1.364}>
          <CoffeeLiquid filled={poured} baseY={0.015} seconds={0} />
        </group>
        {prep?.recipe === 'coffee' && prep.sugarAdded && (
          <mesh position={[0.2, 0.03, 0.05]}>
            <boxGeometry args={[0.06, 0.06, 0.06]} />
            <meshStandardMaterial color="#ffffff" {...mat} />
          </mesh>
        )}
      </group>
    );
  }
  return (
    <group position={[x, TOP_Y, 0.2]}>
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.02, 18]} />
        <meshStandardMaterial color={CREME} {...mat} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <ModelParts data={BREAD} scale={0.3} tint={toastTint(prep)} />
      </mesh>
      {prep?.recipe === 'toast' && prep.butterAdded && (
        <mesh position={[0, 0.07, 0]}>
          <boxGeometry args={[0.09, 0.03, 0.07]} />
          <meshStandardMaterial color="#F7E48A" {...mat} />
        </mesh>
      )}
    </group>
  );
}

function CashRegister({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[0.44, 0.18, 0.34]} />
        <meshStandardMaterial color="#3a3a3a" {...mat} />
      </mesh>
      {/* Customer display, tilted */}
      <mesh position={[0, 0.27, -0.08]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[0.3, 0.16, 0.03]} />
        <meshStandardMaterial color="#2a2a2a" {...mat} />
      </mesh>
      <mesh position={[0, 0.27, -0.065]} rotation={[-0.35, 0, 0]}>
        <boxGeometry args={[0.25, 0.11, 0.01]} />
        <meshBasicMaterial color="#8fd3c8" />
      </mesh>
      {/* Open cash drawer with bills */}
      <mesh position={[0, 0.03, 0.22]}>
        <boxGeometry args={[0.4, 0.05, 0.14]} />
        <meshStandardMaterial color="#555555" {...mat} />
      </mesh>
      {[-0.1, 0, 0.1].map((dx, i) => (
        <mesh key={i} position={[dx, 0.062, 0.22]}>
          <boxGeometry args={[0.08, 0.012, 0.11]} />
          <meshStandardMaterial color={['#5E8A5A', '#7DAA73', '#5E8A5A'][i]} {...mat} />
        </mesh>
      ))}
    </group>
  );
}

function Computer({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.09, 0.1, 0.04, 12]} />
        <meshStandardMaterial color="#2a2a2a" {...mat} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.04, 0.16, 0.04]} />
        <meshStandardMaterial color="#2a2a2a" {...mat} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.5, 0.32, 0.04]} />
        <meshStandardMaterial color="#2a2a2a" {...mat} />
      </mesh>
      <mesh position={[0, 0.3, 0.025]}>
        <boxGeometry args={[0.45, 0.27, 0.01]} />
        <meshBasicMaterial color="#9ad6e8" />
      </mesh>
      <mesh position={[0, 0.012, 0.28]}>
        <boxGeometry args={[0.38, 0.024, 0.13]} />
        <meshStandardMaterial color="#d9d9d9" {...mat} />
      </mesh>
      <mesh position={[0.3, 0.012, 0.28]}>
        <boxGeometry args={[0.06, 0.024, 0.09]} />
        <meshStandardMaterial color="#d9d9d9" {...mat} />
      </mesh>
    </group>
  );
}

function TipJar({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.22, 14]} />
        <meshStandardMaterial color="#cfe8e4" transparent opacity={0.35} {...mat} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.sin(i * 1.7) * 0.04, 0.02 + i * 0.012, Math.cos(i * 1.7) * 0.04]} rotation={[Math.PI / 2 - 0.2 * i, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.006, 10]} />
          <meshStandardMaterial color="#E0B040" metalness={0.5} roughness={0.4} flatShading />
        </mesh>
      ))}
      {/* Lid and label */}
      <mesh position={[0, 0.23, 0]}>
        <cylinderGeometry args={[0.095, 0.095, 0.02, 14]} />
        <meshStandardMaterial color="#F3B45A" {...mat} />
      </mesh>
      <mesh position={[0, 0.12, 0.092]}>
        <boxGeometry args={[0.09, 0.05, 0.005]} />
        <meshStandardMaterial color="#F3B45A" {...mat} />
      </mesh>
    </group>
  );
}

/**
 * Delivery counter: a wide flat counter with a register, computer and tip jar.
 * The items prepared at the stations are served on it; tapping the counter
 * (or any item) delivers the order (null preps are valid — delivery is never
 * blocked) and returns to the order board.
 */
export function DeliveryCounter() {
  const deliverOrder = useGameStore((state) => state.deliverOrder);
  const startTransition = useGameStore((state) => state.startTransition);
  const isTransitioning = useGameStore((state) => state.isTransitioning);
  const currentOrder = useGameStore((state) => state.currentOrder);
  const preps = useGameStore((state) => state.preps);

  const handleDeliver = () => {
    if (isTransitioning) {
      return;
    }
    deliverOrder();
    startTransition('orderBoard');
  };

  const items = currentOrder?.items ?? [];

  return (
    <group>
      {/* Counter body, front planks and top slab */}
      <mesh position={[0, 0.37, 0]} onPointerDown={handleDeliver}>
        <boxGeometry args={[3.6, 0.74, 1.0]} />
        <meshStandardMaterial color={MADEIRA} {...mat} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[-1.65 + i * 0.3, 0.37, 0.505]}>
          <boxGeometry args={[0.02, 0.66, 0.01]} />
          <meshStandardMaterial color={NOGUEIRA} {...mat} />
        </mesh>
      ))}
      <mesh position={[0, 0.76, 0]} onPointerDown={handleDeliver}>
        <boxGeometry args={[3.8, 0.04, 1.1]} />
        <meshStandardMaterial color={TOP} {...mat} />
      </mesh>

      <Computer position={[-1.3, TOP_Y, -0.2]} />
      <CashRegister position={[1.25, TOP_Y, -0.2]} />
      <TipJar position={[0.7, TOP_Y, -0.3]} />

      {items.map((item, i) => (
        <ServedItem
          key={i}
          recipe={item.recipe}
          prep={preps[i]}
          x={(i - (items.length - 1) / 2) * 0.7}
        />
      ))}
    </group>
  );
}
