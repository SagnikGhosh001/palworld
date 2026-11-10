import { CaptureDevice, CaptureDeviceTier } from './capture.types';
import { CreatureInstance } from '../creatures/creature.types';
import { STARTER_SPECIES } from '../content/creatures/speciesRegistry';

export const CAPTURE_DEVICES: Record<CaptureDeviceTier, CaptureDevice> = {
  basic: {
    id: 'basic',
    name: 'Basic Capsule',
    tier: 'basic',
    catchRateMultiplier: 1.0,
    color: '#38bdf8',
    glowColor: '#0284c7',
  },
  reinforced: {
    id: 'reinforced',
    name: 'Reinforced Capsule',
    tier: 'reinforced',
    catchRateMultiplier: 1.6,
    color: '#a855f7',
    glowColor: '#9333ea',
  },
  advanced: {
    id: 'advanced',
    name: 'Advanced Capsule',
    tier: 'advanced',
    catchRateMultiplier: 2.4,
    color: '#f59e0b',
    glowColor: '#d97706',
  },
};

const RARITY_MODIFIERS: Record<string, number> = {
  Common: 1.0,
  Uncommon: 0.75,
  Rare: 0.5,
  Epic: 0.35,
  Legendary: 0.2,
};

export class CaptureFormula {
  /**
   * Calculates the capture probability (0.0 to 1.0) for a given wild creature and capsule tier.
   */
  public static calculateCatchChance(
    creature: CreatureInstance,
    deviceTier: CaptureDeviceTier
  ): number {
    const species = STARTER_SPECIES[creature.speciesId];
    if (!species) return 0.1;

    const device = CAPTURE_DEVICES[deviceTier] || CAPTURE_DEVICES.basic;
    const rarityMod = RARITY_MODIFIERS[species.rarity] || 1.0;

    // Health factor: lower health increases odds
    const healthRatio = Math.max(0.01, creature.currentHealth / creature.maxHealth);
    const healthFactor = 1.0 - healthRatio * 0.55; // 0.45 at full HP, up to ~1.0 when near defeat

    // Level factor: higher levels are slightly harder
    const levelFactor = Math.max(0.65, 1.0 - (creature.level - 1) * 0.05);

    // Base catch rate: 60%
    const rawChance = 0.6 * healthFactor * rarityMod * device.catchRateMultiplier * levelFactor;

    // Clamp between 5% and 98%
    return Math.max(0.05, Math.min(0.98, rawChance));
  }

  /**
   * Evaluates if a capture attempt succeeds.
   */
  public static rollCaptureAttempt(
    creature: CreatureInstance,
    deviceTier: CaptureDeviceTier,
    rng = Math.random
  ): boolean {
    const chance = this.calculateCatchChance(creature, deviceTier);
    return rng() < chance;
  }
}
