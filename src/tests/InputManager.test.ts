import { describe, it, expect } from 'vitest';
import { InputManager } from '@/game/player/InputManager';

describe('InputManager', () => {
  it('captures keys correctly when attached', () => {
    const input = new InputManager();

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', key: 'w' }));
    expect(input.getInput().forward).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', key: 'w' }));
    expect(input.getInput().forward).toBe(false);

    input.detach();
  });

  it('resurrects listeners after React 18 StrictMode unmount-remount cycle', () => {
    const input = new InputManager();

    // 1. Initial mount
    input.attach();

    // 2. StrictMode simulates unmount
    input.detach();

    // 3. StrictMode simulates remount
    input.attach();

    // Keystrokes MUST continue to register
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ' }));
    expect(input.getInput().jump).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', key: 'a' }));
    expect(input.getInput().left).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', key: ' ' }));
    expect(input.getInput().jump).toBe(false);

    input.detach();
  });

  it('handles lowercase key equivalents for alternate layouts', () => {
    const input = new InputManager();
    input.attach();

    window.dispatchEvent(new KeyboardEvent('keydown', { code: '', key: 's' }));
    expect(input.getInput().backward).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keyup', { code: '', key: 's' }));
    expect(input.getInput().backward).toBe(false);

    input.detach();
  });

  it('accumulates mouse look delta without requiring mouse clicks or dragging', () => {
    const input = new InputManager();
    input.attach();

    // Fire mousemove with zero buttons pressed
    window.dispatchEvent(new MouseEvent('mousemove', { movementX: 15, movementY: -8, buttons: 0 }));

    const delta = input.consumeMouseDelta();
    expect(delta.x).toBe(15);
    expect(delta.y).toBe(-8);

    // Delta should be reset after consuming
    const secondDelta = input.consumeMouseDelta();
    expect(secondDelta.x).toBe(0);
    expect(secondDelta.y).toBe(0);

    input.detach();
  });
});
