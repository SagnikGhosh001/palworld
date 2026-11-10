import { describe, it, expect } from 'vitest';
import { getTerrainHeight, isWater, VERDANT_LANDMARKS, WATER_LEVEL } from '@/game/world/terrain/TerrainData';

describe('TerrainData', () => {
  it('returns gentle starter glade height near spawn [0, 0]', () => {
    const height = getTerrainHeight(0, 0);
    expect(height).toBeGreaterThanOrEqual(0.1);
    expect(height).toBeLessThan(0.5);
  });

  it('detects pond depression at [-18, 24] with negative elevation', () => {
    const height = getTerrainHeight(-18, 24);
    expect(height).toBeLessThan(WATER_LEVEL);
    expect(isWater(-18, 24)).toBe(true);
  });

  it('detects dry land at starter position', () => {
    expect(isWater(0, 0)).toBe(false);
  });

  it('elevates high ridge crag near [28, -22]', () => {
    const ridgeHeight = getTerrainHeight(28, -22);
    const gladeHeight = getTerrainHeight(0, 0);
    expect(ridgeHeight).toBeGreaterThan(gladeHeight + 2.0);
  });

  it('elevates perimeter cliffs beyond 45m to form natural boundary', () => {
    const center = getTerrainHeight(0, 0);
    const border = getTerrainHeight(55, 0);
    expect(border).toBeGreaterThan(center + 3.0);
  });

  it('includes all required starting landmarks', () => {
    expect(VERDANT_LANDMARKS.length).toBeGreaterThanOrEqual(5);
    const ids = VERDANT_LANDMARKS.map((l) => l.id);
    expect(ids).toContain('ancient-waystone');
    expect(ids).toContain('elder-pine-grove');
    expect(ids).toContain('sunken-basin-pond');
    expect(ids).toContain('whispering-ridge');
  });
});
