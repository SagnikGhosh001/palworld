import { create } from 'zustand';
import { CreatureInstance } from './creature.types';
import { creatureSpawner } from './CreatureSpawner';

interface CreatureStoreState {
  creatures: CreatureInstance[];
  targetedCreatureId: string | null;
  setTargetedCreatureId: (id: string | null) => void;
  syncWithSpawner: () => void;
}

export const useCreatureStore = create<CreatureStoreState>((set) => ({
  creatures: creatureSpawner.getAll(),
  targetedCreatureId: null,

  setTargetedCreatureId: (id) => set({ targetedCreatureId: id }),
  syncWithSpawner: () => set({ creatures: creatureSpawner.getAll() }),
}));
