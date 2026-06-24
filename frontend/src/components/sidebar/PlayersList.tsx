import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { useAuthContext } from '../../context/AuthContext';
import { PlayerToken } from '../board/PlayerToken';
import { CHARACTER_CLASSES } from '../lobby/CharacterPicker';
import { Handshake } from 'lucide-react';

interface PlayersListProps {
  onProposeTrade: (username: string) => void;
}

export const PlayersList: React.FC<PlayersListProps> = ({ onProposeTrade }) => {
  const { gameState, getCurrentPlayer } = useGameContext();
  const { user } = useAuthContext();

  if (!gameState || !user) return null;

  const selfObj = getCurrentPlayer();

  return (
    <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-subtle)]">
      <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
        Causes Conectados
      </h3>
      <div className="space-y-2">
        {gameState.players.map((p, idx) => {
          const isCurrentTurn = gameState.turnIndex === idx;
          const charDetails = CHARACTER_CLASSES.find(c => c.id === p.characterClass);
          
          return (
            <div 
              key={p.username} 
              className={`flex items-center justify-between p-2.5 rounded-lg border transition ${
                isCurrentTurn 
                  ? 'bg-[var(--bg-elevated)] border-[var(--warning)] ring-1 ring-[var(--warning)]' 
                  : p.isBankrupt 
                    ? 'opacity-40 bg-[var(--bg-surface)] border-transparent'
                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center">
                  <PlayerToken characterClass={p.characterClass} color={p.color} size={20} />
                </div>
                <div>
                  <span className={`text-xs font-bold block text-[var(--text-primary)] ${p.isBankrupt ? 'line-through opacity-60' : ''}`}>
                    {p.username} {p.username === user.username ? '(Tú)' : ''}
                  </span>
                  <span className="text-[8px] font-semibold text-[var(--text-secondary)] uppercase">
                    {charDetails?.name} {p.inJail ? '[COMISARÍA]' : ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {p.isBankrupt ? (
                  <span className="text-[10px] text-[var(--danger)] font-black uppercase tracking-wider">
                    Quiebra
                  </span>
                ) : (
                  <span className="text-xs font-black text-[var(--success)] font-mono">
                    S/. {p.cash}
                  </span>
                )}

                {/* Propose Trade Button */}
                {p.username !== user.username && !p.isBankrupt && !selfObj?.isBankrupt && gameState.status === 'playing' && (
                  <button
                    onClick={() => onProposeTrade(p.username)}
                    className="p-1.5 bg-[var(--bg-elevated)] hover:bg-[var(--border-active)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition"
                    title="Proponer Trato"
                  >
                    <Handshake size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default PlayersList;
