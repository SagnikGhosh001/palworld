import { create } from 'zustand';
import { DEFAULT_PLAYER_STATS } from './PlayerKinematics';
import { PlayerState } from './player.types';

interface PlayerStore extends PlayerState {
  setPlayerState: (state: Partial<PlayerState>) => void;
  resetPosition: () => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  position: [0, 0, 0],
  velocity: [0, 0, 0],
  rotationY: 0,
  isGrounded: true,
  movementState: 'IDLE',
  stats: { ...DEFAULT_PLAYER_STATS },

  setPlayerState: (newState) => set((prev) => ({ ...prev, ...newState })),
  resetPosition: () =>
    set({
      position: [0, 0, 0],
      velocity: [0, 0, 0],
      rotationY: 0,
      isGrounded: true,
      movementState: 'IDLE',
    }),
}));
