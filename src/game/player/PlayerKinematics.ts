import { MovementState, PlayerInput, PlayerState, PlayerStats } from './player.types';

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  maxHealth: 100,
  currentHealth: 100,
  maxStamina: 100,
  currentStamina: 100,
  walkSpeed: 6.0, // meters per second
  sprintSpeed: 10.5,
  jumpForce: 8.5,
  staminaDrainRate: 20, // drains in ~5s of continuous sprint
  staminaRecoveryRate: 25,
};

export const GRAVITY = -24.0; // m/s²

export class PlayerKinematics {
  /**
   * Updates player kinematics deterministically given input, camera angle, and elapsed delta time.
   */
  public static update(
    currentState: PlayerState,
    input: PlayerInput,
    cameraYaw: number,
    delta: number
  ): PlayerState {
    const nextState: PlayerState = {
      position: [...currentState.position],
      velocity: [...currentState.velocity],
      rotationY: currentState.rotationY,
      isGrounded: currentState.isGrounded,
      movementState: currentState.movementState,
      stats: { ...currentState.stats },
    };

    // 1. Calculate local input direction
    let inputX = 0;
    let inputZ = 0;

    if (input.forward) inputZ -= 1;
    if (input.backward) inputZ += 1;
    if (input.left) inputX -= 1;
    if (input.right) inputX += 1;

    const inputLength = Math.sqrt(inputX * inputX + inputZ * inputZ);
    const hasMoveInput = inputLength > 0.001;

    // 2. Sprint & Stamina logic
    const canSprint = input.sprint && hasMoveInput && nextState.stats.currentStamina > 0;
    const isSprinting = canSprint;

    if (isSprinting) {
      nextState.stats.currentStamina = Math.max(
        0,
        nextState.stats.currentStamina - nextState.stats.staminaDrainRate * delta
      );
    } else {
      nextState.stats.currentStamina = Math.min(
        nextState.stats.maxStamina,
        nextState.stats.currentStamina + nextState.stats.staminaRecoveryRate * delta
      );
    }

    const currentSpeed = isSprinting ? nextState.stats.sprintSpeed : nextState.stats.walkSpeed;

    // 3. Transform planar input relative to camera yaw
    let targetVelX = 0;
    let targetVelZ = 0;

    if (hasMoveInput) {
      const normX = inputX / inputLength;
      const normZ = inputZ / inputLength;

      // Rotate planar direction by camera yaw
      // cameraYaw: 0 is looking towards -Z
      const sinYaw = Math.sin(cameraYaw);
      const cosYaw = Math.cos(cameraYaw);

      targetVelX = (normX * cosYaw + normZ * sinYaw) * currentSpeed;
      targetVelZ = (-normX * sinYaw + normZ * cosYaw) * currentSpeed;

      // Rotate player towards movement vector
      const desiredAngle = Math.atan2(targetVelX, targetVelZ);
      nextState.rotationY = this.lerpAngle(nextState.rotationY, desiredAngle, Math.min(1, delta * 14));
    }

    // Smooth horizontal velocity
    const horizontalAcceleration = nextState.isGrounded ? 16 : 4;
    nextState.velocity[0] += (targetVelX - nextState.velocity[0]) * Math.min(1, delta * horizontalAcceleration);
    nextState.velocity[2] += (targetVelZ - nextState.velocity[2]) * Math.min(1, delta * horizontalAcceleration);

    // 4. Vertical velocity, Jump, and Gravity
    if (nextState.isGrounded) {
      if (input.jump) {
        nextState.velocity[1] = nextState.stats.jumpForce;
        nextState.isGrounded = false;
      } else {
        nextState.velocity[1] = 0;
      }
    } else {
      nextState.velocity[1] += GRAVITY * delta;
    }

    // 5. Integrate position
    nextState.position[0] += nextState.velocity[0] * delta;
    nextState.position[1] += nextState.velocity[1] * delta;
    nextState.position[2] += nextState.velocity[2] * delta;

    // 6. Ground collision check (y = 0 base plane for Phase 1)
    if (nextState.position[1] <= 0) {
      nextState.position[1] = 0;
      nextState.isGrounded = true;
      if (nextState.velocity[1] < 0) {
        nextState.velocity[1] = 0;
      }
    }

    // 7. Resolve movement state for animation & HUD
    nextState.movementState = this.determineState(nextState, hasMoveInput, isSprinting);

    return nextState;
  }

  private static determineState(
    state: PlayerState,
    hasMoveInput: boolean,
    isSprinting: boolean
  ): MovementState {
    if (!state.isGrounded) {
      return state.velocity[1] > 0 ? 'JUMPING' : 'FALLING';
    }
    if (!hasMoveInput) {
      return 'IDLE';
    }
    return isSprinting ? 'SPRINTING' : 'WALKING';
  }

  /**
   * Shortest-path angle lerp
   */
  private static lerpAngle(current: number, target: number, t: number): number {
    let diff = (target - current) % (Math.PI * 2);
    if (diff < -Math.PI) diff += Math.PI * 2;
    if (diff > Math.PI) diff -= Math.PI * 2;
    return current + diff * t;
  }
}
