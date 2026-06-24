import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { useSocketContext } from '../../context/SocketContext';
import { useAuthContext } from '../../context/AuthContext';
import { Handshake, Check, X } from 'lucide-react';
import { Button } from '../ui/Button';

export const TradeOffer: React.FC = () => {
  const { gameState, roomCode } = useGameContext();
  const { socket } = useSocketContext();
  const { user } = useAuthContext();

  if (!gameState || !user || !gameState.tradeOffer) return null;

  const { tradeOffer } = gameState;

  // Only render if we are the receiver of the trade proposal
  if (tradeOffer.receiver !== user.username) return null;

  const handleAcceptTrade = () => {
    if (!socket || !roomCode) return;
    socket.emit('acceptTrade', { roomCode });
  };

  const handleDeclineTrade = () => {
    if (!socket || !roomCode) return;
    socket.emit('declineTrade', { roomCode });
  };

  const renderPropertyName = (id: number) => {
    const tile = gameState.board.find(t => t.id === id);
    return tile ? tile.name : `Paradero #${id}`;
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-active)] p-4 rounded-xl space-y-3 text-left shadow-lg">
      <h4 className="text-xs font-black text-[var(--info)] uppercase tracking-widest flex items-center gap-1.5 border-b border-[var(--border-subtle)] pb-2">
        <Handshake size={14} /> Oferta de Trato de @{tradeOffer.sender}
      </h4>
      
      <div className="text-xs text-[var(--text-secondary)] space-y-2">
        <div>
          <span className="text-[var(--text-muted)] font-semibold uppercase block text-[9px] tracking-wider mb-0.5">
            Te ofrece:
          </span>
          <p className="text-[var(--text-primary)] font-bold">
            S/. {tradeOffer.offerCash} {tradeOffer.offerProperties.length > 0 && 'y '}
            {tradeOffer.offerProperties.length > 0 && (
              <span className="text-[var(--success)]">
                {tradeOffer.offerProperties.map(renderPropertyName).join(', ')}
              </span>
            )}
            {tradeOffer.offerCash === 0 && tradeOffer.offerProperties.length === 0 && 'Nada'}
          </p>
        </div>
        
        <div>
          <span className="text-[var(--text-muted)] font-semibold uppercase block text-[9px] tracking-wider mb-0.5">
            A cambio de:
          </span>
          <p className="text-[var(--text-primary)] font-bold">
            S/. {tradeOffer.requestCash} {tradeOffer.requestProperties.length > 0 && 'y '}
            {tradeOffer.requestProperties.length > 0 && (
              <span className="text-[var(--warning)]">
                {tradeOffer.requestProperties.map(renderPropertyName).join(', ')}
              </span>
            )}
            {tradeOffer.requestCash === 0 && tradeOffer.requestProperties.length === 0 && 'Nada'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-[var(--border-subtle)]">
        <Button 
          onClick={handleAcceptTrade} 
          variant="success" 
          className="flex-1 py-1.5 text-xs"
        >
          <Check size={12} className="mr-1" /> Aceptar
        </Button>
        <Button 
          onClick={handleDeclineTrade} 
          variant="danger" 
          className="flex-1 py-1.5 text-xs"
        >
          <X size={12} className="mr-1" /> Rechazar
        </Button>
      </div>
    </div>
  );
};
export default TradeOffer;
