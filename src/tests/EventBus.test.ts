import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '@/game/core/EventBus';

describe('EventBus', () => {
  it('dispatches events to registered listeners', () => {
    const bus = new EventBus();
    const handler = vi.fn();

    bus.on('CREATURE_SPAWNED', handler);
    bus.emit('CREATURE_SPAWNED', { id: 'mosskin-1', species: 'Mosskin' });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ id: 'mosskin-1', species: 'Mosskin' });
  });

  it('unsubscribes listeners cleanly', () => {
    const bus = new EventBus();
    const handler = vi.fn();

    const unsub = bus.on('DAMAGE_TAKEN', handler);
    bus.emit('DAMAGE_TAKEN', { amount: 15 });
    expect(handler).toHaveBeenCalledTimes(1);

    unsub();
    bus.emit('DAMAGE_TAKEN', { amount: 20 });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('clears all listeners on reset', () => {
    const bus = new EventBus();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    bus.on('A', handler1);
    bus.on('B', handler2);
    bus.clear();

    bus.emit('A', {});
    bus.emit('B', {});

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });
});
