import { useCreatureStore } from '@/game/creatures/useCreatureStore';
import { creatureSpawner } from '@/game/creatures/CreatureSpawner';
import { STARTER_SPECIES } from '@/game/content/creatures/speciesRegistry';
import { usePlayerStore } from '@/game/player/usePlayerStore';

const ELEMENT_COLORS: Record<string, string> = {
  Nature: '#22c55e',
  Fire: '#ef4444',
  Water: '#0ea5e9',
  Earth: '#b45309',
  Electric: '#eab308',
  Frost: '#38bdf8',
};

export function TargetHUD() {
  const targetedId = useCreatureStore((s) => s.targetedCreatureId);
  const playerPos = usePlayerStore((s) => s.position);

  if (!targetedId) return null;

  const creature = creatureSpawner.getById(targetedId);
  if (!creature) return null;

  const species = STARTER_SPECIES[creature.speciesId];
  if (!species) return null;

  const dist = Math.sqrt(
    (creature.position[0] - playerPos[0]) ** 2 + (creature.position[2] - playerPos[2]) ** 2
  ).toFixed(1);

  const hpPct = Math.max(0, Math.min(100, (creature.currentHealth / creature.maxHealth) * 100));
  const elemColor = ELEMENT_COLORS[species.element] || '#38bdf8';

  return (
    <div
      style={{
        position: 'absolute',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${elemColor}66`,
        borderRadius: '12px',
        padding: '10px 20px',
        color: '#f8fafc',
        fontFamily: 'monospace',
        pointerEvents: 'none',
        boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 12px ${elemColor}33`,
        minWidth: '240px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px', fontWeight: 'bold' }}>{species.name}</span>
          <span style={{ fontSize: '11px', background: '#334155', padding: '1px 5px', borderRadius: '4px' }}>
            Lv.{creature.level}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              background: elemColor,
              color: '#ffffff',
              padding: '1px 6px',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            {species.element}
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{dist}m</span>
        </div>
      </div>

      {/* HP Bar */}
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
            transition: 'width 0.15s ease',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '10px', color: '#64748b' }}>
        <span>Temperament: {species.temperament}</span>
        <span>State: {creature.aiState}</span>
      </div>
    </div>
  );
}
