export interface Zone {
  id: string;
  x: number;
  z: number;
  radius: number;
}

// Tabletop layout (meters, R3F world space): cup starts at the origin,
// machine to the left, sugar packet to the right. MACHINE_ZONE is the cup's
// snap target, not the machine body's own position — it sits in front of the
// machine's spout (CoffeeStation.tsx keeps the body/spout meshes at a fixed
// world position so the cup lands in front of the spout, not inside the
// machine's solid geometry).
export const MACHINE_ZONE: Zone = { id: 'machine', x: -0.6, z: 0.45, radius: 0.35 };
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
