import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function StylizedSky() {
  const cloudsRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.015;
    }
  });

  // Procedural drifting fluffy clouds
  const clouds = [
    { pos: [20, 24, -15], scale: [8, 2.5, 5] },
    { pos: [-25, 26, 20], scale: [10, 3, 6] },
    { pos: [-15, 23, -30], scale: [7, 2.2, 4.5] },
    { pos: [30, 25, 25], scale: [9, 2.8, 5.5] },
    { pos: [0, 27, 35], scale: [11, 3.2, 6] },
  ];

  return (
    <group>
      {/* Sky dome hemisphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[85, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#38bdf8" side={THREE.BackSide} />
      </mesh>

      {/* Sun Light Source */}
      <directionalLight
        position={[40, 50, 30]}
        intensity={1.4}
        color="#fffbeb"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={0.5}
        shadow-camera-far={140}
        shadow-bias={-0.0005}
      />
      <ambientLight intensity={0.65} color="#e0f2fe" />
      <directionalLight position={[-30, 20, -30]} intensity={0.3} color="#93c5fd" />

      {/* Drifting Clouds Group */}
      <group ref={cloudsRef} position={[0, 0, 0]}>
        {clouds.map((c, idx) => (
          <mesh key={`cloud-${idx}`} position={c.pos as [number, number, number]} scale={c.scale as [number, number, number]}>
            <dodecahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color="#ffffff" roughness={0.9} emissive="#f8fafc" emissiveIntensity={0.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
