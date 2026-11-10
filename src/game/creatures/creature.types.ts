export type ElementType = 'Nature' | 'Fire' | 'Water' | 'Earth' | 'Electric' | 'Frost';

export type CreatureRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export type CreatureTemperament = 'FRIENDLY' | 'CURIOUS' | 'PASSIVE' | 'DEFENSIVE' | 'TERRITORIAL';

export type CreatureAIState = 'IDLE' | 'WANDER' | 'INVESTIGATE' | 'FLEE' | 'RETURN';

export interface CreatureBaseStats {
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface CreatureSignatureAbility {
  id: string;
  name: string;
  description: string;
  element: ElementType;
  damage: number;
  cooldown: number;
}

export interface CreatureDefinition {
  id: string;
  speciesId: string;
  name: string;
  element: ElementType;
  rarity: CreatureRarity;
  temperament: CreatureTemperament;
  description: string;
  habitat: string;
  baseStats: CreatureBaseStats;
  workSkills: {
    planting?: number;
    watering?: number;
    mining?: number;
    smelting?: number;
    generating?: number;
  };
  signatureAbility: CreatureSignatureAbility;
}

export interface CreatureInstance {
  instanceId: string;
  speciesId: string;
  level: number;
  currentHealth: number;
  maxHealth: number;
  position: [number, number, number];
  velocity: [number, number, number];
  rotationY: number;
  aiState: CreatureAIState;
  targetPos: [number, number, number] | null;
  homeSpawnPos: [number, number, number];
  stateTimer: number; // seconds remaining in current sub-state
}

export interface SpawnZoneDefinition {
  id: string;
  name: string;
  center: [number, number];
  radius: number;
  speciesIds: string[];
  maxCount: number;
}
