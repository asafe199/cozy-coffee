import { Steam } from '../shared/props/Steam';
import { levelConfig } from '../../game/levels';
import React, { useRef, useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { stationForItem } from '../../game/orders';
import { CupDraggable } from './CupDraggable';
import { CoffeeDecor } from '../shared/props/CoffeeDecor';
import { ModelParts } from '../shared/props/ModelParts';
import { CoffeeLiquid, PourStream } from '../shared/props/CoffeeLiquid';
import { ReadyMarker } from '../shared/props/ReadyMarker';
import { COFFEE_MACHINE, CUP_EMPTY } from '../shared/props/models.generated';
import { MACHINE_ZONE, READY_ZONE, SUGAR_ZONE } from './dropZones';

// Direction A "Madeira & Âmbar" palette.
const CREME = '#F6E3C7';

const materialProps = { flatShading: true, roughness: 0.8, metalness: 0.05 } as const;

/**
 * Coffee station scene: the machine (tap once the cup is on MACHINE_ZONE to
 * pour), the sugar packet, the draggable cup, and a READY_ZONE marker on the
 * counter — drag the cup there (poured or not; an unpoured prep is a valid
 * null input downstream, never a dead end) to send it on. completeItem()
 * routes to the next item's station for multi-item orders, or the delivery
 * counter once the order is complete. Local component state
 * (poured/cupZone/hasTouchedSugar/entry time) is intentionally not lifted to
 * the store: this component unmounts/remounts fresh every time the player enters/leaves the
 * station (GameScene renders only one scene at a time), which is exactly the
 * reset behavior we want between visits.
 */
export function CoffeeStation() {
  const completeItem = useGameStore((state) => state.completeItem);
  const startTransition = useGameStore((state) => state.startTransition);
  const isTransitioning = useGameStore((state) => state.isTransitioning);
  const level = useGameStore((state) => state.level);
  const { tableScale, tableColor } = levelConfig(level);
  // Done only counts at the station the current item belongs to (the player can pan anywhere).
  const isActive = useGameStore(
    (state) =>
      !!state.currentOrder &&
      stationForItem(state.currentOrder.items[state.itemIndex] ?? state.currentOrder.items[0]) === 'coffeeStation'
  );

  const entryTimeRef = useRef<number>(Date.now());
  const [cupZone, setCupZone] = useState<string | null>(null);
  const [hasTouchedSugar, setHasTouchedSugar] = useState(false);
  const [poured, setPoured] = useState(false);

  // Always completes, poured or not: a player who never figures out the pour
  // isn't trapped (there's nothing to figure out to reach READY_ZONE), and an
  // unpoured prep is a valid, non-crashing input — calculateReview's
  // null-prep branch handles it.
  const handleDroppedOn = (zoneId: string | null) => {
    setCupZone(zoneId);
    if (zoneId === SUGAR_ZONE.id) {
      setHasTouchedSugar(true);
    }
    if (zoneId === READY_ZONE.id) {
      if (isTransitioning || !isActive) {
        return;
      }
      const next = completeItem(
        poured
          ? { recipe: 'coffee', sugarAdded: hasTouchedSugar, prepTimeMs: Date.now() - entryTimeRef.current }
          : null
      );
      startTransition(next);
    }
  };

  const canPour = !poured && cupZone === MACHINE_ZONE.id;

  const handlePour = () => {
    if (isTransitioning || !canPour) {
      return;
    }
    setPoured(true);
  };

  return (
    <group>
      {/* Counter surface */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[2.6 * tableScale, 0.1, 2.0 * tableScale]} />
        <meshStandardMaterial color={tableColor} {...materialProps} />
      </mesh>

      {/* Coffee machine model (Kenney, CC0); tap it to pour once the cup is on
          MACHINE_ZONE. Its position is independent of the zone's z — the zone
          is the cup's snap target in front of the spout (see dropZones.ts). */}
      <mesh position={[MACHINE_ZONE.x, 0, 0]} onPointerDown={handlePour}>
        <ModelParts data={COFFEE_MACHINE} scale={0.75} />
      </mesh>

      <PourStream active={poured} position={[MACHINE_ZONE.x, 0.4, MACHINE_ZONE.z]} length={0.26} />

      {/* Sugar packet, offset beside SUGAR_ZONE's center so the snapped cup
          (which sits exactly at that center) doesn't visually swallow it. */}
      <mesh position={[SUGAR_ZONE.x, 0.03, SUGAR_ZONE.z + 0.25]}>
        <boxGeometry args={[0.14, 0.06, 0.1]} />
        <meshStandardMaterial color={CREME} {...materialProps} />
      </mesh>

      <CoffeeDecor />

      <CupDraggable onDroppedOn={handleDroppedOn} zones={[MACHINE_ZONE, SUGAR_ZONE, READY_ZONE]}>
        <ModelParts data={CUP_EMPTY} scale={0.22} offsetY={-0.06} />
        <CoffeeLiquid filled={poured} />
        <Steam active={poured} position={[0, 0.06, 0]} />
      </CupDraggable>

      <ReadyMarker position={[READY_ZONE.x, 0.06, READY_ZONE.z]} />
    </group>
  );
}
