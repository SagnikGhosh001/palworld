import { describe, it, expect } from 'vitest';
import { CreatureAI } from '@/game/creatures/ai/CreatureAI';
import { CreatureInstance } from '@/game/creatures/creature.types';

function createMockCreature(speciesId: string, pos: [number, number, number]): CreatureInstance {
  return {
    instanceId: `test-${speciesId}`,
    speciesId,
    level: 2,
    currentHealth: 100,
    maxHealth: 100,
    position: [...pos],
    velocity: [0, 0, 0],
    rotationY: 0,
    aiState: 'IDLE',
    targetPos: null,
    homeSpawnPos: [...pos],
    stateTimer: 2.0,
  };
}

describe('CreatureAI', () => {
  it('makes a PASSIVE creature flee when approached by player', () => {
    // Ripplefin is PASSIVE
    const creature = createMockCreature('ripplefin', [10, 0, 10]);
    const playerNearby: [number, number, number] = [12, 0, 10]; // 2m away

    const updated = CreatureAI.update(creature, playerNearby, 0.1);

    expect(updated.aiState).toBe('FLEE');
    // Flee velocity should move away from player (negative X)
    expect(updated.velocity[0]).toBeLessThan(0);
  });

  it('makes a CURIOUS creature investigate when player is in medium range', () => {
    // Cindercub is CURIOUS
    const creature = createMockCreature('cindercub', [20, 0, 20]);
    const playerNear: [number, number, number] = [25, 0, 20]; // 5m away

    const updated = CreatureAI.update(creature, playerNear, 0.1);

    expect(updated.aiState).toBe('INVESTIGATE');
    // Investigate velocity should move toward player (positive X)
    expect(updated.velocity[0]).toBeGreaterThan(0);
  });

  it('triggers RETURN state when creature wanders beyond territory limit', () => {
    const creature = createMockCreature('mosskin', [30, 0, 0]);
    creature.homeSpawnPos = [0, 0, 0]; // 30m away from home!

    const distantPlayer: [number, number, number] = [-40, 0, 0];
    const updated = CreatureAI.update(creature, distantPlayer, 0.1);

    expect(updated.aiState).toBe('RETURN');
    // Return velocity moves toward home (negative X)
    expect(updated.velocity[0]).toBeLessThan(0);
  });

  it('transitions from IDLE to WANDER when state timer elapses', () => {
    const creature = createMockCreature('mosskin', [0, 0, 0]);
    creature.stateTimer = 0.05; // about to expire

    const distantPlayer: [number, number, number] = [40, 0, 40];
    const updated = CreatureAI.update(creature, distantPlayer, 0.1);

    expect(updated.aiState).toBe('WANDER');
    expect(updated.targetPos).not.toBeNull();
  });
});
