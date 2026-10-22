import { Steam } from '../shared/props/Steam';
import { SPECS } from '../RecipeStation/specs';
import { RecipeItemView } from '../RecipeStation/RecipeItemView';
import { levelConfig } from '../../game/levels';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../state/gameStore';
import { ItemPrep, Recipe } from '../../game/types';
import { TOAST_BURN_THRESHOLD_MS, TOAST_MIN_MS } from '../../game/review';
import { ModelParts } from '../shared/props/ModelParts';
import { CoffeeLiquid } from '../shared/props/CoffeeLiquid';
import { BREAD, CUP_EMPTY, GLASS } from '../shared/props/models.generated';
import { JUICE_FLAVORS } from '../JuiceStation/flavors';
import { counterTier } from './counterTiers';

// Direction A "Madeira & Âmbar" palette.
const NOGUEIRA = '#4A2F1F';
const TOP = '#B07A3A';
const CREME = '#F6E3C7';
const AMBAR = '#F3B45A';
const mat = { flatShading: true, roughness: 0.8, metalness: 0.05 } as const;

const TOP_Y = 0.78;

function toastTint(prep: ItemPrep | null | undefined): string {
  if (!prep || prep.recipe !== 'toast' || prep.toastedMs < TOAST_MIN_MS) return '#ffffff';
  return prep.toastedMs >= TOAST_BURN_THRESHOLD_MS ? '#3a2418' : '#8a5a3a';
}

function ServedItem({ recipe, prep, x }: { recipe: Recipe; prep: ItemPrep | null | undefined; x: number }) {
  if (recipe === 'juice') {
    const juicePrep = prep?.recipe === 'juice' ? prep : null;
    const color = juicePrep ? JUICE_FLAVORS[juicePrep.flavor].color : '#8a7a5a';
    return (
      <group position={[x, TOP_Y, 0.2]}>
        {/* saucer */}
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 0.02, 16]} />
          <meshStandardMaterial color={CREME} {...mat} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <ModelParts data={GLASS} scale={0.3} />
        </mesh>
        <group position={[0, 0.02, 0]} scale={1.364}>
          <CoffeeLiquid filled={juicePrep !== null} color={color} baseY={0.015} seconds={0} />
        </group>
      </group>
    );
  }
  if (recipe !== 'coffee' && recipe !== 'toast') {
    const spec = SPECS[recipe];
    const extraPrep = prep && prep.recipe === recipe && 'extraAdded' in prep ? prep : null;
    return (
      <group position={[x, TOP_Y, 0.2]}>
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.02, 18]} />
          <meshStandardMaterial color={CREME} {...mat} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <RecipeItemView
            spec={spec}
            processed={extraPrep !== null}
            extraAdded={extraPrep?.extraAdded ?? false}
            size={1.3}
            fillSeconds={0}
          />
        </mesh>
      </group>
    );
  }
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
        <Steam active={poured} position={[0, 0.16, 0]} />
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

/** Glass-front pastry display case with a few baked goods inside. */
function PastryCase({ position }: { position: [number, number, number] }) {
  const pastryColors = ['#8a5a33', '#d9a768', '#c85c4f'];
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.5, 0.2, 0.26]} />
        <meshStandardMaterial color={NOGUEIRA} {...mat} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <boxGeometry args={[0.46, 0.08, 0.22]} />
        <meshStandardMaterial color="#eaf4f6" transparent opacity={0.3} roughness={0.1} metalness={0.1} />
      </mesh>
      {pastryColors.map((c, i) => (
        <mesh key={i} position={[(i - 1) * 0.14, 0.16, 0]}>
          <cylinderGeometry args={[0.05, 0.055, 0.035, 12]} />
          <meshStandardMaterial color={c} {...mat} />
        </mesh>
      ))}
    </group>
  );
}

/** A serving cloche: glass dome over a stand, with a little steam rising. */
function Cloche({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.005, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.01, 20]} />
        <meshStandardMaterial color="#9a6b43" {...mat} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <sphereGeometry args={[0.1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#eaf4f6" transparent opacity={0.3} roughness={0.1} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.105, 0]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#F3B45A" {...mat} />
      </mesh>
      <Steam active position={[0, 0.17, 0]} />
    </group>
  );
}

