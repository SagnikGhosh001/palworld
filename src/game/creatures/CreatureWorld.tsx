import { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { creatureSpawner } from './CreatureSpawner';
import { CreatureMesh } from './procedural/CreatureMesh';
import { CreatureInstance } from './creature.types';
import { usePlayerStore } from '../player/usePlayerStore';
import { useCreatureStore } from './useCreatureStore';
import { useJournalStore } from '../journal/useJournalStore';
import { captureSystem } from '../capture/CaptureSystem';

export function CreatureWorld() {
  const [creatures, setCreatures] = useState<CreatureInstance[]>([]);
  const targetedId = useCreatureStore((s) => s.targetedCreatureId);
  const setTargetedId = useCreatureStore((s) => s.setTargetedCreatureId);
  const discoverSpecies = useJournalStore((s) => s.discoverSpecies);

  useEffect(() => {
    setCreatures(creatureSpawner.getAll());
  }, []);

  useFrame((_, delta) => {
    const playerPos = usePlayerStore.getState().position;

    // Advance headless creature AI
    creatureSpawner.update(playerPos, delta);
    const all = creatureSpawner.getAll();
    setCreatures(all);

    // Filter out any creature currently trapped inside an active capture capsule
    const activeProj = captureSystem.getActiveProjectile();
    const trappedId = activeProj && activeProj.state !== 'FLYING' ? activeProj.targetCreatureId : null;

    // Auto-discover species when within 14m
    let closestId: string | null = null;
    let closestDist = 9.0; // max target selection range

    for (const c of all) {
      if (trappedId && c.instanceId === trappedId) continue;

      const dist = Math.sqrt(
        (c.position[0] - playerPos[0]) ** 2 + (c.position[2] - playerPos[2]) ** 2
      );

      // Journal discovery
      if (dist < 14.0) {
        discoverSpecies(c.speciesId);
      }

      // Proximity targeting
      if (dist < closestDist) {
        closestDist = dist;
        closestId = c.instanceId;
      }
    }

    if (closestId !== targetedId) {
      setTargetedId(closestId);
    }
  });

  const activeProj = captureSystem.getActiveProjectile();
  const trappedId = activeProj && activeProj.state !== 'FLYING' ? activeProj.targetCreatureId : null;
  const renderList = creatures.filter((c) => c.instanceId !== trappedId);

  return (
    <group>
      {renderList.map((c) => (
        <CreatureMesh
          key={c.instanceId}
          creature={c}
          isSelected={c.instanceId === targetedId}
        />
      ))}
    </group>
  );
}
