import { Zone } from '../CoffeeStation/dropZones';

// Same tabletop layout as the coffee station: item starts at the origin,
// griddle to the left (snap target in front of the griddle body), butter to the right.
export const GRIDDLE_ZONE: Zone = { id: 'griddle', x: -0.6, z: 0.45, radius: 0.35 };
export const BUTTER_ZONE: Zone = { id: 'butter', x: 0.6, z: 0, radius: 0.35 };
