import React, { useState } from 'react';
import { useGameContext } from '../../context/GameContext';
import { useSocketContext } from '../../context/SocketContext';
import { useAuthContext } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: string;
}

export const TradeModal: React.FC<TradeModalProps> = ({ isOpen, onClose, targetUser }) => {
  const { gameState, roomCode } = useGameContext();
  const { socket } = useSocketContext();
  const { user } = useAuthContext();

  const [offerCash, setOfferCash] = useState<number>(0);
  const [offerProperties, setOfferProperties] = useState<number[]>([]);
  const [requestCash, setRequestCash] = useState<number>(0);
  const [requestProperties, setRequestProperties] = useState<number[]>([]);

  if (!gameState || !user || !targetUser) return null;

  const myProperties = gameState.board.filter(t => t.owner === user.username);
  const targetProperties = gameState.board.filter(t => t.owner === targetUser);

  const handleSendTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !roomCode) return;

    socket.emit('proposeTrade', {
      roomCode,
      receiver: targetUser,
      offerCash,
      offerProperties,
      requestCash,
      requestProperties
    });

    onClose();
  };

  const toggleProperty = (id: number, type: 'offer' | 'request') => {
    if (type === 'offer') {
      setOfferProperties(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    } else {
      setRequestProperties(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Proponer Trato a @${targetUser}`} maxWidthClass="max-w-2xl">
      <form onSubmit={handleSendTrade} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* My offer column */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-[var(--success)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-1">
              Lo que tú ofreces
            </h4>
            
            <Input
              label="Dinero en S/."
              type="number"
              min={0}
              value={offerCash}
              onChange={(e) => setOfferCash(Math.max(0, parseInt(e.target.value) || 0))}
            />

            <div>
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
                Tus Propiedades ({myProperties.length})
              </span>
              {myProperties.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] italic">No tienes paraderos que ofrecer.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface)] p-3 space-y-2">
                  {myProperties.map(tile => (
                    <label key={tile.id} className="flex items-center gap-2 text-xs font-medium cursor-pointer text-[var(--text-primary)] hover:text-white">
                      <input
                        type="checkbox"
                        checked={offerProperties.includes(tile.id)}
                        onChange={() => toggleProperty(tile.id, 'offer')}
                        className="rounded border-[var(--border-subtle)] text-[var(--success)] focus:ring-[var(--success)] bg-[var(--bg-secondary)]"
                      />
                      <span>{tile.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Request column */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-[var(--warning)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-1">
              Lo que tú pides
            </h4>

            <Input
              label="Dinero en S/."
              type="number"
              min={0}
              value={requestCash}
              onChange={(e) => setRequestCash(Math.max(0, parseInt(e.target.value) || 0))}
            />

            <div>
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
                Sus Propiedades ({targetProperties.length})
              </span>
              {targetProperties.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] italic">No tiene paraderos que pedir.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface)] p-3 space-y-2">
                  {targetProperties.map(tile => (
                    <label key={tile.id} className="flex items-center gap-2 text-xs font-medium cursor-pointer text-[var(--text-primary)] hover:text-white">
                      <input
                        type="checkbox"
                        checked={requestProperties.includes(tile.id)}
                        onChange={() => toggleProperty(tile.id, 'request')}
                        className="rounded border-[var(--border-subtle)] text-[var(--warning)] focus:ring-[var(--warning)] bg-[var(--bg-secondary)]"
                      />
                      <span>{tile.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="chicha">
            Enviar Propuesta
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default TradeModal;
