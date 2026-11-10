import { create } from 'zustand';
import { get, set } from 'idb-keyval';
import { CaptureDeviceTier, OwnedCreature } from './capture.types';
import { STARTER_SPECIES } from '../content/creatures/speciesRegistry';
import { soundFx } from '../audio/AudioSynthesizer';

const DB_KEY_PARTY = 'creaturebound_party_v1';
const DB_KEY_STORAGE = 'creaturebound_storage_v1';
const DB_KEY_CAPSULES = 'creaturebound_capsules_v1';

export const MAX_PARTY_SIZE = 5;

interface PartyState {
  activeParty: OwnedCreature[];
  storageBox: OwnedCreature[];
  capsuleInventory: Record<CaptureDeviceTier, number>;
  selectedDeviceTier: CaptureDeviceTier;
  isLoaded: boolean;

  // Actions
  addCapturedCreature: (speciesId: string, level: number, nickname?: string) => OwnedCreature;
  moveToParty: (creatureId: string) => boolean;
  moveToStorage: (creatureId: string) => boolean;
  setNickname: (creatureId: string, name: string) => void;
  releaseCreature: (creatureId: string) => void;
  consumeCapsule: (tier: CaptureDeviceTier) => boolean;
  setSelectedDeviceTier: (tier: CaptureDeviceTier) => void;
  loadPersistedData: () => Promise<void>;
  savePersistedData: () => Promise<void>;
}

export const usePartyStore = create<PartyState>((setStore, getStore) => ({
  activeParty: [],
  storageBox: [],
  capsuleInventory: {
    basic: 20,
    reinforced: 6,
    advanced: 2,
  },
  selectedDeviceTier: 'basic',
  isLoaded: false,

  addCapturedCreature: (speciesId: string, level: number, nickname?: string) => {
    const species = STARTER_SPECIES[speciesId];
    const maxHp = species ? species.baseStats.maxHealth + level * 8 : 100;

    const newCreature: OwnedCreature = {
      id: `owned-${speciesId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      speciesId,
      name: species ? species.name : 'Unknown Creature',
      nickname: nickname || (species ? species.name : 'Companion'),
      level,
      currentHealth: maxHp,
      maxHealth: maxHp,
      element: species ? species.element : 'Nature',
      experience: 0,
      caughtAt: Date.now(),
    };

    const currentParty = getStore().activeParty;
    const currentStorage = getStore().storageBox;

    if (currentParty.length < MAX_PARTY_SIZE) {
      setStore({ activeParty: [...currentParty, newCreature] });
    } else {
      setStore({ storageBox: [...currentStorage, newCreature] });
    }

    soundFx.playCaptureSuccess();
    getStore().savePersistedData();
    return newCreature;
  },

  moveToParty: (creatureId: string) => {
    const { activeParty, storageBox } = getStore();
    if (activeParty.length >= MAX_PARTY_SIZE) return false;

    const creature = storageBox.find((c) => c.id === creatureId);
    if (!creature) return false;

    setStore({
      activeParty: [...activeParty, creature],
      storageBox: storageBox.filter((c) => c.id !== creatureId),
    });
    getStore().savePersistedData();
    return true;
  },

  moveToStorage: (creatureId: string) => {
    const { activeParty, storageBox } = getStore();
    const creature = activeParty.find((c) => c.id === creatureId);
    if (!creature) return false;

    setStore({
      activeParty: activeParty.filter((c) => c.id !== creatureId),
      storageBox: [...storageBox, creature],
    });
    getStore().savePersistedData();
    return true;
  },

  setNickname: (creatureId: string, name: string) => {
    const updateFn = (list: OwnedCreature[]) =>
      list.map((c) => (c.id === creatureId ? { ...c, nickname: name } : c));

    setStore((prev) => ({
      activeParty: updateFn(prev.activeParty),
      storageBox: updateFn(prev.storageBox),
    }));
    getStore().savePersistedData();
  },

  releaseCreature: (creatureId: string) => {
    setStore((prev) => ({
      activeParty: prev.activeParty.filter((c) => c.id !== creatureId),
      storageBox: prev.storageBox.filter((c) => c.id !== creatureId),
    }));
    getStore().savePersistedData();
  },

  consumeCapsule: (tier: CaptureDeviceTier) => {
    const current = getStore().capsuleInventory[tier];
    if (current <= 0) return false;

    setStore((prev) => ({
      capsuleInventory: {
        ...prev.capsuleInventory,
        [tier]: current - 1,
      },
    }));
    getStore().savePersistedData();
    return true;
  },

  setSelectedDeviceTier: (tier: CaptureDeviceTier) => {
    setStore({ selectedDeviceTier: tier });
  },

  loadPersistedData: async () => {
    try {
      const savedParty = await get<OwnedCreature[]>(DB_KEY_PARTY);
      const savedStorage = await get<OwnedCreature[]>(DB_KEY_STORAGE);
      const savedCapsules = await get<Record<CaptureDeviceTier, number>>(DB_KEY_CAPSULES);

      setStore({
        activeParty: savedParty || [],
        storageBox: savedStorage || [],
        capsuleInventory: savedCapsules || { basic: 20, reinforced: 6, advanced: 2 },
        isLoaded: true,
      });
    } catch {
      setStore({ isLoaded: true });
    }
  },

  savePersistedData: async () => {
    try {
      const { activeParty, storageBox, capsuleInventory } = getStore();
      await set(DB_KEY_PARTY, activeParty);
      await set(DB_KEY_STORAGE, storageBox);
      await set(DB_KEY_CAPSULES, capsuleInventory);
    } catch {
      // Graceful fallback for non-persistent or storage-disabled browser modes
    }
  },
}));
