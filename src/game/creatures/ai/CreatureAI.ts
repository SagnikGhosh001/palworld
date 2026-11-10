import { CreatureAIState, CreatureInstance } from '../creature.types';
import { STARTER_SPECIES } from '../../content/creatures/speciesRegistry';
import { getTerrainHeight } from '../../world/terrain/TerrainData';

export class CreatureAI {
  /**
   * Deterministically updates a creature's autonomous AI decision state and kinematics.
   */
  public static update(
    creature: CreatureInstance,
    playerPos: [number, number, number],
    delta: number
  ): CreatureInstance {
    const updated: CreatureInstance = {
      ...creature,
      position: [...creature.position],
      velocity: [...creature.velocity],
      stateTimer: Math.max(0, creature.stateTimer - delta),
    };

    const species = STARTER_SPECIES[creature.speciesId];
    const baseSpeed = species ? species.baseStats.speed : 3.5;
    const temperament = species ? species.temperament : 'PASSIVE';

    // 1. Calculate distance and vector to player
    const toPlayerX = playerPos[0] - updated.position[0];
    const toPlayerZ = playerPos[2] - updated.position[2];
    const distToPlayer = Math.sqrt(toPlayerX * toPlayerX + toPlayerZ * toPlayerZ);

    // 2. Calculate distance to home spawn
    const toHomeX = updated.homeSpawnPos[0] - updated.position[0];
    const toHomeZ = updated.homeSpawnPos[2] - updated.position[2];
    const distToHome = Math.sqrt(toHomeX * toHomeX + toHomeZ * toHomeZ);

    // 3. State transitions based on environment & temperament
    let nextState: CreatureAIState = updated.aiState;

    // Check if creature has wandered too far from home (> 18m)
    if (distToHome > 18 && updated.aiState !== 'FLEE') {
      nextState = 'RETURN';
    } else if (distToPlayer < 7.0 && temperament === 'PASSIVE') {
      // Passive creatures flee when player approaches
      nextState = 'FLEE';
      if (updated.aiState !== 'FLEE') {
        updated.stateTimer = 3.5; // flee for 3.5s
      }
    } else if (distToPlayer < 8.0 && distToPlayer > 3.0 && temperament === 'CURIOUS') {
      // Curious creatures investigate nearby player
      nextState = 'INVESTIGATE';
    } else if (updated.stateTimer <= 0) {
      // Time-based transition between IDLE and WANDER
      if (updated.aiState === 'IDLE') {
        nextState = 'WANDER';
        updated.stateTimer = 3.0 + Math.random() * 3.0; // wander for 3-6s
        // Pick new random waypoint within 8m of home
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 8.0;
        updated.targetPos = [
          updated.homeSpawnPos[0] + Math.cos(angle) * radius,
          0,
          updated.homeSpawnPos[2] + Math.sin(angle) * radius,
        ];
      } else {
        nextState = 'IDLE';
        updated.stateTimer = 2.0 + Math.random() * 2.5; // rest for 2-4.5s
        updated.targetPos = null;
      }
    }

    updated.aiState = nextState;

    // 4. Action execution based on current AI state
    let targetSpeed = 0;
    let moveDirX = 0;
    let moveDirZ = 0;

    switch (updated.aiState) {
      case 'IDLE':
        targetSpeed = 0;
        break;

      case 'INVESTIGATE':
        targetSpeed = baseSpeed * 0.7; // cautious approach
        moveDirX = toPlayerX / (distToPlayer || 1);
        moveDirZ = toPlayerZ / (distToPlayer || 1);
        break;

      case 'FLEE':
        targetSpeed = baseSpeed * 1.5; // sprint away
        moveDirX = -toPlayerX / (distToPlayer || 1);
        moveDirZ = -toPlayerZ / (distToPlayer || 1);
        break;

      case 'RETURN':
        targetSpeed = baseSpeed * 1.1;
        moveDirX = toHomeX / (distToHome || 1);
        moveDirZ = toHomeZ / (distToHome || 1);
        if (distToHome < 3.0) {
          updated.aiState = 'IDLE';
          updated.stateTimer = 2.0;
        }
        break;

      case 'WANDER':
        if (updated.targetPos) {
          const toTargetX = updated.targetPos[0] - updated.position[0];
          const toTargetZ = updated.targetPos[2] - updated.position[2];
          const distToTarget = Math.sqrt(toTargetX * toTargetX + toTargetZ * toTargetZ);

          if (distToTarget > 1.0) {
            targetSpeed = baseSpeed * 0.8;
            moveDirX = toTargetX / distToTarget;
            moveDirZ = toTargetZ / distToTarget;
          } else {
            updated.aiState = 'IDLE';
            updated.stateTimer = 2.0;
            targetSpeed = 0;
          }
        }
        break;
    }

    // 5. Integrate kinematics
    const targetVelX = moveDirX * targetSpeed;
    const targetVelZ = moveDirZ * targetSpeed;

    updated.velocity[0] += (targetVelX - updated.velocity[0]) * Math.min(1, delta * 8);
    updated.velocity[2] += (targetVelZ - updated.velocity[2]) * Math.min(1, delta * 8);

    updated.position[0] += updated.velocity[0] * delta;
    updated.position[2] += updated.velocity[2] * delta;

    // Clamp height to terrain
    updated.position[1] = getTerrainHeight(updated.position[0], updated.position[2]);

    // Smoothly face movement direction
    if (Math.abs(updated.velocity[0]) > 0.1 || Math.abs(updated.velocity[2]) > 0.1) {
      const desiredAngle = Math.atan2(-updated.velocity[0], -updated.velocity[2]);
      updated.rotationY = this.lerpAngle(updated.rotationY, desiredAngle, Math.min(1, delta * 10));
    }

    return updated;
  }

  private static lerpAngle(current: number, target: number, t: number): number {
    let diff = (target - current) % (Math.PI * 2);
    if (diff < -Math.PI) diff += Math.PI * 2;
    if (diff > Math.PI) diff -= Math.PI * 2;
    return current + diff * t;
  }
}
