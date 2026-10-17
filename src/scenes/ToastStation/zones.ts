import { Zone } from '../CoffeeStation/dropZones';

// Same tabletop layout as the coffee station: item starts at the origin,
// griddle to the left (snap target in front of the griddle body), butter to the right.
// The bread stands upright in the toaster slot, half sunk into the body.
export const GRIDDLE_ZONE: Zone = { id: 'griddle', x: -0.6, z: 0, radius: 0.35, y: 0.46, rotX: Math.PI / 2 };
export const BUTTER_ZONE: Zone = { id: 'butter', x: 0.6, z: 0, radius: 0.35 };
