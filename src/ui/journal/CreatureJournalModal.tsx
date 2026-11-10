import { STARTER_SPECIES } from '@/game/content/creatures/speciesRegistry';
import { useJournalStore } from '@/game/journal/useJournalStore';

interface CreatureJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ELEMENT_COLORS: Record<string, string> = {
  Nature: '#22c55e',
  Fire: '#ef4444',
  Water: '#0ea5e9',
  Earth: '#b45309',
  Electric: '#eab308',
  Frost: '#38bdf8',
};

export function CreatureJournalModal({ isOpen, onClose }: CreatureJournalModalProps) {
  const seenSpecies = useJournalStore((s) => s.seenSpecies);

  if (!isOpen) return null;

  const speciesList = Object.values(STARTER_SPECIES);
  const discoveredCount = speciesList.filter((s) => seenSpecies.includes(s.speciesId)).length;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(10, 15, 26, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: '#f8fafc',
        fontFamily: 'sans-serif',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '85vh',
          background: '#0f172a',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#162032',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>📖</span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Creature Field Journal</h2>
            <span
              style={{
                fontSize: '12px',
                background: '#0369a1',
                padding: '2px 8px',
                borderRadius: '12px',
                color: '#e0f2fe',
                fontFamily: 'monospace',
              }}
            >
              {discoveredCount} / {speciesList.length} Discovered
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#334155',
              color: '#f8fafc',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ✕ Close [J]
          </button>
        </div>

        {/* Species Grid */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          {speciesList.map((species) => {
            const isDiscovered = seenSpecies.includes(species.speciesId);
            const elemColor = ELEMENT_COLORS[species.element] || '#38bdf8';

            if (!isDiscovered) {
              return (
                <div
                  key={species.speciesId}
                  style={{
                    background: '#131b2e',
                    border: '1px dashed #334155',
                    borderRadius: '12px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    minHeight: '200px',
                    opacity: 0.6,
                  }}
                >
                  <span style={{ fontSize: '32px', marginBottom: '8px' }}>❓</span>
                  <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#64748b' }}>
                    ??? (Unknown Species)
                  </span>
                  <span style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                    Habitat: {species.habitat}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={species.speciesId}
                style={{
                  background: '#131b2e',
                  border: `1px solid ${elemColor}55`,
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: `0 4px 12px rgba(0,0,0,0.3), 0 0 8px ${elemColor}15`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '17px', fontWeight: 'bold', color: '#f8fafc' }}>
                    {species.name}
                  </span>
                  <span
                    style={{
                      background: elemColor,
                      color: '#ffffff',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                    }}
                  >
                    {species.element}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.4 }}>
                  "{species.description}"
                </div>

                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  📍 Habitat: <span style={{ color: '#cbd5e1' }}>{species.habitat}</span>
                </div>

                {/* Base Stats Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '4px',
                    background: '#090d16',
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                  }}
                >
                  <div>
                    <div style={{ color: '#64748b' }}>HP</div>
                    <div style={{ color: '#22c55e', fontWeight: 'bold' }}>{species.baseStats.maxHealth}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b' }}>ATK</div>
                    <div style={{ color: '#ef4444', fontWeight: 'bold' }}>{species.baseStats.attack}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b' }}>DEF</div>
                    <div style={{ color: '#38bdf8', fontWeight: 'bold' }}>{species.baseStats.defense}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b' }}>SPD</div>
                    <div style={{ color: '#eab308', fontWeight: 'bold' }}>{species.baseStats.speed}</div>
                  </div>
                </div>

                {/* Signature Move */}
                <div
                  style={{
                    borderTop: '1px solid #1e293b',
                    paddingTop: '8px',
                    fontSize: '11px',
                  }}
                >
                  <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>
                    ⚡ {species.signatureAbility.name}
                  </span>
                  <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '2px' }}>
                    {species.signatureAbility.description} (Power: {species.signatureAbility.damage})
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
