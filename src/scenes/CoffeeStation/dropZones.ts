export interface Zone {
  id: string;
  x: number;
  z: number;
  radius: number;
}

// Tabletop layout (meters, R3F world space): cup starts at the origin,
// machine to the left, sugar packet to the right. Task 7 places the
// corresponding meshes at these exact centers.
export const MACHINE_ZONE: Zone = { id: 'machine', x: -0.6, z: 0, radius: 0.35 };
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
