import { PlayerInput } from './player.types';

export class InputManager {
  private keys: Record<string, boolean> = {};
  private mouseDeltaX = 0;
  private mouseDeltaY = 0;
  private isPointerLocked = false;
  private targetElement: HTMLElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
      window.addEventListener('blur', this.handleBlur);
      document.addEventListener('pointerlockchange', this.handlePointerLockChange);
    }
  }

  public attachToElement(el: HTMLElement): void {
    this.targetElement = el;
    el.addEventListener('mousemove', this.handleMouseMove);
    el.addEventListener('click', this.requestPointerLock);
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
      this.targetElement.removeEventListener('click', this.requestPointerLock);
      this.targetElement = null;
    }
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    this.keys[e.code] = true;
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys[e.code] = false;
  };

  private handleBlur = (): void => {
    this.keys = {};
  };

  private requestPointerLock = (): void => {
    if (this.targetElement && document.pointerLockElement !== this.targetElement) {
      this.targetElement.requestPointerLock?.();
    }
  };

  private handlePointerLockChange = (): void => {
    this.isPointerLocked = document.pointerLockElement === this.targetElement;
  };

  private handleMouseMove = (e: MouseEvent): void => {
    if (this.isPointerLocked || e.buttons === 1 || e.buttons === 2) {
      this.mouseDeltaX += e.movementX;
      this.mouseDeltaY += e.movementY;
    }
  };

  public getInput(): PlayerInput {
    return {
      forward: Boolean(this.keys['KeyW'] || this.keys['ArrowUp']),
      backward: Boolean(this.keys['KeyS'] || this.keys['ArrowDown']),
      left: Boolean(this.keys['KeyA'] || this.keys['ArrowLeft']),
      right: Boolean(this.keys['KeyD'] || this.keys['ArrowRight']),
      jump: Boolean(this.keys['Space']),
      sprint: Boolean(this.keys['ShiftLeft'] || this.keys['ShiftRight']),
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
