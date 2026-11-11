import { usePartyStore, MAX_PARTY_SIZE } from '@/game/capture/usePartyStore';
import { useCompanionStore } from '@/game/companion/useCompanionStore';
import { companionSystem } from '@/game/companion/CompanionSystem';
import { usePlayerStore } from '@/game/player/usePlayerStore';

interface PartyHUDProps {
  onOpenManagement: () => void;
}

const ELEMENT_COLORS: Record<string, string> = {
  Nature: '#22c55e',
  Fire: '#ef4444',
  Water: '#0ea5e9',
  Earth: '#b45309',
  Electric: '#eab308',
  Frost: '#38bdf8',
};

export function PartyHUD({ onOpenManagement }: PartyHUDProps) {
  const activeParty = usePartyStore((s) => s.activeParty);
  const isSummoned = useCompanionStore((s) => s.isSummoned);

  const handleSlotClick = (idx: number) => {
    if (idx === 0) {
      const p = usePlayerStore.getState();
      companionSystem.toggleSummon(p.position, p.rotationY);
    } else {
      onOpenManagement();
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        pointerEvents: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', fontFamily: 'monospace' }}>
          PARTY ({activeParty.length}/{MAX_PARTY_SIZE})
        </span>
        <button
          onClick={onOpenManagement}
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#38bdf8',
            fontSize: '10px',
            padding: '2px 6px',
            cursor: 'pointer',
          }}
        >
          Manage [Tab]
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {Array.from({ length: MAX_PARTY_SIZE }).map((_, idx) => {
          const companion = activeParty[idx];

          if (!companion) {
            return (
              <div
                key={`empty-slot-${idx}`}
                style={{
                  width: '180px',
                  height: '28px',
                  borderRadius: '6px',
                  border: '1px dashed #334155',
                  background: 'rgba(15, 23, 42, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 8px',
                  fontSize: '11px',
                  color: '#475569',
                  fontFamily: 'monospace',
                }}
              >
                Slot {idx + 1} Empty
              </div>
            );
          }

          const elemColor = ELEMENT_COLORS[companion.element] || '#38bdf8';
          const hpPct = Math.round((companion.currentHealth / companion.maxHealth) * 100);
          const isLead = idx === 0;

          return (
            <div
              key={companion.id}
              onClick={() => handleSlotClick(idx)}
              title={isLead ? 'Click to Summon / Recall [F]' : 'Click to Manage Party [Tab]'}
              style={{
                width: '190px',
                background: isLead && isSummoned ? 'rgba(14, 116, 144, 0.35)' : 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(8px)',
                border: isLead && isSummoned ? `1px solid #38bdf8` : `1px solid ${elemColor}66`,
                borderRadius: '8px',
                padding: '4px 8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                cursor: 'pointer',
                transition: 'border 0.15s, background 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f8fafc' }}>
                    {companion.nickname}
                  </span>
                  {isLead && (
                    <span
                      style={{
                        fontSize: '9px',
                        background: isSummoned ? '#0284c7' : '#334155',
                        color: isSummoned ? '#ffffff' : '#94a3b8',
                        padding: '0px 4px',
                        borderRadius: '3px',
                      }}
                    >
                      {isSummoned ? 'Active [F]' : '[F]'}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    color: '#ffffff',
                    background: elemColor,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                  }}
                >
                  Lv.{companion.level}
                </span>
              </div>

              {/* Mini HP bar */}
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  background: '#1e293b',
                  borderRadius: '2px',
                  overflow: 'hidden',
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
