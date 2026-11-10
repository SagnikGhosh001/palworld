import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CreatureInstance } from '../creature.types';

interface CreatureMeshProps {
  creature: CreatureInstance;
  isSelected?: boolean;
}

export function CreatureMesh({ creature, isSelected }: CreatureMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const animTime = useRef(Math.random() * 10);
  const leftLimbRef = useRef<THREE.Mesh>(null);
  const rightLimbRef = useRef<THREE.Mesh>(null);
  const tailMeshRef = useRef<THREE.Mesh>(null);
  const tailGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Position & rotation update
    groupRef.current.position.set(creature.position[0], creature.position[1], creature.position[2]);
    groupRef.current.rotation.y = creature.rotationY;

    // Movement swing animation
    const speed = Math.sqrt(creature.velocity[0] ** 2 + creature.velocity[2] ** 2);
    const isMoving = speed > 0.2;

    if (isMoving) {
      animTime.current += delta * speed * 4;
      const swing = Math.sin(animTime.current) * 0.45;
      const tailWiggle = Math.sin(animTime.current * 1.5) * 0.35;
      if (leftLimbRef.current) leftLimbRef.current.rotation.x = swing;
      if (rightLimbRef.current) rightLimbRef.current.rotation.x = -swing;
      if (tailMeshRef.current) tailMeshRef.current.rotation.y = tailWiggle;
      if (tailGroupRef.current) tailGroupRef.current.rotation.y = tailWiggle;
    } else {
      // Idle breathing
      const breath = Math.sin(Date.now() * 0.003 + creature.level) * 0.04;
      groupRef.current.position.y = creature.position[1] + breath;
      const idleTail = Math.sin(Date.now() * 0.002) * 0.2;
      if (tailMeshRef.current) tailMeshRef.current.rotation.y = idleTail;
      if (tailGroupRef.current) tailGroupRef.current.rotation.y = idleTail;
    }
  });

  return (
    <group ref={groupRef} castShadow>
      {/* Selection ring under targeted creature */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[0.7, 0.85, 24]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Render species-specific compound geometry */}
      {creature.speciesId === 'mosskin' && (
        <group position={[0, 0.45, 0]}>
          {/* Mosskin Round Body */}
          <mesh castShadow>
            <sphereGeometry args={[0.42, 16, 16]} />
            <meshStandardMaterial color="#22c55e" roughness={0.7} />
          </mesh>
          {/* Pale Underbelly */}
          <mesh position={[0, -0.08, -0.2]}>
            <sphereGeometry args={[0.26, 12, 12]} />
            <meshStandardMaterial color="#fef08a" roughness={0.8} />
          </mesh>
          {/* Sprouting Head Leaf */}
          <mesh position={[0, 0.52, 0]} rotation={[0.2, 0, 0.2]} castShadow>
            <coneGeometry args={[0.16, 0.4, 6]} />
            <meshStandardMaterial color="#15803d" roughness={0.6} />
          </mesh>
          {/* Big Curious Eyes */}
          <mesh position={[-0.14, 0.12, -0.34]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.14, 0.12, -0.34]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          {/* Little Paws */}
          <mesh ref={leftLimbRef} position={[-0.22, -0.35, 0]} castShadow>
            <capsuleGeometry args={[0.08, 0.18, 4, 8]} />
            <meshStandardMaterial color="#16a34a" />
          </mesh>
          <mesh ref={rightLimbRef} position={[0.22, -0.35, 0]} castShadow>
            <capsuleGeometry args={[0.08, 0.18, 4, 8]} />
            <meshStandardMaterial color="#16a34a" />
          </mesh>
        </group>
      )}

      {creature.speciesId === 'cindercub' && (
        <group position={[0, 0.48, 0]}>
          {/* Cindercub Torso */}
          <mesh castShadow>
            <capsuleGeometry args={[0.3, 0.4, 8, 16]} />
            <meshStandardMaterial color="#ea580c" roughness={0.6} />
          </mesh>
          {/* Fiery Chest Tuft */}
          <mesh position={[0, 0.1, -0.22]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#facc15" emissive="#eab308" emissiveIntensity={0.6} />
          </mesh>
          {/* Pointed Fox Ears */}
          <mesh position={[-0.18, 0.42, 0]} rotation={[0, 0, 0.3]} castShadow>
            <coneGeometry args={[0.1, 0.28, 4]} />
            <meshStandardMaterial color="#c2410c" />
          </mesh>
          <mesh position={[0.18, 0.42, 0]} rotation={[0, 0, -0.3]} castShadow>
            <coneGeometry args={[0.1, 0.28, 4]} />
            <meshStandardMaterial color="#c2410c" />
          </mesh>
          {/* Flame Tail */}
          <mesh ref={tailMeshRef} position={[0, 0.15, 0.38]} rotation={[0.4, 0, 0]}>
            <coneGeometry args={[0.18, 0.55, 6]} />
            <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={0.8} />
          </mesh>
          {/* Limbs */}
          <mesh ref={leftLimbRef} position={[-0.2, -0.36, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.3, 6]} />
            <meshStandardMaterial color="#9a3412" />
          </mesh>
          <mesh ref={rightLimbRef} position={[0.2, -0.36, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.3, 6]} />
            <meshStandardMaterial color="#9a3412" />
          </mesh>
        </group>
      )}

      {creature.speciesId === 'pebblit' && (
        <group position={[0, 0.5, 0]}>
          {/* Pebblit Chunky Boulder Body */}
          <mesh castShadow>
            <dodecahedronGeometry args={[0.46, 0]} />
            <meshStandardMaterial color="#475569" roughness={0.9} />
          </mesh>
          {/* Mossy Cap */}
          <mesh position={[0, 0.28, 0]} castShadow>
            <dodecahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial color="#15803d" roughness={0.8} />
          </mesh>
          {/* Glowing Amber Eyes */}
          <mesh position={[-0.16, 0.1, -0.38]}>
            <sphereGeometry args={[0.06, 6, 6]} />
            <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={1.0} />
          </mesh>
          <mesh position={[0.16, 0.1, -0.38]}>
            <sphereGeometry args={[0.06, 6, 6]} />
            <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={1.0} />
          </mesh>
          {/* Rocky Fists */}
          <mesh ref={leftLimbRef} position={[-0.45, -0.1, 0]} castShadow>
            <boxGeometry args={[0.24, 0.24, 0.24]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>
          <mesh ref={rightLimbRef} position={[0.45, -0.1, 0]} castShadow>
            <boxGeometry args={[0.24, 0.24, 0.24]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>
        </group>
      )}

      {creature.speciesId === 'ripplefin' && (
        <group position={[0, 0.42, 0]}>
          {/* Aquatic Streamlined Body */}
          <mesh castShadow>
            <sphereGeometry args={[0.4, 16, 12]} />
            <meshStandardMaterial color="#06b6d4" roughness={0.2} metalness={0.3} />
          </mesh>
          {/* Translucent Dorsal Fin */}
          <mesh position={[0, 0.42, 0.05]} rotation={[-0.3, 0, 0]}>
            <coneGeometry args={[0.12, 0.4, 4]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.1} transparent opacity={0.8} />
          </mesh>
          {/* Leaping Dolphin-tail */}
          <mesh ref={tailMeshRef} position={[0, 0.05, 0.42]} rotation={[0.4, 0, 0]}>
            <coneGeometry args={[0.18, 0.45, 6]} />
            <meshStandardMaterial color="#0891b2" roughness={0.2} />
          </mesh>
          {/* Side Flutter Fins */}
          <mesh ref={leftLimbRef} position={[-0.36, 0, 0]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[0.25, 0.04, 0.18]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.85} />
          </mesh>
          <mesh ref={rightLimbRef} position={[0.36, 0, 0]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[0.25, 0.04, 0.18]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.85} />
          </mesh>
        </group>
      )}

      {creature.speciesId === 'voltkit' && (
        <group position={[0, 0.44, 0]}>
          {/* Voltkit Nimble Body */}
          <mesh castShadow>
            <sphereGeometry args={[0.36, 16, 16]} />
            <meshStandardMaterial color="#eab308" roughness={0.5} />
          </mesh>
          {/* Electric Cheek Nodes */}
          <mesh position={[-0.24, 0.04, -0.24]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0.24, 0.04, -0.24]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
          </mesh>
          {/* Lightning Tail */}
          <group ref={tailGroupRef} position={[0, 0.15, 0.35]}>
            <mesh position={[0, 0.15, 0]} rotation={[0.3, 0, 0.4]}>
              <boxGeometry args={[0.08, 0.35, 0.08]} />
              <meshStandardMaterial color="#facc15" emissive="#eab308" emissiveIntensity={1} />
            </mesh>
            <mesh position={[0.1, 0.4, 0]} rotation={[-0.2, 0, -0.5]}>
              <boxGeometry args={[0.08, 0.35, 0.08]} />
              <meshStandardMaterial color="#facc15" emissive="#eab308" emissiveIntensity={1} />
            </mesh>
          </group>
          {/* Paws */}
          <mesh ref={leftLimbRef} position={[-0.18, -0.32, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.24, 6]} />
            <meshStandardMaterial color="#ca8a04" />
          </mesh>
          <mesh ref={rightLimbRef} position={[0.18, -0.32, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.24, 6]} />
            <meshStandardMaterial color="#ca8a04" />
          </mesh>
        </group>
      )}

      {creature.speciesId === 'glimmerowl' && (
        <group position={[0, 0.52, 0]}>
          {/* Glimmerowl Frost Body */}
          <mesh castShadow>
            <sphereGeometry args={[0.38, 16, 16]} />
            <meshStandardMaterial color="#e0f2fe" roughness={0.6} />
          </mesh>
          {/* Glowing Golden Eyes */}
          <mesh position={[-0.14, 0.14, -0.32]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#fde047" emissive="#eab308" emissiveIntensity={0.9} />
          </mesh>
          <mesh position={[0.14, 0.14, -0.32]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#fde047" emissive="#eab308" emissiveIntensity={0.9} />
          </mesh>
          {/* Curved Beak */}
          <mesh position={[0, 0.05, -0.4]} rotation={[0.4, 0, 0]}>
            <coneGeometry args={[0.06, 0.16, 4]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          {/* Frost Wings */}
          <mesh ref={leftLimbRef} position={[-0.38, 0.05, 0]} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.12, 0.42, 0.32]} />
            <meshStandardMaterial color="#93c5fd" roughness={0.5} />
          </mesh>
          <mesh ref={rightLimbRef} position={[0.38, 0.05, 0]} rotation={[0, 0, -0.2]}>
            <boxGeometry args={[0.12, 0.42, 0.32]} />
            <meshStandardMaterial color="#93c5fd" roughness={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
}
