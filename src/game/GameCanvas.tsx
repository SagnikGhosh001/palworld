import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { ThirdPersonCamera } from './player/ThirdPersonCamera';
import { PlayerCharacter } from './player/PlayerCharacter';
import { CreatureWorld } from './creatures/CreatureWorld';
import { CaptureProjectileMesh } from './capture/CaptureProjectileMesh';
import { inputManager } from './player/InputManager';
import { VerdantTerrain } from './world/terrain/VerdantTerrain';
import { VerdantLandmarks } from './world/landmarks/VerdantLandmarks';
import { StylizedSky } from './world/sky/StylizedSky';

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputManager.attach(containerRef.current || undefined);
    return () => {
      inputManager.detach();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: 'crosshair',
        outline: 'none',
      }}
    >
      <Canvas
        shadows
        style={{ width: '100%', height: '100%', background: '#38bdf8' }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        {/* Sky, Sun, Clouds & Lighting */}
        <StylizedSky />

        {/* Third-Person Camera Tracking Player */}
        <ThirdPersonCamera />

        {/* 3D Player Adventurer Character */}
        <PlayerCharacter />

        {/* Autonomous 3D Wild Creatures Cluster */}
        <CreatureWorld />

        {/* 3D Thrown Capture Projectile & Trapping Sequence */}
        <CaptureProjectileMesh />

        {/* Contoured Verdant Reach Meadow Terrain & Water */}
        <VerdantTerrain />

        {/* Ancient Waystone, Pine Grove, Crags, and Perimeter Cliffs */}
        <VerdantLandmarks />

        {/* Gentle atmospheric distance fog */}
        <fog attach="fog" args={['#bae6fd', 45, 95]} />
      </Canvas>
    </div>
  );
}
