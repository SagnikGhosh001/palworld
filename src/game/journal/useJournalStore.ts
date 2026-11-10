import { create } from 'zustand';
import { STARTER_SPECIES } from '../content/creatures/speciesRegistry';
import { soundFx } from '../audio/AudioSynthesizer';

interface JournalState {
  seenSpecies: string[];
  ownedSpecies: string[];
  recentlyDiscovered: string | null;
  discoverSpecies: (speciesId: string) => boolean;
  clearNotification: () => void;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  seenSpecies: [],
  ownedSpecies: [],
  recentlyDiscovered: null,

  discoverSpecies: (speciesId: string) => {
    const current = get().seenSpecies;
    if (!current.includes(speciesId) && STARTER_SPECIES[speciesId]) {
      set({
        seenSpecies: [...current, speciesId],
        recentlyDiscovered: STARTER_SPECIES[speciesId].name,
      });
      soundFx.playCaptureSuccess();
      return true;
    }
    return false;
  },

  clearNotification: () => set({ recentlyDiscovered: null }),
}));
