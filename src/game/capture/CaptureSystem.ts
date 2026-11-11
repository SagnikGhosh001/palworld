import { ActiveCaptureProjectile, CaptureDeviceTier } from './capture.types';
import { CaptureFormula } from './CaptureFormula';
import { creatureSpawner } from '../creatures/CreatureSpawner';
import { useCreatureStore } from '../creatures/useCreatureStore';
import { usePartyStore } from './usePartyStore';
import { soundFx } from '../audio/AudioSynthesizer';
import { globalEventBus } from '../core/EventBus';

export class CaptureSystem {
  private activeProjectile: ActiveCaptureProjectile | null = null;
  private captureMessage: { text: string; success: boolean; timer: number } | null = null;

  public throwCapsule(
    playerPos: [number, number, number],
    targetCreatureId: string,
    tier: CaptureDeviceTier
  ): boolean {
    if (this.activeProjectile) return false; // Capsule already in flight

    const creature = creatureSpawner.getById(targetCreatureId);
    if (!creature) return false;

    // Check inventory
    const partyStore = usePartyStore.getState();
    const consumed = partyStore.consumeCapsule(tier);
    if (!consumed) return false;

    // Roll capture outcome
    const success = CaptureFormula.rollCaptureAttempt(creature, tier);

    // Audio throw whoosh
    soundFx.playJump();

    this.activeProjectile = {
      id: `proj-${Date.now()}`,
      targetCreatureId,
      deviceTier: tier,
      startPos: [playerPos[0], playerPos[1] + 1.3, playerPos[2]],
      targetPos: [...creature.position],
      currentPos: [playerPos[0], playerPos[1] + 1.3, playerPos[2]],
      progress: 0,
      state: 'FLYING',
      stateTimer: 0,
      successOutcome: success,
    };

    return true;
  }

  public update(delta: number): void {
    if (this.captureMessage) {
      this.captureMessage.timer -= delta;
      if (this.captureMessage.timer <= 0) {
        this.captureMessage = null;
      }
    }

    if (!this.activeProjectile) return;

    const proj = this.activeProjectile;

    if (proj.state === 'FLYING') {
      proj.progress += delta * 2.2; // flight speed

      if (proj.progress >= 1.0) {
        proj.progress = 1.0;
        proj.currentPos = [...proj.targetPos];
        proj.state = 'SHAKING_1';
        proj.stateTimer = 0.65;
        soundFx.playHit(); // Impact sound
      } else {
        // Parabolic arc interpolation
        const t = proj.progress;
        const arcHeight = Math.sin(t * Math.PI) * 2.5;

        proj.currentPos[0] = proj.startPos[0] + (proj.targetPos[0] - proj.startPos[0]) * t;
        proj.currentPos[1] = proj.startPos[1] + (proj.targetPos[1] - proj.startPos[1]) * t + arcHeight;
        proj.currentPos[2] = proj.startPos[2] + (proj.targetPos[2] - proj.startPos[2]) * t;
      }
      return;
    }

    // Shake sequence (3 suspenseful pulses)
    proj.stateTimer -= delta;

    if (proj.stateTimer <= 0) {
      switch (proj.state) {
        case 'SHAKING_1':
          proj.state = 'SHAKING_2';
          proj.stateTimer = 0.65;
          soundFx.playUiClick(); // Click shake tick
          break;

        case 'SHAKING_2':
          proj.state = 'SHAKING_3';
          proj.stateTimer = 0.65;
          soundFx.playUiClick();
          break;

        case 'SHAKING_3':
          if (proj.successOutcome) {
            this.resolveCaptureSuccess(proj);
          } else {
            this.resolveCaptureFailed(proj);
          }
          break;

        case 'SUCCESS':
        case 'BROKE_FREE':
          this.activeProjectile = null;
          break;
      }
    }
  }

  private resolveCaptureSuccess(proj: ActiveCaptureProjectile): void {
    const creature = creatureSpawner.getById(proj.targetCreatureId);
    if (creature) {
      const owned = usePartyStore.getState().addCapturedCreature(creature.speciesId, creature.level);
      this.captureMessage = {
        text: `Captured ${owned.name} (Lv.${owned.level})! Added to ${
          usePartyStore.getState().activeParty.some((c) => c.id === owned.id) ? 'Party' : 'Storage Box'
        }!`,
        success: true,
        timer: 4.0,
      };
      // Despawn wild creature permanently from spawner
      creatureSpawner.remove(proj.targetCreatureId);
      useCreatureStore.getState().syncWithSpawner();
      if (useCreatureStore.getState().targetedCreatureId === proj.targetCreatureId) {
        useCreatureStore.getState().setTargetedCreatureId(null);
      }
    }
    proj.state = 'SUCCESS';
    proj.stateTimer = 1.0;
    globalEventBus.emit('CREATURE_CAPTURED', { creatureId: proj.targetCreatureId });
  }

  private resolveCaptureFailed(proj: ActiveCaptureProjectile): void {
    const creature = creatureSpawner.getById(proj.targetCreatureId);
    this.captureMessage = {
      text: `${creature ? creature.speciesId : 'Wild creature'} broke free!`,
      success: false,
      timer: 3.0,
    };
    soundFx.playHit();
    proj.state = 'BROKE_FREE';
    proj.stateTimer = 1.0;
  }

  public getActiveProjectile(): ActiveCaptureProjectile | null {
    return this.activeProjectile;
  }

  public getCaptureMessage(): { text: string; success: boolean } | null {
    return this.captureMessage;
  }

  public reset(): void {
    this.activeProjectile = null;
    this.captureMessage = null;
  }
}

export const captureSystem = new CaptureSystem();
