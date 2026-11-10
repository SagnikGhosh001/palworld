import { PlayerInput } from './player.types';

export class InputManager {
  private keys: Record<string, boolean> = {};
  private mouseDeltaX = 0;
  private mouseDeltaY = 0;
  private isPointerLocked = false;
  private isOverCanvas = true; // Default true so movement starts immediately
  private targetElement: HTMLElement | null = null;
  private isAttached = false;

  constructor() {
    this.attach();
  }

  public attach(el?: HTMLElement): void {
    if (el) {
      this.targetElement = el;
      el.addEventListener('mouseenter', this.handleMouseEnter);
      el.addEventListener('mouseleave', this.handleMouseLeave);
      el.addEventListener('click', this.handleClick);
    }

    if (typeof window !== 'undefined' && !this.isAttached) {
      window.addEventListener('keydown', this.handleKeyDown, { passive: false });
      window.addEventListener('keyup', this.handleKeyUp, { passive: false });
      window.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('pointerlockchange', this.handlePointerLockChange);
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      this.isAttached = true;
    }
  }

  public detach(): void {
    if (this.targetElement) {
      this.targetElement.removeEventListener('mouseenter', this.handleMouseEnter);
      this.targetElement.removeEventListener('mouseleave', this.handleMouseLeave);
      this.targetElement.removeEventListener('click', this.handleClick);
      this.targetElement = null;
    }

    if (typeof window !== 'undefined' && this.isAttached) {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
      window.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      this.isAttached = false;
    }

    this.keys = {};
  }

  private handleMouseEnter = (): void => {
    this.isOverCanvas = true;
  };

  private handleMouseLeave = (): void => {
    if (!this.isPointerLocked) {
      this.isOverCanvas = false;
    }
  };

  private handleClick = (): void => {
    if (this.targetElement) {
      this.targetElement.focus();
      // Optional seamless pointer lock on click for continuous 360 rotation
      if (document.pointerLockElement !== this.targetElement) {
        this.targetElement.requestPointerLock?.();
      }
    }
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) || e.key === ' ') {
      e.preventDefault();
    }

    if (e.code) {
      this.keys[e.code] = true;
    }
    if (e.key) {
      this.keys[e.key.toLowerCase()] = true;
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    if (e.code) {
      this.keys[e.code] = false;
    }
    if (e.key) {
      this.keys[e.key.toLowerCase()] = false;
    }
  };

  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.keys = {};
    }
  };

  private handleMouseMove = (e: MouseEvent): void => {
    // Free mouse look: rotates whenever pointer-locked OR moving over the canvas without any click or drag!
    if (this.isPointerLocked || this.isOverCanvas) {
      this.mouseDeltaX += e.movementX;
      this.mouseDeltaY += e.movementY;
    }
  };

  private handlePointerLockChange = (): void => {
    this.isPointerLocked = document.pointerLockElement === this.targetElement;
    if (this.isPointerLocked) {
      this.isOverCanvas = true;
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

  public getActiveKeys(): string[] {
    return Object.keys(this.keys).filter((k) => this.keys[k]);
  }
}

export const inputManager = new InputManager();
