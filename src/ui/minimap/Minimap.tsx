import { useEffect, useRef, useState } from 'react';
import { fogOfWar, FOG_GRID_SIZE } from '@/game/world/fog/FogOfWarSystem';
import { isWater } from '@/game/world/terrain/TerrainData';
import { usePlayerStore } from '@/game/player/usePlayerStore';

interface MinimapProps {
  playerYaw: number;
}

export function Minimap({ playerYaw }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [explorationPct, setExplorationPct] = useState(0);
  const [discoveredLandmarks, setDiscoveredLandmarks] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyM' || e.key === 'm' || e.key === 'M') {
        setIsExpanded((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const state = usePlayerStore.getState();
      const [px, , pz] = state.position;
      const rotationY = state.rotationY;

      // Update fog of war based on player position
      fogOfWar.update(px, pz);
      setExplorationPct(Math.round(fogOfWar.getExplorationPercentage()));
      const landmarks = fogOfWar.getDiscoveredLandmarks();
      setDiscoveredLandmarks(landmarks.map((l) => l.name));

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Clip circular radar
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, width / 2 - 2, 0, Math.PI * 2);
      ctx.clip();

      // Background void / shrouded fog
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Draw discovered fog cells
      const cellSize = width / FOG_GRID_SIZE;
      for (let gz = 0; gz < FOG_GRID_SIZE; gz++) {
        for (let gx = 0; gx < FOG_GRID_SIZE; gx++) {
          if (fogOfWar.isCellDiscovered(gx, gz)) {
            // Convert grid coords to world pos
            const wx = (gx / FOG_GRID_SIZE) * 120 - 60;
            const wz = (gz / FOG_GRID_SIZE) * 120 - 60;

            if (isWater(wx, wz)) {
              ctx.fillStyle = '#0284c7';
            } else {
              ctx.fillStyle = '#15803d';
            }
            ctx.fillRect(gx * cellSize, gz * cellSize, cellSize + 0.6, cellSize + 0.6);
          }
        }
      }

      // Draw discovered landmarks
      landmarks.forEach((landmark) => {
        const lx = ((landmark.position[0] + 60) / 120) * width;
        const lz = ((landmark.position[2] + 60) / 120) * height;

        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(landmark.icon, lx, lz);
      });

      // Draw player marker
      const pCanvasX = ((px + 60) / 120) * width;
      const pCanvasZ = ((pz + 60) / 120) * height;

      ctx.save();
      ctx.translate(pCanvasX, pCanvasZ);
      ctx.rotate(-rotationY); // Heading rotation

      // Player directional pointer arrow
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(4, 5);
      ctx.lineTo(0, 2);
      ctx.lineTo(-4, 5);
      ctx.closePath();
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.restore();

      ctx.restore(); // Restore clip

      // Compass Ring Border
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, width / 2 - 2, 0, Math.PI * 2);
      ctx.stroke();

      // Cardinal N marker
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('N', width / 2, 12);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [playerYaw]);

  const mapSize = isExpanded ? 280 : 160;

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '6px',
        pointerEvents: 'auto',
      }}
    >
      {/* Minimap radar canvas container */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        style={{
          width: `${mapSize}px`,
          height: `${mapSize}px`,
          borderRadius: '50%',
          boxShadow: '0 4px 20px rgba(0,0,0,0.6), 0 0 12px rgba(56, 189, 248, 0.3)',
          cursor: 'pointer',
          background: '#090d16',
          overflow: 'hidden',
          transition: 'width 0.2s ease, height 0.2s ease',
        }}
        title="Click or press 'M' to toggle map zoom"
      >
        <canvas
          ref={canvasRef}
          width={mapSize}
          height={mapSize}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>

      {/* Exploration statistics badge */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '12px',
          padding: '4px 10px',
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#e2e8f0',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <span style={{ color: '#38bdf8' }}>Verdant Reach</span>
        <span>•</span>
        <span style={{ color: '#4ade80' }}>{explorationPct}% Explored</span>
        <span style={{ color: '#94a3b8' }}>[M] Zoom</span>
      </div>

      {/* Discovered Landmarks Tracker */}
      {discoveredLandmarks.length > 0 && (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '8px',
            padding: '4px 8px',
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#94a3b8',
            maxWidth: '180px',
            textAlign: 'right',
          }}
        >
          {discoveredLandmarks.map((name) => (
            <div key={name} style={{ color: '#38bdf8' }}>
              📍 {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
