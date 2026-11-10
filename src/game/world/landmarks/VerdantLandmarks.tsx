import { getTerrainHeight } from '../terrain/TerrainData';

export function VerdantLandmarks() {
  // Perimeter boundary cliff rocks
  const boundaryRocks: Array<[number, number, number, number]> = [];
  const numBoundaryRocks = 28;
  for (let i = 0; i < numBoundaryRocks; i++) {
    const angle = (i / numBoundaryRocks) * Math.PI * 2;
    const dist = 52 + (i % 3) * 2;
    const x = Math.sin(angle) * dist;
    const z = Math.cos(angle) * dist;
    const y = getTerrainHeight(x, z);
    boundaryRocks.push([x, y, z, 3.5 + (i % 4) * 0.8]);
  }

  // Pine grove trees around [-25, -18]
  const groveTrees: Array<[number, number, number]> = [
    [-25, 0, -18],
    [-28, 0, -15],
    [-22, 0, -21],
    [-20, 0, -16],
    [-27, 0, -23],
    [-31, 0, -19],
    [-24, 0, -26],
  ];

  // Stepping stones around pond [-18, 24]
  const pondStones: Array<[number, number, number]> = [
    [-18, 0, 14],
    [-12, 0, 20],
    [-14, 0, 28],
    [-24, 0, 22],
    [-20, 0, 31],
  ];

  return (
    <group>
      {/* 1. Ancient Waystone (Central Spawn & Landmark) */}
      <group position={[0, getTerrainHeight(0, 0), 0]}>
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[3.2, 3.8, 0.4, 12]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.8, 2.2, 6]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>
        <mesh position={[0, 2.5, 0]}>
          <octahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
        </mesh>
        <pointLight position={[0, 2.5, 0]} color="#38bdf8" intensity={0.8} distance={8} />
      </group>

      {/* 2. Elder Pine Grove */}
      {groveTrees.map(([x, , z], idx) => {
        const y = getTerrainHeight(x, z);
        const scale = 1 + (idx % 3) * 0.25;
        return (
          <group key={`grove-${idx}`} position={[x, y, z]} scale={[scale, scale, scale]}>
            <mesh position={[0, 1.4, 0]} castShadow>
              <cylinderGeometry args={[0.25, 0.45, 2.8, 6]} />
              <meshStandardMaterial color="#57361a" roughness={0.9} />
            </mesh>
            <mesh position={[0, 3.4, 0]} castShadow>
              <coneGeometry args={[1.8, 2.8, 6]} />
              <meshStandardMaterial color="#14532d" roughness={0.75} />
            </mesh>
            <mesh position={[0, 4.8, 0]} castShadow>
              <coneGeometry args={[1.3, 2.2, 6]} />
              <meshStandardMaterial color="#166534" roughness={0.75} />
            </mesh>
          </group>
        );
      })}

      {/* 3. Stepping Stones around Tranquil Pond */}
      {pondStones.map(([x, , z], idx) => {
        const y = getTerrainHeight(x, z);
        return (
          <mesh key={`pond-stone-${idx}`} position={[x, y + 0.15, z]} castShadow receiveShadow>
            <cylinderGeometry args={[0.8, 1.0, 0.35, 7]} />
            <meshStandardMaterial color="#64748b" roughness={0.9} />
          </mesh>
        );
      })}

      {/* 4. Whispering Ridge Crag Slate Shelves */}
      <group position={[28, getTerrainHeight(28, -22), -22]}>
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[6, 1.6, 5]} />
          <meshStandardMaterial color="#334155" roughness={0.9} />
        </mesh>
        <mesh position={[1.5, 1.8, 0.5]} castShadow receiveShadow>
          <boxGeometry args={[4, 1.2, 3.5]} />
          <meshStandardMaterial color="#475569" roughness={0.85} />
        </mesh>
        <mesh position={[2.2, 2.8, 0.8]} castShadow>
          <dodecahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial color="#64748b" roughness={0.8} />
        </mesh>
      </group>

      {/* 5. Perimeter Mountain Wall / Boundary Enclosure */}
      {boundaryRocks.map(([x, y, z, scale], idx) => (
        <mesh
          key={`boundary-${idx}`}
          position={[x, y + scale * 0.4, z]}
          rotation={[0, idx * 0.3, 0]}
          scale={[scale * 1.3, scale * 1.6, scale * 1.2]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#1e293b" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}
