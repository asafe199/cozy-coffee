import type { Zone } from '../CoffeeStation/dropZones';

// Blender sits center-back; both fruit baskets and the glass snap to the same
// spot just in front of its mouth. READY_ZONE is shared (imported directly
// from CoffeeStation/dropZones, same as every other station).
export const APPLIANCE_ZONE: Zone = { id: 'appliance', x: 0, z: 0.2, radius: 0.4 };
// Ice bucket, same side-of-table pattern as the other stations' extra zone.
export const EXTRA_ZONE: Zone = { id: 'extra', x: 1.05, z: 0.3, radius: 0.3 };
