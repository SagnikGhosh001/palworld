import { MovementState, PlayerInput, PlayerState, PlayerStats } from './player.types';
import { getTerrainHeight, isWater, WORLD_RADIUS } from '../world/terrain/TerrainData';

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  maxHealth: 100,
  currentHealth: 100,
  maxStamina: 100,
  currentStamina: 100,
  walkSpeed: 6.0, // meters per second
  sprintSpeed: 10.5,
  jumpForce: 9.0,
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

    // Water wading slows player slightly (75% movement speed)
    const inWater = isWater(nextState.position[0], nextState.position[2]);
    const waterMultiplier = inWater ? 0.75 : 1.0;

    let currentSpeed = (isSprinting ? nextState.stats.sprintSpeed : nextState.stats.walkSpeed) * waterMultiplier;

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

    // 4. Integrate position
    const nextPosX = nextState.position[0] + nextState.velocity[0] * delta;
    const nextPosZ = nextState.position[2] + nextState.velocity[2] * delta;

    // 5. Boundary collision (keep within natural world boundary)
    const distFromOrigin = Math.sqrt(nextPosX * nextPosX + nextPosZ * nextPosZ);
    if (distFromOrigin < WORLD_RADIUS) {
      nextState.position[0] = nextPosX;
      nextState.position[2] = nextPosZ;
    } else {
      // Clamp to boundary circle
      const angle = Math.atan2(nextPosZ, nextPosX);
      nextState.position[0] = Math.cos(angle) * (WORLD_RADIUS - 0.1);
      nextState.position[2] = Math.sin(angle) * (WORLD_RADIUS - 0.1);
      nextState.velocity[0] = 0;
      nextState.velocity[2] = 0;
    }

    // 6. Terrain heightfield collision query
    const groundHeight = getTerrainHeight(nextState.position[0], nextState.position[2]);

    if (nextState.isGrounded) {
      if (input.jump) {
        nextState.velocity[1] = nextState.stats.jumpForce;
        nextState.isGrounded = false;
        nextState.position[1] += nextState.velocity[1] * delta;
      } else {
        // Stick to terrain contours when grounded
        nextState.velocity[1] = 0;
        nextState.position[1] = groundHeight;
      }
    } else {
      nextState.velocity[1] += GRAVITY * delta;
      nextState.position[1] += nextState.velocity[1] * delta;

      // Check landing on contoured terrain
      if (nextState.position[1] <= groundHeight) {
        nextState.position[1] = groundHeight;
        nextState.isGrounded = true;
        if (nextState.velocity[1] < 0) {
          nextState.velocity[1] = 0;
        }
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
