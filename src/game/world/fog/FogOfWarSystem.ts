import { VERDANT_LANDMARKS, Landmark } from '../terrain/TerrainData';

export const FOG_GRID_SIZE = 60; // 60x60 cells
export const FOG_WORLD_EXTENT = 60; // -60m to +60m
export const FOG_CELL_SIZE = (FOG_WORLD_EXTENT * 2) / FOG_GRID_SIZE; // 2 meters per cell
export const REVEAL_RADIUS = 16; // meters

export class FogOfWarSystem {
  // 1D array of length FOG_GRID_SIZE * FOG_GRID_SIZE (true if discovered)
  private grid: Uint8Array;
  private discoveredLandmarks: Set<string> = new Set();
  private totalDiscoveredCount = 0;

  constructor() {
    this.grid = new Uint8Array(FOG_GRID_SIZE * FOG_GRID_SIZE);
  }

  /**
   * Converts world coordinates (x, z) to grid coordinates (gx, gz).
   */
  public worldToGrid(x: number, z: number): [number, number] {
    const gx = Math.floor((x + FOG_WORLD_EXTENT) / FOG_CELL_SIZE);
    const gz = Math.floor((z + FOG_WORLD_EXTENT) / FOG_CELL_SIZE);
    return [
      Math.max(0, Math.min(FOG_GRID_SIZE - 1, gx)),
      Math.max(0, Math.min(FOG_GRID_SIZE - 1, gz)),
    ];
  }

  /**
   * Updates discovery around player position.
   * Returns newly discovered landmarks, if any.
   */
  public update(playerX: number, playerZ: number): Landmark[] {
    const [centerGx, centerGz] = this.worldToGrid(playerX, playerZ);
    const cellRadius = Math.ceil(REVEAL_RADIUS / FOG_CELL_SIZE);

    for (let dz = -cellRadius; dz <= cellRadius; dz++) {
      for (let dx = -cellRadius; dx <= cellRadius; dx++) {
        const gx = centerGx + dx;
        const gz = centerGz + dz;

        if (gx < 0 || gx >= FOG_GRID_SIZE || gz < 0 || gz >= FOG_GRID_SIZE) continue;

        const cellDistSq = (dx * FOG_CELL_SIZE) ** 2 + (dz * FOG_CELL_SIZE) ** 2;
        if (cellDistSq <= REVEAL_RADIUS * REVEAL_RADIUS) {
          const index = gz * FOG_GRID_SIZE + gx;
          if (this.grid[index] === 0) {
            this.grid[index] = 1;
            this.totalDiscoveredCount++;
          }
        }
      }
    }

    // Check landmark proximity for discovery
    const newLandmarks: Landmark[] = [];
    for (const landmark of VERDANT_LANDMARKS) {
      if (!this.discoveredLandmarks.has(landmark.id)) {
        const dist = Math.sqrt(
          (playerX - landmark.position[0]) ** 2 + (playerZ - landmark.position[2]) ** 2
        );
        if (dist <= REVEAL_RADIUS + 4) {
          this.discoveredLandmarks.add(landmark.id);
          newLandmarks.push(landmark);
        }
      }
    }

    return newLandmarks;
  }

  public isCellDiscovered(gx: number, gz: number): boolean {
    if (gx < 0 || gx >= FOG_GRID_SIZE || gz < 0 || gz >= FOG_GRID_SIZE) return false;
    return this.grid[gz * FOG_GRID_SIZE + gx] === 1;
  }

  public isWorldPositionDiscovered(x: number, z: number): boolean {
    const [gx, gz] = this.worldToGrid(x, z);
    return this.isCellDiscovered(gx, gz);
  }

  public getExplorationPercentage(): number {
    const totalCells = FOG_GRID_SIZE * FOG_GRID_SIZE;
    return (this.totalDiscoveredCount / totalCells) * 100;
  }

  public getDiscoveredLandmarks(): Landmark[] {
    return VERDANT_LANDMARKS.filter((l) => this.discoveredLandmarks.has(l.id));
  }

  public getGridData(): Uint8Array {
    return this.grid;
  }

  public serialize(): { gridBase64: string; landmarks: string[] } {
    let binary = '';
    const len = this.grid.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(this.grid[i]);
    }
    return {
      gridBase64: typeof btoa !== 'undefined' ? btoa(binary) : '',
      landmarks: Array.from(this.discoveredLandmarks),
    };
  }

  public deserialize(data: { gridBase64: string; landmarks: string[] }): void {
    this.discoveredLandmarks = new Set(data.landmarks);
    if (data.gridBase64 && typeof atob !== 'undefined') {
      const binary = atob(data.gridBase64);
      this.totalDiscoveredCount = 0;
      for (let i = 0; i < binary.length; i++) {
        const val = binary.charCodeAt(i);
        this.grid[i] = val;
        if (val === 1) this.totalDiscoveredCount++;
      }
    }
  }
}

export const fogOfWar = new FogOfWarSystem();
