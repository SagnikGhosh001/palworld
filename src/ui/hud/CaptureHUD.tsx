import { useEffect } from 'react';
import { useCreatureStore } from '@/game/creatures/useCreatureStore';
import { creatureSpawner } from '@/game/creatures/CreatureSpawner';
import { usePartyStore } from '@/game/capture/usePartyStore';
import { CaptureFormula, CAPTURE_DEVICES } from '@/game/capture/CaptureFormula';
import { captureSystem } from '@/game/capture/CaptureSystem';
import { usePlayerStore } from '@/game/player/usePlayerStore';
import { CaptureDeviceTier } from '@/game/capture/capture.types';

export function CaptureHUD() {
  const targetedId = useCreatureStore((s) => s.targetedCreatureId);
  const selectedTier = usePartyStore((s) => s.selectedDeviceTier);
  const setSelectedTier = usePartyStore((s) => s.setSelectedDeviceTier);
  const inventory = usePartyStore((s) => s.capsuleInventory);
  const playerPos = usePlayerStore((s) => s.position);

  // Handle R to throw, and 1, 2, 3 to switch capsule tiers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyR' || e.key === 'r' || e.key === 'R') {
        if (targetedId) {
          captureSystem.throwCapsule(playerPos, targetedId, selectedTier);
        }
      } else if (e.code === 'Digit1' || e.key === '1') {
        setSelectedTier('basic');
      } else if (e.code === 'Digit2' || e.key === '2') {
        setSelectedTier('reinforced');
      } else if (e.code === 'Digit3' || e.key === '3') {
        setSelectedTier('advanced');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [targetedId, selectedTier, playerPos, setSelectedTier]);

  if (!targetedId) return null;

  const creature = creatureSpawner.getById(targetedId);
  if (!creature) return null;

  const catchChance = Math.round(CaptureFormula.calculateCatchChance(creature, selectedTier) * 100);
  const count = inventory[selectedTier] || 0;
  const currentDevice = CAPTURE_DEVICES[selectedTier];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${currentDevice.color}88`,
        borderRadius: '16px',
        padding: '8px 20px',
        color: '#f8fafc',
        fontFamily: 'sans-serif',
        pointerEvents: 'auto',
        boxShadow: `0 4px 16px rgba(0,0,0,0.6), 0 0 10px ${currentDevice.glowColor}44`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px' }}>
        {/* Tier selection tabs */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['basic', 'reinforced', 'advanced'] as CaptureDeviceTier[]).map((t, idx) => {
            const dev = CAPTURE_DEVICES[t];
            const isSelected = t === selectedTier;
            return (
              <button
                key={t}
                onClick={() => setSelectedTier(t)}
                style={{
                  background: isSelected ? dev.color : '#1e293b',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  border: isSelected ? `1px solid #ffffff` : '1px solid #334155',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 'bold' : 'normal',
                }}
              >
                [{idx + 1}] {dev.name.split(' ')[0]} ({inventory[t]})
              </button>
            );
          })}
        </div>

        {/* Catch chance indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Catch Chance:</span>
          <span
            style={{
              color: catchChance > 60 ? '#4ade80' : catchChance > 35 ? '#facc15' : '#ef4444',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              fontSize: '15px',
            }}
          >
            {catchChance}%
          </span>
        </div>

        {/* Throw action button */}
        <button
          onClick={() => captureSystem.throwCapsule(playerPos, targetedId, selectedTier)}
          disabled={count <= 0}
          style={{
            background: count > 0 ? currentDevice.color : '#475569',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '5px 14px',
            cursor: count > 0 ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
            fontSize: '12px',
          }}
        >
          {count > 0 ? 'Throw Capsule [R]' : 'No Capsules'}
        </button>
      </div>
    </div>
  );
}
