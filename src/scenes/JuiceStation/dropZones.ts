import type { Zone } from '../CoffeeStation/dropZones';

// Blender sits back-left (same side as the other stations' appliance), so it
// stops standing in front of the ingredient baskets that fill the back of the
// counter. Fruits and the glass both snap just in front of its mouth.
// READY_ZONE is shared (imported directly from CoffeeStation/dropZones).
export const APPLIANCE_ZONE: Zone = { id: 'appliance', x: -0.9, z: 0.12, radius: 0.4 };
// Ice bucket, same side-of-table pattern as the other stations' extra zone.
export const EXTRA_ZONE: Zone = { id: 'extra', x: 1.05, z: 0.3, radius: 0.3 };
