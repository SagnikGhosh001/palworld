import { CompanionCommand, CompanionState } from './companion.types';
import { usePartyStore } from '../capture/usePartyStore';
import { useCompanionStore } from './useCompanionStore';
import { getTerrainHeight } from '../world/terrain/TerrainData';
import { soundFx } from '../audio/AudioSynthesizer';

export class CompanionSystem {
  private companion: CompanionState | null = null;
  private message: string | null = null;
  private messageTimer = 0;

  public toggleSummon(playerPos: [number, number, number], playerRotationY: number): boolean {
    if (this.companion && this.companion.isSummoned) {
      return this.recallCompanion();
    } else {
      return this.summonLeadCompanion(playerPos, playerRotationY);
    }
  }

  public summonLeadCompanion(playerPos: [number, number, number], playerRotationY: number): boolean {
    const party = usePartyStore.getState().activeParty;
    if (party.length === 0) {
      this.showMessage('No companion in party! Catch a wild creature with [R] first.');
      return false;
    }

    const lead = party[0];

    // Position companion ~2.2m to the right-rear of the player
    const spawnAngle = playerRotationY + Math.PI * 0.75;
    const spawnX = playerPos[0] + Math.sin(spawnAngle) * 2.2;
    const spawnZ = playerPos[2] + Math.cos(spawnAngle) * 2.2;
    const spawnY = getTerrainHeight(spawnX, spawnZ);

    this.companion = {
      ownedId: lead.id,
      speciesId: lead.speciesId,
      name: lead.name,
      nickname: lead.nickname,
      level: lead.level,
      element: lead.element,
      currentHealth: lead.currentHealth,
      maxHealth: lead.maxHealth,
      position: [spawnX, spawnY, spawnZ],
      velocity: [0, 0, 0],
      rotationY: playerRotationY,
      isSummoned: true,
      command: 'FOLLOW',
      guardPos: null,
      isMoving: false,
    };

    useCompanionStore.getState().setSummoned(true, {
      ownedId: lead.id,
      speciesId: lead.speciesId,
      name: lead.name,
      nickname: lead.nickname,
      level: lead.level,
      element: lead.element,
      currentHealth: lead.currentHealth,
      maxHealth: lead.maxHealth,
    });
    useCompanionStore.getState().setCommand('FOLLOW');

    soundFx.playCaptureSuccess();
    this.showMessage(`Summoned ${lead.nickname}! Press [Q] for commands, [F] to recall.`);
    return true;
  }

  public recallCompanion(): boolean {
    if (!this.companion || !this.companion.isSummoned) return false;

    this.showMessage(`Recalled ${this.companion.nickname}.`);
    this.companion.isSummoned = false;
    useCompanionStore.getState().setSummoned(false, null);
    soundFx.playHit();
    return true;
  }

  public setCommand(command: CompanionCommand): void {
    if (!this.companion || !this.companion.isSummoned) return;

    this.companion.command = command;
    if (command === 'STAY') {
      this.companion.guardPos = [...this.companion.position];
    } else {
      this.companion.guardPos = null;
    }

    useCompanionStore.getState().setCommand(command);
    soundFx.playUiClick();
    this.showMessage(`Companion order: ${command}`);
  }

  public update(
    playerPos: [number, number, number],
    playerSpeed: number,
    delta: number
  ): void {
    if (this.message) {
      this.messageTimer -= delta;
      if (this.messageTimer <= 0) {
        this.message = null;
      }
    }

    if (!this.companion || !this.companion.isSummoned) return;

    const comp = this.companion;

    // 1. If STAY command: hold guard position
    if (comp.command === 'STAY' && comp.guardPos) {
      const dx = comp.guardPos[0] - comp.position[0];
      const dz = comp.guardPos[2] - comp.position[2];
      const distToGuard = Math.sqrt(dx * dx + dz * dz);

      if (distToGuard > 0.5) {
        const speed = 4.0;
        comp.velocity[0] = (dx / distToGuard) * speed;
        comp.velocity[2] = (dz / distToGuard) * speed;
        comp.position[0] += comp.velocity[0] * delta;
        comp.position[2] += comp.velocity[2] * delta;
        comp.isMoving = true;
      } else {
        comp.velocity[0] = 0;
        comp.velocity[2] = 0;
        comp.isMoving = false;
      }
      comp.position[1] = getTerrainHeight(comp.position[0], comp.position[2]);
      return;
    }

    // 2. FOLLOW / AGGRESSIVE / PASSIVE mode
    const toPlayerX = playerPos[0] - comp.position[0];
    const toPlayerZ = playerPos[2] - comp.position[2];
    const distToPlayer = Math.sqrt(toPlayerX * toPlayerX + toPlayerZ * toPlayerZ);

    // Stuck recovery: teleport if too far behind (> 26 meters)
    if (distToPlayer > 26.0) {
      comp.position[0] = playerPos[0] - 2.5;
      comp.position[2] = playerPos[2] - 2.5;
      comp.position[1] = getTerrainHeight(comp.position[0], comp.position[2]);
      comp.velocity = [0, 0, 0];
      comp.isMoving = false;
      return;
    }

    // Follow target: maintain 2.4m distance to avoid colliding or crowding player
    const stopRadius = 2.4;

    if (distToPlayer > stopRadius) {
      // Dynamic follow speed: match player's sprint or walk, catch up faster if falling behind
      const catchupFactor = distToPlayer > 6.0 ? 1.35 : 1.0;
      const targetSpeed = Math.max(5.5, playerSpeed * 1.1) * catchupFactor;

      const dirX = toPlayerX / distToPlayer;
      const dirZ = toPlayerZ / distToPlayer;

      comp.velocity[0] += (dirX * targetSpeed - comp.velocity[0]) * Math.min(1, delta * 10);
      comp.velocity[2] += (dirZ * targetSpeed - comp.velocity[2]) * Math.min(1, delta * 10);

      comp.position[0] += comp.velocity[0] * delta;
      comp.position[2] += comp.velocity[2] * delta;
      comp.isMoving = true;

      // Face direction of movement
      const desiredAngle = Math.atan2(-comp.velocity[0], -comp.velocity[2]);
      comp.rotationY = this.lerpAngle(comp.rotationY, desiredAngle, Math.min(1, delta * 12));
    } else {
      // Smooth deceleration to stop
      comp.velocity[0] *= Math.max(0, 1 - delta * 12);
      comp.velocity[2] *= Math.max(0, 1 - delta * 12);
      comp.isMoving = false;
    }

    // Keep companion on terrain contours
    comp.position[1] = getTerrainHeight(comp.position[0], comp.position[2]);
  }

  private lerpAngle(current: number, target: number, t: number): number {
    let diff = (target - current) % (Math.PI * 2);
    if (diff < -Math.PI) diff += Math.PI * 2;
    if (diff > Math.PI) diff -= Math.PI * 2;
    return current + diff * t;
  }

  public getCompanion(): CompanionState | null {
    return this.companion;
  }

  public getMessage(): string | null {
    return this.message;
  }

  public reset(): void {
    this.companion = null;
    this.message = null;
    this.messageTimer = 0;
    useCompanionStore.getState().setSummoned(false, null);
  }

  private showMessage(text: string): void {
    this.message = text;
    this.messageTimer = 3.5;
  }
}

export const companionSystem = new CompanionSystem();
