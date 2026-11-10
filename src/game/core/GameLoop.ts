export type SystemUpdateFn = (delta: number, totalTime: number) => void;

/**
 * Headless, deterministic fixed-timestep game loop runner.
 * Decoupled from requestAnimationFrame so it can run both in browser and in automated test harnesses.
 */
export class GameLoop {
  private isRunning = false;
  private systems: SystemUpdateFn[] = [];
  private fixedDelta: number;
  private maxSubSteps: number;
  private accumulator = 0;
  private lastTime = 0;
  private totalTime = 0;
  private rafId: number | null = null;
  private tickCount = 0;

  constructor(targetFps = 60, maxSubSteps = 4) {
    this.fixedDelta = 1 / targetFps;
    this.maxSubSteps = maxSubSteps;
  }

  public registerSystem(system: SystemUpdateFn): () => void {
    this.systems.push(system);
    return () => {
      this.systems = this.systems.filter((s) => s !== system);
    };
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.scheduleFrame();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.rafId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Manual single step (primarily used for deterministic headless testing)
   */
  public step(deltaSeconds: number): void {
    this.accumulator += deltaSeconds;
    let steps = 0;

    while (this.accumulator >= this.fixedDelta && steps < this.maxSubSteps) {
      this.totalTime += this.fixedDelta;
      for (const system of this.systems) {
        system(this.fixedDelta, this.totalTime);
      }
      this.accumulator -= this.fixedDelta;
      this.tickCount++;
      steps++;
    }

    // Discard any excess leftover time if simulation falls too far behind
    if (this.accumulator >= this.fixedDelta) {
      this.accumulator = 0;
    }
  }

  private scheduleFrame = (): void => {
    if (!this.isRunning) return;

    if (typeof requestAnimationFrame !== 'undefined') {
      this.rafId = requestAnimationFrame(this.onFrame);
    } else {
      // Node / headless fallback
      setTimeout(this.onFrame, this.fixedDelta * 1000);
    }
  };

  private onFrame = (now?: number): void => {
    if (!this.isRunning) return;

    const currentTime = now ?? (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const elapsedSeconds = Math.min((currentTime - this.lastTime) / 1000, 0.25);
    this.lastTime = currentTime;

    this.step(elapsedSeconds);
    this.scheduleFrame();
  };

  public getTicks(): number {
    return this.tickCount;
  }

  public getTotalTime(): number {
    return this.totalTime;
  }

  public running(): boolean {
    return this.isRunning;
  }
}
