import { describe, it, expect } from 'vitest';
import { FogOfWarSystem, FOG_GRID_SIZE } from '@/game/world/fog/FogOfWarSystem';

describe('FogOfWarSystem', () => {
  it('converts world coordinates to grid coordinates within bounds', () => {
    const fog = new FogOfWarSystem();
    const [centerGx, centerGz] = fog.worldToGrid(0, 0);
    expect(centerGx).toBe(Math.floor(FOG_GRID_SIZE / 2));
    expect(centerGz).toBe(Math.floor(FOG_GRID_SIZE / 2));

    const [minGx, minGz] = fog.worldToGrid(-60, -60);
    expect(minGx).toBe(0);
    expect(minGz).toBe(0);

    const [maxGx, maxGz] = fog.worldToGrid(60, 60);
    expect(maxGx).toBe(FOG_GRID_SIZE - 1);
    expect(maxGz).toBe(FOG_GRID_SIZE - 1);
  });

  it('reveals cells around the player upon exploration', () => {
    const fog = new FogOfWarSystem();
    expect(fog.getExplorationPercentage()).toBe(0);

    fog.update(0, 0);

    expect(fog.getExplorationPercentage()).toBeGreaterThan(0);
    expect(fog.isWorldPositionDiscovered(0, 0)).toBe(true);
    expect(fog.isWorldPositionDiscovered(5, 5)).toBe(true);
    expect(fog.isWorldPositionDiscovered(50, 50)).toBe(false);
  });

  it('discovers landmarks when player explores nearby', () => {
    const fog = new FogOfWarSystem();
    // Ancient Waystone is at [0, 0, 0]
    const newLandmarks = fog.update(0, 0);
    const discovered = fog.getDiscoveredLandmarks();

    expect(discovered.some((l) => l.id === 'ancient-waystone')).toBe(true);
    expect(newLandmarks.some((l) => l.id === 'ancient-waystone')).toBe(true);
  });

  it('serializes and deserializes fog state reliably', () => {
    const fog1 = new FogOfWarSystem();
    fog1.update(10, 10);
    const serialized = fog1.serialize();

    const fog2 = new FogOfWarSystem();
    fog2.deserialize(serialized);

    expect(fog2.isWorldPositionDiscovered(10, 10)).toBe(true);
    expect(fog2.getExplorationPercentage()).toBeCloseTo(fog1.getExplorationPercentage(), 1);
  });
});
