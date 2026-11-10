import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { ThirdPersonCamera } from './player/ThirdPersonCamera';
import { PlayerCharacter } from './player/PlayerCharacter';
import { usePlayerStore } from './player/usePlayerStore';
import { playerController } from './player/PlayerController';
import { inputManager } from './player/InputManager';

function EnvironmentProps() {
  // Landmarks and obstacles to give spatial perspective while exploring
  const props = [
    { pos: [8, 0.7, -6], scale: [1.8, 1.4, 2.0], color: '#64748b' },
    { pos: [-12, 1.0, 10], scale: [2.5, 2.0, 2.8], color: '#475569' },
    { pos: [14, 0.6, 12], scale: [1.5, 1.2, 1.6], color: '#64748b' },
    { pos: [-8, 0.5, -14], scale: [1.4, 1.0, 1.8], color: '#475569' },
    { pos: [0, 0.4, -20], scale: [3.2, 0.8, 3.0], color: '#334155' },
  ];

  return (
    <group>
      {/* Central ancient pedestal */}
      <mesh position={[0, 0.3, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.5, 3.0, 0.6, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* Decorative boulders / exploration landmarks */}
      {props.map((p, idx) => (
        <mesh key={idx} position={p.pos as [number, number, number]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={p.color} roughness={0.85} />
        </mesh>
      ))}

      {/* Stylized trees / nature markers */}
      {[
        [-10, 0, -8],
        [12, 0, -12],
        [-15, 0, 4],
        [10, 0, 6],
      ].map((pos, idx) => (
        <group key={`tree-${idx}`} position={pos as [number, number, number]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.35, 2.4, 6]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>
          <mesh position={[0, 3.0, 0]} castShadow>
            <coneGeometry args={[1.5, 2.8, 6]} />
            <meshStandardMaterial color="#15803d" roughness={0.7} />
          </mesh>
          <mesh position={[0, 4.4, 0]} castShadow>
            <coneGeometry args={[1.1, 2.0, 6]} />
            <meshStandardMaterial color="#16a34a" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const position = usePlayerStore((s) => s.position);
  const rotationY = usePlayerStore((s) => s.rotationY);
  const movementState = usePlayerStore((s) => s.movementState);

  useEffect(() => {
    if (containerRef.current) {
      inputManager.attachToElement(containerRef.current);
    }
    return () => {
      inputManager.detach();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: 'grab',
      }}
    >
      <Canvas
        shadows
        style={{ width: '100%', height: '100%', background: '#0a101d' }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[25, 40, 20]}
          intensity={1.3}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
        />
        <directionalLight position={[-20, 20, -20]} intensity={0.35} color="#93c5fd" />
        <fog attach="fog" args={['#0a101d', 30, 80]} />

        {/* Third-Person Camera Tracking Player */}
        <ThirdPersonCamera
          targetPosition={position}
          onYawChange={(yaw) => playerController.setCameraYaw(yaw)}
        />

        {/* 3D Player Adventurer Character */}
        <PlayerCharacter
          position={position}
          rotationY={rotationY}
          movementState={movementState}
        />

        {/* Explorable Ground Terrain with Grid */}
        <gridHelper args={[120, 60, '#38bdf8', '#1e293b']} position={[0, 0.01, 0]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#0f172a" roughness={0.92} />
        </mesh>

        <EnvironmentProps />
      </Canvas>
    </div>
  );
}
