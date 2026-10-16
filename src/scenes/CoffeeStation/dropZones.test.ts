import { Zone, resolveDropZone } from './dropZones';

const zones: Zone[] = [{ id: 'machine', x: 0, z: 0, radius: 0.3 }];

test('position inside a zone resolves to that zone', () => {
  expect(resolveDropZone({ x: 0.1, z: 0.1 }, zones)?.id).toBe('machine');
});

test('position outside every zone resolves to null', () => {
  expect(resolveDropZone({ x: 5, z: 5 }, zones)).toBeNull();
});
