import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { captureSystem } from './CaptureSystem';
import { CAPTURE_DEVICES } from './CaptureFormula';

export function CaptureProjectileMesh() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const proj = captureSystem.getActiveProjectile();
    if (!proj || !meshRef.current) return;

    meshRef.current.position.set(proj.currentPos[0], proj.currentPos[1], proj.currentPos[2]);

    if (proj.state === 'FLYING') {
      meshRef.current.rotation.x += delta * 12;
      meshRef.current.rotation.y += delta * 8;
    } else if (proj.state.startsWith('SHAKING')) {
      // Periodic wobble shake
      const wobble = Math.sin(Date.now() * 0.02) * 0.45;
      meshRef.current.rotation.z = wobble;
      meshRef.current.rotation.x = 0;
    }
  });

  const proj = captureSystem.getActiveProjectile();
  if (!proj) return null;

  const device = CAPTURE_DEVICES[proj.deviceTier] || CAPTURE_DEVICES.basic;

  return (
    <group ref={meshRef}>
      {/* Top Half of Capsule */}
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.22, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={device.color} roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Bottom Half of Capsule */}
      <mesh position={[0, -0.05, 0]}>
        <sphereGeometry args={[0.22, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Middle Belt Ring */}
      <mesh>
        <cylinderGeometry args={[0.23, 0.23, 0.06, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Glowing Center Latch Button */}
      <mesh position={[0, 0, 0.2]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial
          color={proj.state === 'SUCCESS' ? '#facc15' : device.glowColor}
          emissive={proj.state === 'SUCCESS' ? '#f59e0b' : device.glowColor}
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Dynamic Glow Point Light */}
      <pointLight color={device.glowColor} intensity={0.9} distance={4} />
    </group>
  );
}
