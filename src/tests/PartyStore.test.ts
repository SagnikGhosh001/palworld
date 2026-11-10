import { describe, it, expect, beforeEach } from 'vitest';
import { usePartyStore, MAX_PARTY_SIZE } from '@/game/capture/usePartyStore';

describe('usePartyStore', () => {
  beforeEach(() => {
    usePartyStore.setState({
      activeParty: [],
      storageBox: [],
      capsuleInventory: { basic: 10, reinforced: 5, advanced: 2 },
      selectedDeviceTier: 'basic',
    });
  });

  it('adds captured creature directly to party when under MAX_PARTY_SIZE', () => {
    const store = usePartyStore.getState();
    const creature = store.addCapturedCreature('mosskin', 2, 'Mossy');

    const updated = usePartyStore.getState();
    expect(updated.activeParty.length).toBe(1);
    expect(updated.activeParty[0].id).toBe(creature.id);
    expect(updated.activeParty[0].nickname).toBe('Mossy');
    expect(updated.storageBox.length).toBe(0);
  });

  it('overflows 6th captured creature into storage box when party is full', () => {
    const store = usePartyStore.getState();

    // Fill party to 5
    for (let i = 0; i < MAX_PARTY_SIZE; i++) {
      store.addCapturedCreature('mosskin', 1);
    }
    expect(usePartyStore.getState().activeParty.length).toBe(5);
    expect(usePartyStore.getState().storageBox.length).toBe(0);

    // 6th capture
    const sixth = store.addCapturedCreature('cindercub', 3);
    const updated = usePartyStore.getState();

    expect(updated.activeParty.length).toBe(5);
    expect(updated.storageBox.length).toBe(1);
    expect(updated.storageBox[0].id).toBe(sixth.id);
  });

  it('moves creatures between party and storage', () => {
    const store = usePartyStore.getState();
    const c1 = store.addCapturedCreature('mosskin', 1);

    // Move to storage
    const movedToStorage = store.moveToStorage(c1.id);
    expect(movedToStorage).toBe(true);
    expect(usePartyStore.getState().activeParty.length).toBe(0);
    expect(usePartyStore.getState().storageBox.length).toBe(1);

    // Move back to party
    const movedToParty = store.moveToParty(c1.id);
    expect(movedToParty).toBe(true);
    expect(usePartyStore.getState().activeParty.length).toBe(1);
    expect(usePartyStore.getState().storageBox.length).toBe(0);
  });

  it('updates nickname for an owned creature', () => {
    const store = usePartyStore.getState();
    const c1 = store.addCapturedCreature('voltkit', 2);

    store.setNickname(c1.id, 'Sparky');
    expect(usePartyStore.getState().activeParty[0].nickname).toBe('Sparky');
  });

  it('consumes capsule inventory correctly and rejects when empty', () => {
    const store = usePartyStore.getState();

    expect(store.consumeCapsule('advanced')).toBe(true);
    expect(usePartyStore.getState().capsuleInventory.advanced).toBe(1);

    expect(store.consumeCapsule('advanced')).toBe(true);
    expect(usePartyStore.getState().capsuleInventory.advanced).toBe(0);

    // 3rd attempt should fail
    expect(store.consumeCapsule('advanced')).toBe(false);
  });
});
