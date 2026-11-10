import { useEffect, useState } from 'react';
import { GameCanvas } from '@/game/GameCanvas';
import { ErrorBoundary } from '@/app/ErrorBoundary';
import { GameLoop } from '@/game/core/GameLoop';
import { playerController } from '@/game/player/PlayerController';
import { usePlayerStore } from '@/game/player/usePlayerStore';
import { soundFx } from '@/game/audio/AudioSynthesizer';
import { MovementState } from '@/game/player/player.types';

export function App() {
  const [audioMuted, setAudioMuted] = useState(false);
  const [hudState, setHudState] = useState<{
    pos: [number, number, number];
    speed: string;
    state: MovementState;
    staminaPct: number;
  }>({
    pos: [0, 0, 0],
    speed: '0.0',
    state: 'IDLE',
    staminaPct: 100,
  });

  const resetPosition = usePlayerStore((s) => s.resetPosition);

  useEffect(() => {
    const loop = new GameLoop(60);
    const unregisterPlayer = playerController.registerWithLoop(loop);

    // Register a throttled HUD updater in the game loop (~15Hz UI update, saves CPU & avoids React thrashing)
    let frameCount = 0;
    const unregisterHud = loop.registerSystem(() => {
      frameCount++;
      if (frameCount % 4 === 0) {
        const s = usePlayerStore.getState();
        const spd = Math.sqrt(s.velocity[0] ** 2 + s.velocity[2] ** 2).toFixed(1);
        const pct = Math.max(0, Math.min(100, (s.stats.currentStamina / s.stats.maxStamina) * 100));

        setHudState({
          pos: [
            parseFloat(s.position[0].toFixed(1)),
            parseFloat(s.position[1].toFixed(1)),
            parseFloat(s.position[2].toFixed(1)),
          ],
          speed: spd,
          state: s.movementState,
          staminaPct: pct,
        });
      }
    });

    loop.start();

    return () => {
      unregisterPlayer();
      unregisterHud();
      loop.stop();
    };
  }, []);

  const toggleAudio = () => {
    const nextMuted = !audioMuted;
    setAudioMuted(nextMuted);
    soundFx.setMuted(nextMuted);
    if (!nextMuted) {
      soundFx.playUiClick();
    }
  };

  const stateColors: Record<string, string> = {
    IDLE: '#94a3b8',
    WALKING: '#38bdf8',
    SPRINTING: '#eab308',
    JUMPING: '#a855f7',
    FALLING: '#f97316',
  };

  return (
    <ErrorBoundary>
      <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        {/* 3D Viewport */}
        <GameCanvas />

        {/* Top-Left Header & Diagnostics */}
        <header
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '8px',
            padding: '12px 18px',
            color: '#e2e8f0',
            fontFamily: 'monospace',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
            <h1 style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.05em', color: '#f8fafc', margin: 0 }}>
              CREATUREBOUND
            </h1>
            <span style={{ fontSize: '11px', background: '#0284c7', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
              Phase 1 Movement Active
            </span>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
            <span>
              Pos: [{hudState.pos[0].toFixed(1)}, {hudState.pos[1].toFixed(1)}, {hudState.pos[2].toFixed(1)}]
            </span>
            <span>Speed: {hudState.speed} m/s</span>
            <span style={{ color: stateColors[hudState.state] || '#e2e8f0', fontWeight: 'bold' }}>
              {hudState.state}
            </span>
          </div>
        </header>

        {/* Bottom-Center Player Status HUD (Stamina Bar & Keybinds) */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'auto',
          }}
        >
          {/* Stamina Meter */}
          <div
            style={{
              width: '260px',
              height: '10px',
              background: 'rgba(15, 23, 42, 0.9)',
              borderRadius: '6px',
              border: '1px solid rgba(234, 179, 8, 0.4)',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            <div
              style={{
                width: `${hudState.staminaPct}%`,
                height: '100%',
                background: hudState.staminaPct < 20 ? '#ef4444' : 'linear-gradient(90deg, #eab308, #f59e0b)',
                transition: 'width 0.08s linear',
              }}
            />
          </div>

          {/* Controls Reminder Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '24px',
              padding: '6px 16px',
              color: '#cbd5e1',
              fontFamily: 'sans-serif',
              fontSize: '12px',
            }}
          >
            <span><strong>WASD</strong> Move</span>
            <span>•</span>
            <span><strong>Shift</strong> Sprint</span>
            <span>•</span>
            <span><strong>Space</strong> Jump</span>
            <span>•</span>
            <span><strong>Click & Drag</strong> Look</span>
            <span>•</span>
            <button
              onClick={resetPosition}
              style={{
                background: '#334155',
                color: '#f8fafc',
                border: 'none',
                borderRadius: '12px',
                padding: '3px 8px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              Reset Pos
            </button>
            <button
              onClick={toggleAudio}
              style={{
                background: audioMuted ? '#475569' : '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '3px 8px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              Audio: {audioMuted ? 'Muted' : 'On'}
            </button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
