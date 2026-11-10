import { describe, it, expect } from 'vitest';
import { STARTER_SPECIES, VERDANT_SPAWN_ZONES } from '@/game/content/creatures/speciesRegistry';

describe('SpeciesRegistry', () => {
  it('registers all 6 required original starter species', () => {
    const keys = Object.keys(STARTER_SPECIES);
    expect(keys).toContain('mosskin');
    expect(keys).toContain('cindercub');
    expect(keys).toContain('pebblit');
    expect(keys).toContain('ripplefin');
    expect(keys).toContain('voltkit');
    expect(keys).toContain('glimmerowl');
    expect(keys.length).toBe(6);
  });

  it('ensures each species has unique signature abilities and valid base stats', () => {
    const abilities = new Set<string>();

    for (const species of Object.values(STARTER_SPECIES)) {
      expect(species.name).toBeTruthy();
      expect(species.baseStats.maxHealth).toBeGreaterThan(50);
      expect(species.baseStats.attack).toBeGreaterThan(5);
      expect(species.baseStats.defense).toBeGreaterThan(5);
      expect(species.baseStats.speed).toBeGreaterThan(2);

      expect(species.signatureAbility.name).toBeTruthy();
      expect(species.signatureAbility.damage).toBeGreaterThan(15);
      expect(species.signatureAbility.cooldown).toBeGreaterThan(2);
      expect(abilities.has(species.signatureAbility.id)).toBe(false);
      abilities.add(species.signatureAbility.id);
    }
  });

  it('configures distinct spawn zones with population caps', () => {
    expect(VERDANT_SPAWN_ZONES.length).toBeGreaterThanOrEqual(5);

    let totalCap = 0;
    for (const zone of VERDANT_SPAWN_ZONES) {
      expect(zone.maxCount).toBeGreaterThan(0);
      expect(zone.speciesIds.length).toBeGreaterThan(0);
      totalCap += zone.maxCount;
    }

    // Total wild population bounded to prevent entity explosion
    expect(totalCap).toBeLessThanOrEqual(25);
    expect(totalCap).toBeGreaterThanOrEqual(10);
  });
});
