import { useEffect } from 'react';
import { companionSystem } from '@/game/companion/CompanionSystem';
import { CompanionCommand } from '@/game/companion/companion.types';

interface CommandWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMANDS: Array<{ id: CompanionCommand; label: string; desc: string; icon: string; key: string }> = [
  { id: 'FOLLOW', label: 'Follow', desc: 'Stay close and travel beside player', icon: '🐾', key: '1' },
  { id: 'STAY', label: 'Stay / Guard', desc: 'Hold position and protect designated ground radius', icon: '🛡️', key: '2' },
  { id: 'AGGRESSIVE', label: 'Aggressive', desc: 'Engage valid hostile targets proactively', icon: '⚔️', key: '3' },
  { id: 'PASSIVE', label: 'Passive', desc: 'Do not initiate combat; defend only if commanded', icon: '🕊️', key: '4' },
];

export function CommandWheelModal({ isOpen, onClose }: CommandWheelModalProps) {
  const companion = companionSystem.getCompanion();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Digit1' || e.key === '1') {
        companionSystem.setCommand('FOLLOW');
        onClose();
      } else if (e.code === 'Digit2' || e.key === '2') {
        companionSystem.setCommand('STAY');
        onClose();
      } else if (e.code === 'Digit3' || e.key === '3') {
        companionSystem.setCommand('AGGRESSIVE');
        onClose();
      } else if (e.code === 'Digit4' || e.key === '4') {
        companionSystem.setCommand('PASSIVE');
        onClose();
      } else if (e.code === 'KeyF' || e.key === 'f' || e.key === 'F') {
        companionSystem.recallCompanion();
        onClose();
      } else if (e.code === 'KeyQ' || e.key === 'q' || e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(10, 15, 26, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '380px',
          background: '#0f172a',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 12px 36px rgba(0,0,0,0.8), 0 0 16px rgba(56, 189, 248, 0.2)',
          color: '#f8fafc',
          fontFamily: 'sans-serif',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🎯</span>
            <span style={{ fontSize: '15px', fontWeight: 'bold' }}>Companion Orders</span>
          </div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>[Q] / [Esc] Close</span>
        </div>

        {/* Command list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {COMMANDS.map((cmd) => {
            const isCurrent = companion?.command === cmd.id;
            return (
              <button
                key={cmd.id}
                onClick={() => {
                  companionSystem.setCommand(cmd.id);
                  onClose();
                }}
                style={{
                  background: isCurrent ? 'rgba(2, 132, 199, 0.3)' : '#1e293b',
                  border: isCurrent ? '1px solid #38bdf8' : '1px solid #334155',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  color: '#f8fafc',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>{cmd.icon}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: isCurrent ? '#38bdf8' : '#f8fafc' }}>
                      [{cmd.key}] {cmd.label}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{cmd.desc}</div>
                  </div>
                </div>
                {isCurrent && <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>ACTIVE</span>}
              </button>
            );
          })}
        </div>

        {/* Recall option */}
        <button
          onClick={() => {
            companionSystem.recallCompanion();
            onClose();
          }}
          style={{
            background: '#7f1d1d',
            border: '1px solid #ef4444',
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '12px',
          }}
        >
          <span>📥</span>
          <span>[F] Recall to Capsule</span>
        </button>
      </div>
    </div>
  );
}
