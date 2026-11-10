import { describe, it, expect } from 'vitest';
import { PlayerKinematics, DEFAULT_PLAYER_STATS } from '@/game/player/PlayerKinematics';
import { PlayerInput, PlayerState } from '@/game/player/player.types';
import { getTerrainHeight } from '@/game/world/terrain/TerrainData';

function createInitialState(): PlayerState {
  return {
    position: [0, 0, 0],
    velocity: [0, 0, 0],
    rotationY: 0,
    isGrounded: true,
    movementState: 'IDLE',
    stats: { ...DEFAULT_PLAYER_STATS },
  };
}

const emptyInput: PlayerInput = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
  sprint: false,
};

describe('PlayerKinematics', () => {
  it('keeps player IDLE when no inputs are active', () => {
    const initial = createInitialState();
    const next = PlayerKinematics.update(initial, emptyInput, 0, 0.016);

    expect(next.movementState).toBe('IDLE');
    expect(next.velocity[0]).toBe(0);
    expect(next.velocity[2]).toBe(0);
    expect(next.isGrounded).toBe(true);
  });

  it('moves player forward along camera yaw', () => {
    const initial = createInitialState();
    const forwardInput: PlayerInput = { ...emptyInput, forward: true };

    // With cameraYaw = 0, forward input moves towards negative Z
    let state = initial;
    for (let i = 0; i < 30; i++) {
      state = PlayerKinematics.update(state, forwardInput, 0, 0.016);
    }

    expect(state.movementState).toBe('WALKING');
    expect(state.velocity[2]).toBeLessThan(-1.0);
    expect(state.position[2]).toBeLessThan(0);
    // Player must face forward towards -Z (0 rad), NOT backwards towards camera
    expect(Math.abs(state.rotationY)).toBeLessThan(0.1);
  });

  it('faces correctly in all 4 cardinal movement directions', () => {
    const forward = PlayerKinematics.update(createInitialState(), { ...emptyInput, forward: true }, 0, 1.0);
    expect(forward.rotationY).toBeCloseTo(0, 1);

    const right = PlayerKinematics.update(createInitialState(), { ...emptyInput, right: true }, 0, 1.0);
    expect(right.rotationY).toBeCloseTo(-Math.PI / 2, 1);

    const left = PlayerKinematics.update(createInitialState(), { ...emptyInput, left: true }, 0, 1.0);
    expect(left.rotationY).toBeCloseTo(Math.PI / 2, 1);

    const backward = PlayerKinematics.update(createInitialState(), { ...emptyInput, backward: true }, 0, 1.0);
    expect(Math.abs(backward.rotationY)).toBeCloseTo(Math.PI, 1);
  });

  it('normalizes diagonal input to prevent speed exploit', () => {
    const forwardOnly = PlayerKinematics.update(createInitialState(), { ...emptyInput, forward: true }, 0, 1.0);
    const diagonal = PlayerKinematics.update(createInitialState(), { ...emptyInput, forward: true, right: true }, 0, 1.0);

    const forwardSpeed = Math.sqrt(forwardOnly.velocity[0] ** 2 + forwardOnly.velocity[2] ** 2);
    const diagonalSpeed = Math.sqrt(diagonal.velocity[0] ** 2 + diagonal.velocity[2] ** 2);

    expect(Math.abs(forwardSpeed - diagonalSpeed)).toBeLessThan(0.1);
  });

  it('sprints at higher velocity and consumes stamina', () => {
    const initial = createInitialState();
    const sprintInput: PlayerInput = { ...emptyInput, forward: true, sprint: true };

    let state = initial;
    for (let i = 0; i < 20; i++) {
      state = PlayerKinematics.update(state, sprintInput, 0, 0.016);
    }

    expect(state.movementState).toBe('SPRINTING');
    expect(state.stats.currentStamina).toBeLessThan(state.stats.maxStamina);
    expect(Math.abs(state.velocity[2])).toBeGreaterThan(DEFAULT_PLAYER_STATS.walkSpeed * 0.9);
  });

  it('applies jump impulse and falls back to ground under gravity', () => {
    const initial = createInitialState();
    const jumpInput: PlayerInput = { ...emptyInput, jump: true };

    // Jump step
    let state = PlayerKinematics.update(initial, jumpInput, 0, 0.016);
    expect(state.movementState).toBe('JUMPING');
    expect(state.isGrounded).toBe(false);
    expect(state.velocity[1]).toBe(DEFAULT_PLAYER_STATS.jumpForce);
    expect(state.position[1]).toBeGreaterThan(0);

    // Advance simulation until player reaches apex and falls
    for (let i = 0; i < 60; i++) {
      state = PlayerKinematics.update(state, emptyInput, 0, 0.016);
    }

    // Should land back on terrain height
    const expectedGroundHeight = getTerrainHeight(state.position[0], state.position[2]);
    expect(state.position[1]).toBeCloseTo(expectedGroundHeight, 2);
    expect(state.isGrounded).toBe(true);
    expect(state.velocity[1]).toBe(0);
  });

  it('recovers stamina when walking or resting', () => {
    const initial = createInitialState();
    initial.stats.currentStamina = 50;

    let state = initial;
    for (let i = 0; i < 30; i++) {
      state = PlayerKinematics.update(state, emptyInput, 0, 0.016);
    }

    expect(state.stats.currentStamina).toBeGreaterThan(50);
  });
});
