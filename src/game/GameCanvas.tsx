import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface SceneProps {
  onInteract?: () => void;
}

function FoundationScene({ onInteract }: SceneProps) {
  const crystalRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.8;
      crystalRef.current.position.y = 1.6 + Math.sin(Date.now() * 0.002) * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.4;
      ringRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-10, 10, -10]} intensity={0.4} color="#7aa2f7" />

      {/* Procedural Starter Pedestal */}
      <mesh position={[0, 0.4, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.6, 2.0, 0.8, 8]} />
        <meshStandardMaterial color="#2d3748" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Stylized Creature Core Crystal */}
      <mesh
        ref={crystalRef}
        position={[0, 1.6, 0]}
        castShadow
        onClick={onInteract}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <octahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.1}
          metalness={0.6}
          emissive="#0284c7"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Orbiting Energy Ring */}
      <mesh ref={ringRef} position={[0, 1.6, 0]}>
        <torusGeometry args={[1.2, 0.04, 16, 64]} />
        <meshStandardMaterial color="#a855f7" emissive="#9333ea" emissiveIntensity={0.8} />
      </mesh>

      {/* Ground Grid Floor */}
      <gridHelper args={[40, 40, '#475569', '#1e293b']} position={[0, 0.01, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>
    </>
  );
}

interface GameCanvasProps {
  onCoreClick?: () => void;
}

export function GameCanvas({ onCoreClick }: GameCanvasProps) {
  return (
    <Canvas
      shadows
      style={{ width: '100%', height: '100%', background: '#090d16' }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <PerspectiveCamera makeDefault position={[5, 4, 7]} fov={50} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
      <FoundationScene onInteract={onCoreClick} />
    </Canvas>
  );
}
