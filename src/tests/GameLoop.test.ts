import { describe, it, expect, vi } from 'vitest';
import { GameLoop } from '@/game/core/GameLoop';

describe('GameLoop (Headless Simulation)', () => {
  it('runs deterministic simulation steps headlessly', () => {
    const loop = new GameLoop(60);
    const mockSystem = vi.fn();

    loop.registerSystem(mockSystem);

    // Advance 0.05 seconds (at 60Hz delta = 1/60 ~= 0.01666s, 3 ticks should run)
    loop.step(0.05);

    expect(mockSystem).toHaveBeenCalled();
    expect(loop.getTicks()).toBeGreaterThanOrEqual(2);
  });

  it('unregisters systems correctly', () => {
    const loop = new GameLoop(60);
    const mockSystem = vi.fn();

    const unregister = loop.registerSystem(mockSystem);
    loop.step(0.02);
    expect(mockSystem).toHaveBeenCalledTimes(1);

    unregister();
    loop.step(0.02);
    expect(mockSystem).toHaveBeenCalledTimes(1);
  });

  it('accumulates total simulation time across steps', () => {
    const loop = new GameLoop(60);
    loop.step(0.05);
    loop.step(0.05);
    expect(loop.getTotalTime()).toBeGreaterThan(0.08);
  });
});
