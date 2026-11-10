import { PlayerInput } from './player.types';

export class InputManager {
  private keys: Record<string, boolean> = {};
  private mouseDeltaX = 0;
  private mouseDeltaY = 0;
  private isPointerLocked = false;
  private targetElement: HTMLElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown, { passive: false });
      window.addEventListener('keyup', this.handleKeyUp, { passive: false });
      window.addEventListener('blur', this.handleBlur);
      document.addEventListener('pointerlockchange', this.handlePointerLockChange);
    }
  }

  public attachToElement(el: HTMLElement): void {
    this.targetElement = el;
    el.addEventListener('mousemove', this.handleMouseMove);
    el.addEventListener('mousedown', this.handleMouseDown);
  }

  public detach(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
      window.removeEventListener('blur', this.handleBlur);
      document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
    }
    if (this.targetElement) {
      this.targetElement.removeEventListener('mousemove', this.handleMouseMove);
      this.targetElement.removeEventListener('mousedown', this.handleMouseDown);
      this.targetElement = null;
    }
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    // Record both code and lowercase key for cross-layout resilience
    this.keys[e.code] = true;
    if (e.key) {
      this.keys[e.key.toLowerCase()] = true;
    }

    // Prevent arrow keys or space from scrolling the browser window
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys[e.code] = false;
    if (e.key) {
      this.keys[e.key.toLowerCase()] = false;
    }
  };

  private handleBlur = (): void => {
    this.keys = {};
  };

  private handleMouseDown = (e: MouseEvent): void => {
    // Ensure the container/window is focused on click
    if (this.targetElement) {
      this.targetElement.focus();
    }
    // Right click or double-click can optionally engage pointer lock
    if (e.button === 2 && this.targetElement && document.pointerLockElement !== this.targetElement) {
      this.targetElement.requestPointerLock?.();
    }
  };

  private handlePointerLockChange = (): void => {
    this.isPointerLocked = document.pointerLockElement === this.targetElement;
  };

  private handleMouseMove = (e: MouseEvent): void => {
    // Look around either when pointer-locked OR while dragging mouse (left or right button held)
    if (this.isPointerLocked || e.buttons > 0) {
      this.mouseDeltaX += e.movementX;
      this.mouseDeltaY += e.movementY;
    }
  };

  public getInput(): PlayerInput {
    const isForward = Boolean(this.keys['KeyW'] || this.keys['w'] || this.keys['ArrowUp']);
    const isBackward = Boolean(this.keys['KeyS'] || this.keys['s'] || this.keys['ArrowDown']);
    const isLeft = Boolean(this.keys['KeyA'] || this.keys['a'] || this.keys['ArrowLeft']);
    const isRight = Boolean(this.keys['KeyD'] || this.keys['d'] || this.keys['ArrowRight']);
    const isJump = Boolean(this.keys['Space'] || this.keys[' ']);
    const isSprint = Boolean(this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.keys['shift']);

    return {
      forward: isForward,
      backward: isBackward,
      left: isLeft,
      right: isRight,
      jump: isJump,
      sprint: isSprint,
    };
  }

  public consumeMouseDelta(): { x: number; y: number } {
    const delta = { x: this.mouseDeltaX, y: this.mouseDeltaY };
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    return delta;
  }

  public isLocked(): boolean {
    return this.isPointerLocked;
  }
}

export const inputManager = new InputManager();
