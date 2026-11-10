import { useState } from 'react';
import { usePartyStore, MAX_PARTY_SIZE } from '@/game/capture/usePartyStore';
import { OwnedCreature } from '@/game/capture/capture.types';

interface PartyManagementModalProps {
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

export function PartyManagementModal({ isOpen, onClose }: PartyManagementModalProps) {
  const activeParty = usePartyStore((s) => s.activeParty);
  const storageBox = usePartyStore((s) => s.storageBox);
  const moveToParty = usePartyStore((s) => s.moveToParty);
  const moveToStorage = usePartyStore((s) => s.moveToStorage);
  const setNickname = usePartyStore((s) => s.setNickname);
  const releaseCreature = usePartyStore((s) => s.releaseCreature);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [nicknameInput, setNicknameInput] = useState('');

  if (!isOpen) return null;

  const handleStartRename = (creature: OwnedCreature) => {
    setRenamingId(creature.id);
    setNicknameInput(creature.nickname);
  };

  const handleSaveRename = (creatureId: string) => {
    if (nicknameInput.trim()) {
      setNickname(creatureId, nicknameInput.trim());
    }
    setRenamingId(null);
  };

  const renderCreatureCard = (creature: OwnedCreature, isParty: boolean) => {
    const elemColor = ELEMENT_COLORS[creature.element] || '#38bdf8';
    const isRenaming = renamingId === creature.id;

    return (
      <div
        key={creature.id}
        style={{
          background: '#131b2e',
          border: `1px solid ${elemColor}66`,
          borderRadius: '10px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {isRenaming ? (
            <div style={{ display: 'flex', gap: '4px' }}>
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                maxLength={16}
                style={{
                  background: '#090d16',
                  color: '#ffffff',
                  border: '1px solid #38bdf8',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '12px',
                  width: '100px',
                }}
              />
              <button
                onClick={() => handleSaveRename(creature.id)}
                style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 6px' }}
              >
                ✓
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#f8fafc' }}>
                {creature.nickname}
              </span>
              <button
                onClick={() => handleStartRename(creature)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '11px' }}
                title="Rename nickname"
              >
                ✏️
              </button>
            </div>
          )}

          <span
            style={{
              background: elemColor,
              color: '#ffffff',
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            {creature.element} Lv.{creature.level}
          </span>
        </div>

        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
          Species: <span style={{ color: '#cbd5e1' }}>{creature.name}</span> | HP: {creature.currentHealth}/{creature.maxHealth}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', marginTop: '4px' }}>
          {isParty ? (
            <button
              onClick={() => moveToStorage(creature.id)}
              style={{
                flex: 1,
                background: '#334155',
                color: '#f8fafc',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              Move to Storage 📦
            </button>
          ) : (
            <button
              onClick={() => moveToParty(creature.id)}
              disabled={activeParty.length >= MAX_PARTY_SIZE}
              style={{
                flex: 1,
                background: activeParty.length < MAX_PARTY_SIZE ? '#0284c7' : '#475569',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                cursor: activeParty.length < MAX_PARTY_SIZE ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
              }}
            >
              {activeParty.length < MAX_PARTY_SIZE ? 'Add to Party ⚔️' : 'Party Full'}
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm(`Release ${creature.nickname} into the wild?`)) {
                releaseCreature(creature.id);
              }
            }}
            style={{
              background: '#7f1d1d',
              color: '#fecaca',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
            title="Release to wild"
          >
            Release
          </button>
        </div>
      </div>
    );
  };

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
            <span style={{ fontSize: '20px' }}>⚔️</span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Pal Party & Storage Box</h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Active Party: {activeParty.length}/{MAX_PARTY_SIZE} | Stored: {storageBox.length}
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
            ✕ Close [Tab]
          </button>
        </div>

        {/* Content Body: Two Columns */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
          }}
        >
          {/* Left Column: Active Battle Party */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
              Active Battle Party ({activeParty.length}/{MAX_PARTY_SIZE})
            </div>

            {activeParty.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '13px', fontStyle: 'italic', padding: '16px 0' }}>
                No active companions in party. Catch wild creatures with [R]!
              </div>
            ) : (
              activeParty.map((c) => renderCreatureCard(c, true))
            )}
          </div>

          {/* Right Column: Creature Storage Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#a855f7', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
              Storage Box ({storageBox.length})
            </div>

            {storageBox.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '13px', fontStyle: 'italic', padding: '16px 0' }}>
                Storage box is empty. Captured creatures beyond party limit of 5 appear here.
              </div>
            ) : (
              storageBox.map((c) => renderCreatureCard(c, false))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
