import { ElementType } from '../creatures/creature.types';

export type CompanionCommand = 'FOLLOW' | 'STAY' | 'AGGRESSIVE' | 'PASSIVE';

export interface CompanionState {
  ownedId: string;
  speciesId: string;
  name: string;
  nickname: string;
  level: number;
  element: ElementType;
  currentHealth: number;
  maxHealth: number;
  position: [number, number, number];
  velocity: [number, number, number];
  rotationY: number;
  isSummoned: boolean;
  command: CompanionCommand;
  guardPos: [number, number, number] | null;
  isMoving: boolean;
}
