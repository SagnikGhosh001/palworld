import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getTerrainHeight, WATER_LEVEL } from './TerrainData';

export function VerdantTerrain() {
  const waterRef = useRef<THREE.Mesh>(null);

  // Generate contoured terrain geometry with vertex colors based on elevation
  const { geometry } = useMemo(() => {
    const size = 130;
    const segments = 100;
    const geom = new THREE.PlaneGeometry(size, size, segments, segments);
    geom.rotateX(-Math.PI / 2);

    const positions = geom.attributes.position;
    const colors: number[] = [];

    const sandColor = new THREE.Color('#d4c29a');
    const grassColor = new THREE.Color('#22c55e');
    const darkGrass = new THREE.Color('#15803d');
    const rockColor = new THREE.Color('#475569');
    const pondBedColor = new THREE.Color('#64748b');

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const y = getTerrainHeight(x, z);
      positions.setY(i, y);

      // Vertex color gradient by elevation
      const vertexColor = new THREE.Color();
      if (y < -0.3) {
        vertexColor.copy(pondBedColor);
      } else if (y < 0.3) {
        const t = (y + 0.3) / 0.6;
        vertexColor.lerpColors(sandColor, grassColor, t);
      } else if (y < 2.5) {
        const t = (y - 0.3) / 2.2;
        vertexColor.lerpColors(grassColor, darkGrass, t);
      } else {
        const t = Math.min(1, (y - 2.5) / 3.0);
        vertexColor.lerpColors(darkGrass, rockColor, t);
      }

      colors.push(vertexColor.r, vertexColor.g, vertexColor.b);
    }

    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.computeVertexNormals();

    return { geometry: geom };
  }, []);

  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.position.y = WATER_LEVEL + Math.sin(state.clock.elapsedTime * 1.5) * 0.04;
    }
  });

  return (
    <group>
      {/* Contoured Meadow Terrain */}
      <mesh geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.88}
          metalness={0.05}
          flatShading={false}
        />
      </mesh>

      {/* Shimmering Pond Water Surface */}
      <mesh
        ref={waterRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-18, WATER_LEVEL, 24]}
      >
        <circleGeometry args={[13, 32]} />
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.1}
          metalness={0.4}
          transparent
          opacity={0.75}
        />
      </mesh>

      {/* Gentle Submerged Water Glow */}
      <pointLight position={[-18, 0.5, 24]} intensity={0.4} color="#38bdf8" distance={15} />
    </group>
  );
}
