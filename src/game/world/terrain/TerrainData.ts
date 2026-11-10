export interface Landmark {
  id: string;
  name: string;
  position: [number, number, number];
  icon: string;
  type: 'ruin' | 'nature' | 'water' | 'crag';
}

export const WORLD_RADIUS = 55.0; // Playable boundary radius in meters
export const WATER_LEVEL = 0.0;

export const VERDANT_LANDMARKS: Landmark[] = [
  { id: 'ancient-waystone', name: 'Ancient Waystone', position: [0, 0.4, 0], icon: '🏛️', type: 'ruin' },
  { id: 'elder-pine-grove', name: 'Elder Pine Grove', position: [-25, 1.2, -18], icon: '🌲', type: 'nature' },
  { id: 'sunken-basin-pond', name: 'Tranquil Pond', position: [-18, 0.0, 24], icon: '💧', type: 'water' },
  { id: 'whispering-ridge', name: 'Whispering Ridge', position: [28, 4.2, -22], icon: '⛰️', type: 'crag' },
  { id: 'sunflower-knoll', name: 'Sunlit Knoll', position: [26, 2.8, 22], icon: '🌿', type: 'nature' },
];

/**
 * Continuous procedural heightfield function for Verdant Reach.
 * Evaluated in O(1) deterministically for rendering and kinematic collision.
 */
export function getTerrainHeight(x: number, z: number): number {
  const distFromCenter = Math.sqrt(x * x + z * z);

  // 1. Central starting glade (flatter around the ancient waystone)
  if (distFromCenter < 8) {
    return 0.15 + (Math.cos(distFromCenter * 0.4) * 0.08);
  }

  // 2. Tranquil Pond depression around [-18, 24]
  const pondDx = x - (-18);
  const pondDz = z - 24;
  const pondDist = Math.sqrt(pondDx * pondDx + pondDz * pondDz);
  if (pondDist < 12) {
    const pondDepth = Math.cos((pondDist / 12) * (Math.PI / 2)) * 1.8;
    return -pondDepth;
  }

  // 3. Gentle rolling meadow harmonics
  let elevation =
    Math.sin(x * 0.08) * 0.9 +
    Math.cos(z * 0.07) * 0.8 +
    Math.sin((x + z) * 0.04) * 1.2;

  // 4. Whispering Ridge crag elevated region (North-East: positive x, negative z)
  const ridgeDx = x - 28;
  const ridgeDz = z - (-22);
  const ridgeDist = Math.sqrt(ridgeDx * ridgeDx + ridgeDz * ridgeDz);
  if (ridgeDist < 18) {
    const cragHeight = Math.max(0, 1 - ridgeDist / 18) * 3.8;
    elevation += cragHeight;
  }

  // 5. Sunlit Knoll hill (South-East: positive x, positive z)
  const knollDx = x - 26;
  const knollDz = z - 22;
  const knollDist = Math.sqrt(knollDx * knollDx + knollDz * knollDz);
  if (knollDist < 16) {
    elevation += Math.max(0, 1 - knollDist / 16) * 2.5;
  }

  // 6. Perimeter boundary cliff rise (keeps player within natural bowl)
  if (distFromCenter > 45) {
    const edgeRatio = (distFromCenter - 45) / 15;
    elevation += edgeRatio * edgeRatio * 8.0;
  }

  return elevation;
}

export function isWater(x: number, z: number): boolean {
  return getTerrainHeight(x, z) < WATER_LEVEL;
}
