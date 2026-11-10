import { GameLoop } from '@/game/core/GameLoop';
import { inputManager } from './InputManager';
import { PlayerKinematics } from './PlayerKinematics';
import { usePlayerStore } from './usePlayerStore';
import { soundFx } from '@/game/audio/AudioSynthesizer';

export class PlayerController {
  private cameraYaw = 0;
  private footstepTimer = 0;
  private wasInAir = false;

  public setCameraYaw(yaw: number): void {
    this.cameraYaw = yaw;
  }

  public registerWithLoop(loop: GameLoop): () => void {
    return loop.registerSystem((delta: number) => {
      this.update(delta);
    });
  }

  public update(delta: number): void {
    const currentState = usePlayerStore.getState();
    const input = inputManager.getInput();

    const nextState = PlayerKinematics.update(currentState, input, this.cameraYaw, delta);

    // Audio cue for jumping
    if (!this.wasInAir && !nextState.isGrounded && nextState.movementState === 'JUMPING') {
      soundFx.playJump();
    }

    // Audio cue for landing
    if (this.wasInAir && nextState.isGrounded) {
      soundFx.playHit();
    }
    this.wasInAir = !nextState.isGrounded;

    // Footstep audio cadence during ground movement
    if (nextState.isGrounded && (nextState.movementState === 'WALKING' || nextState.movementState === 'SPRINTING')) {
      const stepInterval = nextState.movementState === 'SPRINTING' ? 0.28 : 0.42;
      this.footstepTimer += delta;
      if (this.footstepTimer >= stepInterval) {
        this.footstepTimer = 0;
        soundFx.playUiClick(); // gentle rhythmic footstep pop
      }
    } else {
      this.footstepTimer = 0;
    }

    usePlayerStore.getState().setPlayerState(nextState);
  }
}

export const playerController = new PlayerController();
