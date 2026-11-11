import { describe, it, expect, beforeEach } from 'vitest';
import { companionSystem } from '@/game/companion/CompanionSystem';
import { usePartyStore } from '@/game/capture/usePartyStore';
import { useCompanionStore } from '@/game/companion/useCompanionStore';
import { getTerrainHeight } from '@/game/world/terrain/TerrainData';

describe('CompanionSystem', () => {
  beforeEach(() => {
    companionSystem.reset();
    usePartyStore.setState({
      activeParty: [],
      storageBox: [],
    });
  });

  it('fails gracefully when attempting to summon with empty party', () => {
    const success = companionSystem.summonLeadCompanion([0, 0, 0], 0);
    expect(success).toBe(false);
    expect(companionSystem.getCompanion()).toBeNull();
    expect(useCompanionStore.getState().isSummoned).toBe(false);
    expect(companionSystem.getMessage()).toContain('No companion in party');
  });

  it('summons lead party member and syncs with useCompanionStore', () => {
    const store = usePartyStore.getState();
    const creature = store.addCapturedCreature('cindercub', 4, 'Sparky');

    const success = companionSystem.summonLeadCompanion([10, 0, 10], 0);
    expect(success).toBe(true);

    const comp = companionSystem.getCompanion();
    expect(comp).not.toBeNull();
    expect(comp?.ownedId).toBe(creature.id);
    expect(comp?.nickname).toBe('Sparky');
    expect(comp?.speciesId).toBe('cindercub');
    expect(comp?.isSummoned).toBe(true);
    expect(comp?.command).toBe('FOLLOW');

    // Store sync
    const storeState = useCompanionStore.getState();
    expect(storeState.isSummoned).toBe(true);
    expect(storeState.companionData?.nickname).toBe('Sparky');
    expect(storeState.activeCommand).toBe('FOLLOW');
  });

  it('recalls active companion and clears store summon flag', () => {
    usePartyStore.getState().addCapturedCreature('mosskin', 3);
    companionSystem.summonLeadCompanion([0, 0, 0], 0);
    expect(companionSystem.getCompanion()?.isSummoned).toBe(true);

    const recalled = companionSystem.recallCompanion();
    expect(recalled).toBe(true);
    expect(companionSystem.getCompanion()?.isSummoned).toBe(false);
    expect(useCompanionStore.getState().isSummoned).toBe(false);
    expect(useCompanionStore.getState().companionData).toBeNull();
  });

  it('toggles summon state back and forth', () => {
    usePartyStore.getState().addCapturedCreature('pebblit', 2);

    // 1st toggle: summon
    expect(companionSystem.toggleSummon([0, 0, 0], 0)).toBe(true);
    expect(companionSystem.getCompanion()?.isSummoned).toBe(true);

    // 2nd toggle: recall
    expect(companionSystem.toggleSummon([0, 0, 0], 0)).toBe(true);
    expect(companionSystem.getCompanion()?.isSummoned).toBe(false);
  });

  it('sets command and manages STAY guard position', () => {
    usePartyStore.getState().addCapturedCreature('mosskin', 5);
    companionSystem.summonLeadCompanion([0, 0, 0], 0);

    // Set STAY
    companionSystem.setCommand('STAY');
    expect(companionSystem.getCompanion()?.command).toBe('STAY');
    expect(companionSystem.getCompanion()?.guardPos).not.toBeNull();
    expect(useCompanionStore.getState().activeCommand).toBe('STAY');

    // Switch back to FOLLOW
    companionSystem.setCommand('FOLLOW');
    expect(companionSystem.getCompanion()?.command).toBe('FOLLOW');
    expect(companionSystem.getCompanion()?.guardPos).toBeNull();
    expect(useCompanionStore.getState().activeCommand).toBe('FOLLOW');
  });

  it('moves companion toward player when distance > 2.4m stop radius', () => {
    usePartyStore.getState().addCapturedCreature('voltkit', 3);
    companionSystem.summonLeadCompanion([0, 0, 0], 0);

    const comp = companionSystem.getCompanion()!;
    // Place player 10m away
    const playerPos: [number, number, number] = [comp.position[0] + 10, 0, comp.position[2]];
    const startX = comp.position[0];

    // Step simulation 0.2s
    companionSystem.update(playerPos, 5.0, 0.2);

    expect(comp.isMoving).toBe(true);
    expect(comp.position[0]).toBeGreaterThan(startX);
  });

  it('decelerates and stays within stop radius when player is close', () => {
    usePartyStore.getState().addCapturedCreature('mosskin', 3);
    companionSystem.summonLeadCompanion([0, 0, 0], 0);

    const comp = companionSystem.getCompanion()!;
    // Place player 1.5m away (within stop radius 2.4m)
    const playerPos: [number, number, number] = [comp.position[0] + 1.5, 0, comp.position[2]];

    companionSystem.update(playerPos, 0, 0.1);

    expect(comp.isMoving).toBe(false);
  });

  it('teleports companion via stuck recovery when player is further than 26m', () => {
    usePartyStore.getState().addCapturedCreature('mosskin', 3);
    companionSystem.summonLeadCompanion([0, 0, 0], 0);

    const comp = companionSystem.getCompanion()!;
    // Teleport player 100m away
    const playerPos: [number, number, number] = [100, 0, 100];

    companionSystem.update(playerPos, 5.0, 0.1);

    const distAfter = Math.sqrt(
      (comp.position[0] - playerPos[0]) ** 2 + (comp.position[2] - playerPos[2]) ** 2
    );

    // Companion should be within ~3.5m of the player now
    expect(distAfter).toBeLessThan(5.0);
    expect(comp.position[1]).toBe(getTerrainHeight(comp.position[0], comp.position[2]));
  });

  it('holds guard position under STAY command even if player travels away', () => {
    usePartyStore.getState().addCapturedCreature('mosskin', 3);
    companionSystem.summonLeadCompanion([0, 0, 0], 0);
    companionSystem.setCommand('STAY');

    const comp = companionSystem.getCompanion()!;
    const guardX = comp.position[0];
    const guardZ = comp.position[2];

    // Player moves 15m away
    const distantPlayer: [number, number, number] = [guardX + 15, 0, guardZ + 15];
    companionSystem.update(distantPlayer, 5.0, 0.2);

    // Companion remains at guard position
    expect(Math.abs(comp.position[0] - guardX)).toBeLessThan(0.6);
    expect(Math.abs(comp.position[2] - guardZ)).toBeLessThan(0.6);
  });
});
