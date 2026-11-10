import { ElementType } from '../creatures/creature.types';

export type CaptureDeviceTier = 'basic' | 'reinforced' | 'advanced';

export interface CaptureDevice {
  id: CaptureDeviceTier;
  name: string;
  tier: CaptureDeviceTier;
  catchRateMultiplier: number;
  color: string;
  glowColor: string;
}

export interface OwnedCreature {
  id: string;
  speciesId: string;
  name: string;
  nickname: string;
  level: number;
  currentHealth: number;
  maxHealth: number;
  element: ElementType;
  experience: number;
  caughtAt: number; // timestamp
}

export type CaptureSequenceState =
  | 'IDLE'
  | 'FLYING'
  | 'SHAKING_1'
  | 'SHAKING_2'
  | 'SHAKING_3'
  | 'SUCCESS'
  | 'BROKE_FREE';

export interface ActiveCaptureProjectile {
  id: string;
  targetCreatureId: string;
  deviceTier: CaptureDeviceTier;
  startPos: [number, number, number];
  targetPos: [number, number, number];
  currentPos: [number, number, number];
  progress: number; // 0 to 1
  state: CaptureSequenceState;
  stateTimer: number;
  successOutcome: boolean;
}