/** A friendly, low-poly barista standing behind the counter — idle breathing + a slow head turn. */
function Barista({ position }: { position: [number, number, number] }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.scale.y = 1 + Math.sin(t * 1.1) * 0.012;
    g.rotation.y = Math.sin(t * 0.3) * 0.08;
  });
  return (
    <group ref={group} position={position}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.15, 0.28, 10]} />
        <meshStandardMaterial color="#6fa088" {...mat} />
      </mesh>
      <mesh position={[0, 0.48, 0]} castShadow>
        <sphereGeometry args={[0.085, 14, 10]} />
        <meshStandardMaterial color="#e8b48a" roughness={0.6} flatShading />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.088, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2.1]} />
        <meshStandardMaterial color={NOGUEIRA} {...mat} />
      </mesh>
      {[-0.035, 0.035].map((dx) => (
        <mesh key={dx} position={[dx, 0.485, 0.075]}>
          <sphereGeometry args={[0.009, 6, 6]} />
          <meshBasicMaterial color="#2B2729" />
        </mesh>
      ))}
      {[-0.15, 0.15].map((dx) => (
        <mesh key={dx} position={[dx, 0.3, 0.05]} rotation={[0, 0, dx > 0 ? -0.3 : 0.3]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
          <meshStandardMaterial color="#6fa088" {...mat} />
        </mesh>
      ))}
    </group>
  );
}

const CUSTOMER_SHIRTS = ['#c85c4f', '#8a6fb0', '#d9a768'];

/**
 * A customer waiting in line — same low-poly build as the barista, idly
 * shifting weight. The head turns independently (looking around the shop)
 * and one arm lifts in a slow, periodic gesture (checking a phone, waving at
 * the barista) — both driven by `phase` so customers in the same line never
 * move in sync.
 */
