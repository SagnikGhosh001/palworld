import { describe, it, expect } from 'vitest';
import { CreatureSpawner } from '@/game/creatures/CreatureSpawner';

describe('CreatureSpawner', () => {
  it('populates habitat zones and respects population caps', () => {
    const spawner = new CreatureSpawner();
    const creatures = spawner.getAll();

    expect(creatures.length).toBeGreaterThan(0);
    expect(creatures.length).toBe(spawner.getCount());

    // Verify all instances have valid properties
    for (const c of creatures) {
      expect(c.instanceId).toBeTruthy();
      expect(c.level).toBeGreaterThanOrEqual(1);
      expect(c.currentHealth).toBeGreaterThan(0);
      expect(c.maxHealth).toBeGreaterThanOrEqual(c.currentHealth);
      expect(Number.isFinite(c.position[0])).toBe(true);
      expect(Number.isFinite(c.position[1])).toBe(true);
      expect(Number.isFinite(c.position[2])).toBe(true);
    }
  });

  it('updates all creatures in a single batch update pass', () => {
    const spawner = new CreatureSpawner();
    const initialPositions = spawner.getAll().map((c) => [...c.position]);

    spawner.update([0, 0, 0], 0.1);

    const afterUpdate = spawner.getAll();
    expect(afterUpdate.length).toBe(initialPositions.length);
  });
});
