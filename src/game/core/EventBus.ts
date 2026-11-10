export type EventCallback<T = any> = (payload: T) => void;

/**
 * Type-safe decoupled event bus for cross-system communication.
 * Allows combat, AI, input, persistence, and audio systems to interact without hard dependencies.
 */
export class EventBus {
  private listeners = new Map<string, Set<EventCallback>>();

  public on<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const set = this.listeners.get(event)!;
    set.add(callback);

    // Return unsubscribe function
    return () => {
      set.delete(callback);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  public emit<T = any>(event: string, payload: T): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const callback of set) {
      try {
        callback(payload);
      } catch (err) {
        console.error(`Error in event listener for "${event}":`, err);
      }
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const globalEventBus = new EventBus();
