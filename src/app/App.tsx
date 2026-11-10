import { useEffect, useState } from 'react';
import { GameCanvas } from '@/game/GameCanvas';
import { ErrorBoundary } from '@/app/ErrorBoundary';
import { GameLoop } from '@/game/core/GameLoop';
import { globalEventBus } from '@/game/core/EventBus';
import { soundFx } from '@/game/audio/AudioSynthesizer';

export function App() {
  const [ticks, setTicks] = useState(0);
  const [audioMuted, setAudioMuted] = useState(false);
  const [coreInteractions, setCoreInteractions] = useState(0);

  useEffect(() => {
    const loop = new GameLoop(60);

    // Register a headless simulation system
    const unregister = loop.registerSystem(() => {
      globalEventBus.emit('SIMULATION_TICK', { ticks: loop.getTicks() });
    });

    const unsub = globalEventBus.on<{ ticks: number }>('SIMULATION_TICK', (data) => {
      // Throttle UI update every 15 ticks for performance
      if (data.ticks % 15 === 0) {
        setTicks(data.ticks);
      }
    });

    loop.start();

    return () => {
      unregister();
      unsub();
      loop.stop();
    };
  }, []);

  const handleCoreClick = () => {
    soundFx.playUiClick();
    soundFx.playJump();
    setCoreInteractions((prev) => prev + 1);
  };

  const toggleAudio = () => {
    const nextMuted = !audioMuted;
    setAudioMuted(nextMuted);
    soundFx.setMuted(nextMuted);
    if (!nextMuted) {
      soundFx.playUiClick();
    }
  };

  return (
    <ErrorBoundary>
      <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        {/* 3D Scene Viewport */}
        <GameCanvas onCoreClick={handleCoreClick} />

        {/* Minimalist HUD Overlay */}
        <header
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
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
            <span style={{ fontSize: '11px', background: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
              Phase 0 Foundation
            </span>
          </div>

          <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', gap: '16px' }}>
            <span>Engine: 60Hz Headless Loop</span>
            <span>Sim Ticks: {ticks}</span>
          </div>
        </header>

        {/* Control & Test Panel */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '24px',
            padding: '8px 16px',
            color: '#e2e8f0',
            fontFamily: 'sans-serif',
            fontSize: '13px',
          }}
        >
          <button
            onClick={handleCoreClick}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              padding: '6px 14px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px',
            }}
          >
            Trigger Core Pulse ({coreInteractions})
          </button>

          <button
            onClick={toggleAudio}
            style={{
              background: audioMuted ? '#475569' : '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              padding: '6px 14px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px',
            }}
          >
            Audio: {audioMuted ? 'Muted' : 'Synthesizer Active'}
          </button>

          <span style={{ color: '#64748b', fontSize: '12px' }}>
            Rotate: Left Click Drag | Pan: Right Click Drag | Zoom: Scroll
          </span>
        </div>
      </div>
    </ErrorBoundary>
  );
}
