import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStore } from './usePlayerStore';

export function PlayerCharacter() {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Group>(null);

  const animTime = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Read directly from store without forcing React component re-renders
    const state = usePlayerStore.getState();
    const position = state.position;
    const rotationY = state.rotationY;
    const movementState = state.movementState;

    // Smooth position and rotation
    groupRef.current.position.set(position[0], position[1], position[2]);
    groupRef.current.rotation.y = rotationY;

    const isMoving = movementState === 'WALKING' || movementState === 'SPRINTING';
    const isSprinting = movementState === 'SPRINTING';
    const animSpeed = isSprinting ? 14 : 9;

    if (isMoving) {
      animTime.current += delta * animSpeed;
      const legSwing = Math.sin(animTime.current) * (isSprinting ? 0.7 : 0.45);
      const armSwing = Math.cos(animTime.current) * (isSprinting ? 0.6 : 0.35);

      if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -armSwing;
      if (rightArmRef.current) rightArmRef.current.rotation.x = armSwing;

      // Small vertical bobbing
      if (bodyRef.current) {
        bodyRef.current.position.y = 0.9 + Math.abs(Math.sin(animTime.current * 2)) * 0.08;
      }
    } else if (movementState === 'JUMPING' || movementState === 'FALLING') {
      // Jump pose
      if (leftLegRef.current) leftLegRef.current.rotation.x = -0.3;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0.4;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.6;
      if (bodyRef.current) bodyRef.current.position.y = 0.95;
    } else {
      // Idle breathing
      const breath = Math.sin(Date.now() * 0.003) * 0.02;
      if (bodyRef.current) bodyRef.current.position.y = 0.9 + breath;
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
    }
  });

  return (
    <group ref={groupRef} castShadow>
      {/* Root body container (for bobbing & breathing) */}
      <group ref={bodyRef} position={[0, 0.9, 0]}>
        {/* Torso / Explorer Tunic */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <capsuleGeometry args={[0.3, 0.4, 8, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.6} />
        </mesh>

        {/* Belt */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.1, 16]} />
          <meshStandardMaterial color="#854d0e" roughness={0.8} />
        </mesh>

        {/* Explorer Backpack */}
        <mesh position={[0, 0.22, 0.26]} castShadow>
          <boxGeometry args={[0.38, 0.42, 0.22]} />
          <meshStandardMaterial color="#b45309" roughness={0.7} />
        </mesh>
        {/* Bedroll on top of backpack */}
        <mesh position={[0, 0.47, 0.25]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.42, 8]} />
          <meshStandardMaterial color="#4ade80" roughness={0.9} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.65, 0]} castShadow>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.5} />
        </mesh>

        {/* Explorer Hat */}
        <mesh position={[0, 0.82, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.42, 0.1, 16]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.26, 0.14, 16]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>

        {/* Facing Visor / Goggles */}
        <mesh position={[0, 0.68, -0.22]}>
          <boxGeometry args={[0.32, 0.1, 0.1]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.7} emissive="#0284c7" emissiveIntensity={0.6} />
        </mesh>

        {/* Left Arm */}
        <mesh ref={leftArmRef} position={[-0.42, 0.25, 0]} castShadow>
          <capsuleGeometry args={[0.09, 0.35, 6, 8]} />
          <meshStandardMaterial color="#0369a1" roughness={0.7} />
        </mesh>

        {/* Right Arm */}
        <mesh ref={rightArmRef} position={[0.42, 0.25, 0]} castShadow>
          <capsuleGeometry args={[0.09, 0.35, 6, 8]} />
          <meshStandardMaterial color="#0369a1" roughness={0.7} />
        </mesh>
      </group>

      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.18, 0.45, 0]} castShadow>
        <capsuleGeometry args={[0.11, 0.42, 6, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.18, 0.45, 0]} castShadow>
        <capsuleGeometry args={[0.11, 0.42, 6, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* Shadow contact ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.1, 0.45, 16]} />
        <meshBasicMaterial color="#000000" opacity={0.3} transparent />
      </mesh>
    </group>
  );
}
