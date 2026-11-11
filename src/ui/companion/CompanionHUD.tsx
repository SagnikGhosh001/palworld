import { useCompanionStore } from '@/game/companion/useCompanionStore';
import { companionSystem } from '@/game/companion/CompanionSystem';

const ELEMENT_COLORS: Record<string, string> = {
  Nature: '#22c55e',
  Fire: '#ef4444',
  Water: '#0ea5e9',
  Earth: '#b45309',
  Electric: '#eab308',
  Frost: '#38bdf8',
};

export function CompanionHUD() {
  const isSummoned = useCompanionStore((s) => s.isSummoned);
  const companion = useCompanionStore((s) => s.companionData);
  const activeCommand = useCompanionStore((s) => s.activeCommand);

  if (!isSummoned || !companion) return null;

  const elemColor = ELEMENT_COLORS[companion.element] || '#38bdf8';
  const hpPct = Math.round((companion.currentHealth / companion.maxHealth) * 100);

  return (
    <div
      style={{
        position: 'absolute',
        top: 80,
        left: 16,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${elemColor}88`,
        borderRadius: '12px',
        padding: '10px 16px',
        color: '#f8fafc',
        fontFamily: 'monospace',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        boxShadow: `0 4px 16px rgba(0,0,0,0.5), 0 0 10px ${elemColor}33`,
        minWidth: '200px',
        pointerEvents: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{companion.nickname}</span>
          <span style={{ fontSize: '10px', background: '#334155', padding: '1px 4px', borderRadius: '4px' }}>
            Lv.{companion.level}
          </span>
        </div>
        <span
          style={{
            fontSize: '10px',
            background: elemColor,
            color: '#fff',
            padding: '1px 6px',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          {companion.element}
        </span>
      </div>

      {/* Companion HP bar */}
      <div
        style={{
          width: '100%',
          height: '6px',
          background: '#1e293b',
          borderRadius: '3px',
          overflow: 'hidden',
          marginTop: '2px',
        }}
      >
        <div
          style={{
            width: `${hpPct}%`,
            height: '100%',
            background: hpPct < 30 ? '#ef4444' : '#10b981',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', fontSize: '11px' }}>
        <span style={{ color: '#38bdf8' }}>Order: <strong>{activeCommand}</strong></span>
        <button
          onClick={() => companionSystem.recallCompanion()}
          style={{
            background: '#334155',
            color: '#f8fafc',
            border: 'none',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '10px',
            cursor: 'pointer',
          }}
        >
          [F] Recall
        </button>
      </div>
    </div>
  );
}