function WaitingCustomer({ position, shirt, phase }: { position: [number, number, number]; shirt: string; phase: number }) {
  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase;
    if (group.current) {
      group.current.scale.y = 1 + Math.sin(t * 1.0) * 0.012;
      group.current.rotation.y = Math.sin(t * 0.25) * 0.1;
    }
    if (head.current) {
      head.current.rotation.y = Math.sin(t * 0.35 + 1) * 0.5;
      head.current.rotation.x = Math.sin(t * 0.5) * 0.06;
    }
    if (arm.current) {
      // Rests down (0.3 rad out from the body) most of the time, lifts toward
      // a point/wave every so often — Math.max clips the sine to a brief hold.
      arm.current.rotation.z = 0.3 + Math.max(0, Math.sin(t * 0.6)) * 1.1;
    }
  });
  return (
    <group ref={group} position={position}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.15, 0.28, 10]} />
        <meshStandardMaterial color={shirt} {...mat} />
      </mesh>
      <group ref={head} position={[0, 0.28, 0]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <sphereGeometry args={[0.085, 14, 10]} />
          <meshStandardMaterial color="#e8b48a" roughness={0.6} flatShading />
        </mesh>
        <mesh position={[0, 0.22, 0]} castShadow>
          <sphereGeometry args={[0.088, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2.1]} />
          <meshStandardMaterial color={NOGUEIRA} {...mat} />
        </mesh>
      </group>
      {/* Pivoted from the shoulder (group origin), not the cylinder's own
          centre — the mesh sits offset below the group so rotating the group
          swings the arm naturally instead of see-sawing through the body. */}
      <group ref={arm} position={[-0.15, 0.375, 0.05]} rotation={[0, 0, 0.3]}>
        <mesh position={[0, -0.075, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
          <meshStandardMaterial color={shirt} {...mat} />
        </mesh>
      </group>
      <group position={[0.15, 0.375, 0.05]} rotation={[0, 0, -0.3]}>
        <mesh position={[0, -0.075, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
          <meshStandardMaterial color={shirt} {...mat} />
        </mesh>
      </group>
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
 * Delivery counter: a wide flat counter with a pastry display case, a
 * cloche, a tip jar, and a barista standing behind it — cozy "neighborhood
 * shop" composition (docs/superpowers/specs/2026-10-16-cozy-cafe-design.md,
 * "Fluxo de telas" reference mockups), not a modern POS. Customers waiting
 * in the queue stand in front of the counter (one per queued order, capped
 * at MAX_WAITING_CUSTOMERS). The items prepared at the stations are served
 * on it; tapping the counter (or any item) delivers the order (null preps
 * are valid — delivery is never blocked) and returns to the order board.
 *
 * Pilot for the "cafe gets fancier each level" shape+decor progression
 * (counterTiers.ts) — trim, kickplate, corner accents and a two-tone panel
 * stack up cumulatively, alongside a floor plant / hanging light / wall
 * piece that each get a nicer model at higher levels. If this reads well,
 * the same tier pattern extends to the other stations next.
 */
// Waiting customers are a visual read of queue length, not every order in
// it — capped so a long queue doesn't crowd the scene into clutter.
const MAX_WAITING_CUSTOMERS = 3;

export function DeliveryCounter() {
  const deliverOrder = useGameStore((state) => state.deliverOrder);
  const startTransition = useGameStore((state) => state.startTransition);
  const isTransitioning = useGameStore((state) => state.isTransitioning);
  const currentOrder = useGameStore((state) => state.currentOrder);
  const preps = useGameStore((state) => state.preps);
  const waitingCount = useGameStore((state) => Math.min(state.queue.length, MAX_WAITING_CUSTOMERS));

  const handleDeliver = () => {
    if (isTransitioning) {
      return;
    }
    deliverOrder();
    startTransition('orderBoard');
  };

  const items = currentOrder?.items ?? [];
  const level = useGameStore((state) => state.level);
  const { tableScale: s, tableColor } = levelConfig(level);
  const planks = Math.round(12 * s);
  const tier = counterTier(level);

  return (
    <group>
      {/* Counter body, front planks and top slab */}
      <mesh position={[0, 0.37, 0]} onPointerDown={handleDeliver}>
        <boxGeometry args={[3.6 * s, 0.74, 1.0 * s]} />
        <meshStandardMaterial color={tableColor} {...mat} />
      </mesh>
      {Array.from({ length: planks }, (_, i) => (
        <mesh key={i} position={[(-1.65 + (i * 3.3) / (planks - 1)) * s, 0.37, 0.505 * s]}>
          <boxGeometry args={[0.02, 0.66, 0.01]} />
          <meshStandardMaterial color={NOGUEIRA} {...mat} />
        </mesh>
      ))}
      <mesh position={[0, 0.76, 0]} onPointerDown={handleDeliver}>
        <boxGeometry args={[3.8 * s, 0.04, 1.1 * s]} />
        <meshStandardMaterial color={TOP} {...mat} />
      </mesh>

      {/* Cumulative shape detail per level (counterTiers.ts) — the counter reads
          as visibly fancier shop-to-shop, not just a recolor. */}
      {tier.trim && (
        <mesh position={[0, 0.72, 0.51 * s]}>
          <boxGeometry args={[3.6 * s, 0.02, 0.01]} />
          <meshStandardMaterial color={AMBAR} {...mat} />
        </mesh>
      )}
      {tier.kickplate && (
        <mesh position={[0, 0.02, 0.505 * s]}>
          <boxGeometry args={[3.6 * s, 0.06, 0.02]} />
          <meshStandardMaterial color={NOGUEIRA} {...mat} />
        </mesh>
      )}
      {tier.cornerAccents &&
        [-1.78 * s, 1.78 * s].map((x) => (
          <mesh key={x} position={[x, 0.76, 0.48 * s]}>
            <boxGeometry args={[0.06, 0.05, 0.06]} />
            <meshStandardMaterial color={AMBAR} metalness={0.5} roughness={0.35} flatShading />
          </mesh>
        ))}
      {tier.twoTonePanel && (
        <mesh position={[0, 0.37, 0.51 * s]}>
          <boxGeometry args={[1.6 * s, 0.5, 0.015]} />
          <meshStandardMaterial color={CREME} {...mat} />
        </mesh>
      )}

      {/* Ambient decor, same progression. Sits on TOP_Y like every other prop
          here (PastryCase/Cloche/TipJar) — anything left at floor height
          behind the counter is hidden from the camera by the counter's own
          solid body, confirmed on-device (the tier-2 plant was invisible
          until this moved it up). */}
      {tier.plant && (
        <mesh position={[1.6 * s, TOP_Y, -0.1]}>
          <ModelParts data={tier.plant.model} scale={tier.plant.scale} />
        </mesh>
      )}
      {tier.light && (
        <mesh position={[0, 1.3, -0.35]}>
          <ModelParts data={tier.light.model} scale={tier.light.scale} />
        </mesh>
      )}
      {tier.wall && (
        <mesh position={[-1.6 * s, 1.0, -0.4]}>
          <ModelParts data={tier.wall.model} scale={tier.wall.scale} />
        </mesh>
      )}

      <PastryCase position={[-1.2 * s, TOP_Y, -0.2]} />
      <Cloche position={[1.1 * s, TOP_Y, -0.15]} />
      <TipJar position={[0.5 * s, TOP_Y, -0.3]} />
      <Barista position={[-0.1 * s, TOP_Y, -0.65]} />

      {items.map((item, i) => (
        <ServedItem
          key={i}
          recipe={item.recipe}
          prep={preps[i]}
          x={(i - (items.length - 1) / 2) * 0.7}
        />
      ))}

      {/* Customers waiting in line, one per queued order (capped). */}
      {Array.from({ length: waitingCount }, (_, i) => (
        <WaitingCustomer
          key={i}
          position={[(i - (waitingCount - 1) / 2) * 0.55 * s, 0, 1.15 * s]}
          shirt={CUSTOMER_SHIRTS[i % CUSTOMER_SHIRTS.length]}
          phase={i * 1.7}
        />
      ))}
    </group>
  );
}
