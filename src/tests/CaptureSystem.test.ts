import { describe, it, expect, beforeEach } from 'vitest';
import { captureSystem } from '@/game/capture/CaptureSystem';
import { creatureSpawner } from '@/game/creatures/CreatureSpawner';
import { usePartyStore } from '@/game/capture/usePartyStore';

describe('CaptureSystem', () => {
  beforeEach(() => {
    captureSystem.reset();
    creatureSpawner.clear();
    usePartyStore.setState({
      activeParty: [],
      storageBox: [],
      capsuleInventory: { basic: 10, reinforced: 5, advanced: 2 },
    });
  });

  it('fails throw when target creature does not exist or capsule inventory is 0', () => {
    // Non-existent creature
    const thrown1 = captureSystem.throwCapsule([0, 0, 0], 'invalid-creature-id', 'basic');
    expect(thrown1).toBe(false);

    // Empty inventory
    usePartyStore.setState({ capsuleInventory: { basic: 0, reinforced: 0, advanced: 0 } });
    const c = creatureSpawner.spawn('mosskin', [5, 0, 5], 2);
    const thrown2 = captureSystem.throwCapsule([0, 0, 0], c.instanceId, 'basic');
    expect(thrown2).toBe(false);
  });

  it('launches projectile, consumes capsule, and tracks trajectory', () => {
    const c = creatureSpawner.spawn('cindercub', [10, 0, 10], 3);

    const success = captureSystem.throwCapsule([0, 0, 0], c.instanceId, 'basic');
    expect(success).toBe(true);

    // Consumed capsule
    expect(usePartyStore.getState().capsuleInventory.basic).toBe(9);

    const proj = captureSystem.getActiveProjectile();
    expect(proj).not.toBeNull();
    expect(proj?.targetCreatureId).toBe(c.instanceId);
    expect(proj?.state).toBe('FLYING');

    // Update flight
    captureSystem.update(0.2);
    expect(proj?.progress).toBeGreaterThan(0);
  });

  it('permanently despawns captured wild creature from creatureSpawner upon success', () => {
    const c = creatureSpawner.spawn('pebblit', [5, 0, 5], 1);

    captureSystem.throwCapsule([0, 0, 0], c.instanceId, 'advanced');
    const proj = captureSystem.getActiveProjectile()!;

    // Force outcome to true for deterministic testing
    proj.successOutcome = true;

    // Advance flight to impact
    captureSystem.update(0.6); // reaches progress 1.0 -> SHAKING_1
    expect(proj.state).toBe('SHAKING_1');

    // Advance through wobble stages
    captureSystem.update(0.7); // SHAKING_2
    captureSystem.update(0.7); // SHAKING_3
    captureSystem.update(0.7); // SUCCESS resolution

    expect(proj.state).toBe('SUCCESS');

    // Wild creature must be permanently deleted from creatureSpawner
    expect(creatureSpawner.getById(c.instanceId)).toBeUndefined();

    // Creature must be added to user's party
    const party = usePartyStore.getState().activeParty;
    expect(party.length).toBe(1);
    expect(party[0].speciesId).toBe('pebblit');
  });
});
