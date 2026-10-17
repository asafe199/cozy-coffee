export interface Zone {
  id: string;
  x: number;
  z: number;
  radius: number;
  // Height and upright tilt (rad, about x) the dropped item settles at; defaults to resting flat.
  y?: number;
  rotX?: number;
}

// Tabletop layout (meters, R3F world space): cup starts at the origin,
// machine to the left, sugar packet to the right. MACHINE_ZONE is the cup's
// snap target, not the machine body's own position — it sits in front of the
// machine's spout (CoffeeStation.tsx keeps the body/spout meshes at a fixed
// world position so the cup lands in front of the spout, not inside the
// machine's solid geometry).
// The cup settles in front of the machine's spout (machine body is at
// x=-0.6; see CoffeeStation.tsx). z was previously 0.14, which the Kenney
// model's normalized footprint (centered on x/z, largest dimension 1, here
// at scale 0.75) can still cover depending on the model's real proportions
// — reported in testing as the cup visually vanishing into the machine
// body. Pushed further forward so the cup clears the model's silhouette
// with margin rather than trusting an unverified exact depth.
export const MACHINE_ZONE: Zone = { id: 'machine', x: -0.61, z: 0.4, radius: 0.3, y: 0.17 };
export const SUGAR_ZONE: Zone = { id: 'sugar', x: 0.6, z: 0, radius: 0.35 };

export function resolveDropZone(
  position: { x: number; z: number },
  zones: Zone[]
): Zone | null {
  for (const zone of zones) {
    const dx = position.x - zone.x;
    const dz = position.z - zone.z;
    if (Math.sqrt(dx * dx + dz * dz) <= zone.radius) {
      return zone;
    }
  }
  return null;
}
