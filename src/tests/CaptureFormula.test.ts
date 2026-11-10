import { describe, it, expect } from 'vitest';
import { CaptureFormula } from '@/game/capture/CaptureFormula';
import { CreatureInstance } from '@/game/creatures/creature.types';

function createMockCreature(speciesId: string, currentHp: number, maxHp: number, level = 1): CreatureInstance {
  return {
    instanceId: `test-${speciesId}`,
    speciesId,
    level,
    currentHealth: currentHp,
    maxHealth: maxHp,
    position: [0, 0, 0],
    velocity: [0, 0, 0],
    rotationY: 0,
    aiState: 'IDLE',
    targetPos: null,
    homeSpawnPos: [0, 0, 0],
    stateTimer: 2.0,
  };
}

describe('CaptureFormula', () => {
  it('increases catch chance when creature health is weakened', () => {
    const fullHpMosskin = createMockCreature('mosskin', 85, 85);
    const weakenedMosskin = createMockCreature('mosskin', 15, 85);

    const fullChance = CaptureFormula.calculateCatchChance(fullHpMosskin, 'basic');
    const weakenedChance = CaptureFormula.calculateCatchChance(weakenedMosskin, 'basic');

    expect(weakenedChance).toBeGreaterThan(fullChance);
  });

  it('scales catch chance with higher capsule tiers', () => {
    const creature = createMockCreature('cindercub', 90, 90);

    const basicChance = CaptureFormula.calculateCatchChance(creature, 'basic');
    const reinforcedChance = CaptureFormula.calculateCatchChance(creature, 'reinforced');
    const advancedChance = CaptureFormula.calculateCatchChance(creature, 'advanced');

    expect(reinforcedChance).toBeGreaterThan(basicChance);
    expect(advancedChance).toBeGreaterThan(reinforcedChance);
  });

  it('factors in species rarity modifier', () => {
    const common = createMockCreature('mosskin', 85, 85); // Common
    const rare = createMockCreature('voltkit', 80, 80); // Rare

    const commonChance = CaptureFormula.calculateCatchChance(common, 'basic');
    const rareChance = CaptureFormula.calculateCatchChance(rare, 'basic');

    expect(commonChance).toBeGreaterThan(rareChance);
  });

  it('clamps capture probability within safe minimum and maximum bounds [0.05, 0.98]', () => {
    const highLevelLegendary = createMockCreature('glimmerowl', 100, 100, 50);
    const minChance = CaptureFormula.calculateCatchChance(highLevelLegendary, 'basic');
    expect(minChance).toBeGreaterThanOrEqual(0.05);

    const nearlyDefeatedCommon = createMockCreature('mosskin', 1, 100, 1);
    const maxChance = CaptureFormula.calculateCatchChance(nearlyDefeatedCommon, 'advanced');
    expect(maxChance).toBeLessThanOrEqual(0.98);
  });

  it('resolves deterministic capture roll with rng parameter', () => {
    const creature = createMockCreature('mosskin', 50, 85);
    const chance = CaptureFormula.calculateCatchChance(creature, 'basic');

    // RNG roll below chance succeeds
    const success = CaptureFormula.rollCaptureAttempt(creature, 'basic', () => chance - 0.01);
    expect(success).toBe(true);

    // RNG roll above chance fails
    const fail = CaptureFormula.rollCaptureAttempt(creature, 'basic', () => chance + 0.01);
    expect(fail).toBe(false);
  });
});
