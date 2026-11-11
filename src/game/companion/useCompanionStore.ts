import { create } from 'zustand';
import { CompanionCommand } from './companion.types';
import { ElementType } from '../creatures/creature.types';

export interface CompanionData {
  ownedId: string;
  speciesId: string;
  name: string;
  nickname: string;
  level: number;
  element: ElementType;
  currentHealth: number;
  maxHealth: number;
}

interface CompanionStoreState {
  isSummoned: boolean;
  activeCommand: CompanionCommand;
  companionData: CompanionData | null;

  setSummoned: (isSummoned: boolean, data?: CompanionData | null) => void;
  setCommand: (command: CompanionCommand) => void;
  updateHealth: (current: number, max: number) => void;
}

export const useCompanionStore = create<CompanionStoreState>((set) => ({
  isSummoned: false,
  activeCommand: 'FOLLOW',
  companionData: null,

  setSummoned: (isSummoned, data = null) =>
    set({
      isSummoned,
      companionData: isSummoned ? data : null,
    }),

  setCommand: (command) =>
    set({
      activeCommand: command,
    }),

  updateHealth: (current, max) =>
    set((state) => ({
      companionData: state.companionData
        ? { ...state.companionData, currentHealth: current, maxHealth: max }
        : null,
    })),
}));
