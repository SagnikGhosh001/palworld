import { CreatureInstance } from './creature.types';
import { STARTER_SPECIES, VERDANT_SPAWN_ZONES } from '../content/creatures/speciesRegistry';
import { getTerrainHeight } from '../world/terrain/TerrainData';
import { CreatureAI } from './ai/CreatureAI';

export class CreatureSpawner {
  private creatures: Map<string, CreatureInstance> = new Map();
  private nextId = 1;

  constructor() {
    this.populateAllZones();
  }

  public populateAllZones(): void {
    this.creatures.clear();

    for (const zone of VERDANT_SPAWN_ZONES) {
      const countToSpawn = zone.maxCount;

      for (let i = 0; i < countToSpawn; i++) {
        // Pick species
        const speciesId = zone.speciesIds[i % zone.speciesIds.length];
        const species = STARTER_SPECIES[speciesId];
        if (!species) continue;

        // Position with slight offset within zone radius
        const angle = (i / countToSpawn) * Math.PI * 2 + Math.random() * 0.5;
        const dist = Math.random() * (zone.radius * 0.65);
        const x = zone.center[0] + Math.cos(angle) * dist;
        const z = zone.center[1] + Math.sin(angle) * dist;
        const y = getTerrainHeight(x, z);

        const level = 1 + Math.floor(Math.random() * 4); // levels 1 to 4
        const maxHp = species.baseStats.maxHealth + level * 8;

        const instance: CreatureInstance = {
          instanceId: `wild-${speciesId}-${this.nextId++}`,
          speciesId,
          level,
          currentHealth: maxHp,
          maxHealth: maxHp,
          position: [x, y, z],
          velocity: [0, 0, 0],
          rotationY: Math.random() * Math.PI * 2,
          aiState: 'IDLE',
          targetPos: null,
          homeSpawnPos: [x, y, z],
          stateTimer: 1.5 + Math.random() * 2.0,
        };

        this.creatures.set(instance.instanceId, instance);
      }
    }
  }

  public update(playerPos: [number, number, number], delta: number): void {
    for (const [id, creature] of this.creatures.entries()) {
      const updated = CreatureAI.update(creature, playerPos, delta);
      this.creatures.set(id, updated);
    }
  }

  public getAll(): CreatureInstance[] {
    return Array.from(this.creatures.values());
  }

  public getById(id: string): CreatureInstance | undefined {
    return this.creatures.get(id);
  }

  public getCount(): number {
    return this.creatures.size;
  }
}

export const creatureSpawner = new CreatureSpawner();
