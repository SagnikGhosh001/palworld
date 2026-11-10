export type MovementState = 'IDLE' | 'WALKING' | 'SPRINTING' | 'JUMPING' | 'FALLING';

export interface PlayerInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
}

export interface PlayerStats {
  maxHealth: number;
  currentHealth: number;
  maxStamina: number;
  currentStamina: number;
  walkSpeed: number;
  sprintSpeed: number;
  jumpForce: number;
  staminaDrainRate: number; // stamina per second while sprinting
  staminaRecoveryRate: number; // stamina per second while resting
}

export interface PlayerState {
  position: [number, number, number];
  velocity: [number, number, number];
  rotationY: number; // radians
  isGrounded: boolean;
  movementState: MovementState;
  stats: PlayerStats;
}
