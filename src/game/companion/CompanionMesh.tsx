import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { companionSystem } from './CompanionSystem';
import { useCompanionStore } from './useCompanionStore';
import { CreatureMesh } from '../creatures/procedural/CreatureMesh';
import { CreatureInstance } from '../creatures/creature.types';

export function CompanionMesh() {
  const isSummoned = useCompanionStore((s) => s.isSummoned);
  const haloRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((_, delta) => {
    const companion = companionSystem.getCompanion();
    if (!companion || !companion.isSummoned) return;

    if (haloRef.current) {
      haloRef.current.position.set(companion.position[0], companion.position[1] + 0.05, companion.position[2]);
      haloRef.current.rotation.z += delta * 1.5;
    }
    if (lightRef.current) {
      lightRef.current.position.set(companion.position[0], companion.position[1] + 0.8, companion.position[2]);
    }
  });

  if (!isSummoned) return null;

  const companion = companionSystem.getCompanion();
  if (!companion) return null;

  // Real-time dynamic adapter instance for procedural creature mesh
  const adapterInstance: CreatureInstance = {
    get instanceId() { return companion.ownedId; },
    get speciesId() { return companion.speciesId; },
    get level() { return companion.level; },
    get currentHealth() { return companion.currentHealth; },
    get maxHealth() { return companion.maxHealth; },
    get position() { return companion.position; },
    get velocity() { return companion.velocity; },
    get rotationY() { return companion.rotationY; },
    aiState: 'IDLE',
    targetPos: null,
    homeSpawnPos: companion.position,
    stateTimer: 2.0,
  };

  return (
    <group>
      {/* 3D Model */}
      <CreatureMesh creature={adapterInstance} isSelected={false} />

      {/* Allied Companion Glowing Halo Ring at feet */}
      <mesh
        ref={haloRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[companion.position[0], companion.position[1] + 0.05, companion.position[2]]}
      >
        <ringGeometry args={[0.55, 0.72, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.75} />
      </mesh>

      {/* Subtle Companion Ground Light */}
      <pointLight
        ref={lightRef}
        position={[companion.position[0], companion.position[1] + 0.8, companion.position[2]]}
        color="#38bdf8"
        intensity={0.6}
        distance={4.5}
      />
    </group>
  );
}
