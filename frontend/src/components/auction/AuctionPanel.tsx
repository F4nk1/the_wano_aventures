import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { useSocketContext } from '../../context/SocketContext';
import { useAuthContext } from '../../context/AuthContext';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { getGroupColorHex } from '../board/BoardTile';
import { Gavel } from 'lucide-react';

export const AuctionPanel: React.FC = () => {
  const { gameState, roomCode, customBidAmount, setCustomBidAmount } = useGameContext();
  const { socket } = useSocketContext();
  const { user } = useAuthContext();

  if (!gameState || !gameState.auction || !user) return null;

  const { auction } = gameState;
  const tile = gameState.board.find(t => t.id === auction.tileId);

  if (!tile) return null;

  const activeBidder = auction.activeBidders[auction.bidderIndex];
  const isMyTurnToBid = activeBidder === user.username;
  const groupColor = getGroupColorHex(tile.group);

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !roomCode || !customBidAmount) return;
    socket.emit('placeBid', { roomCode, bidAmount: customBidAmount });
  };

  const handlePassBid = () => {
    if (!socket || !roomCode) return;
    socket.emit('passBid', { roomCode });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-[var(--warning)] bg-[var(--bg-secondary)] shadow-2xl">
        <CardHeader className="flex flex-row items-center gap-2.5">
          <Gavel className="text-[var(--warning)]" size={20} />
          <div>
            <h3 className="text-md font-black text-[var(--text-primary)]">
              Subasta de Propiedad
            </h3>
            <p className="text-[10px] text-[var(--text-secondary)] font-medium">
              Todos los causes pujan hasta que quede un solo postor.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-5">
          
          {/* Property Card details */}
          <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-surface)] text-center pb-4">
            <div 
              className="h-7 w-full border-b border-[var(--border-subtle)]"
              style={{ backgroundColor: groupColor }}
            />
            <h4 className="font-extrabold text-sm text-[var(--text-primary)] mt-3">
              {tile.name}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
              Valor Base: S/. {tile.price}
            </p>
          </div>

          {/* Auction Status */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-xs font-medium">
            <div className="text-center border-r border-[var(--border-subtle)]/50">
              <span className="text-[9px] text-[var(--text-muted)] block uppercase tracking-wider">
                Oferta Mas Alta
              </span>
              <span className="text-sm font-black text-[var(--success)] font-mono block mt-1">
                S/. {auction.highestBid}
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">
                {auction.highestBidder ? `@${auction.highestBidder}` : '(Nadie)'}
              </span>
            </div>
            <div className="text-center">
              <span className="text-[9px] text-[var(--text-muted)] block uppercase tracking-wider">
                Turno para Ofertar
              </span>
              <span className="text-sm font-black text-[var(--warning)] block mt-1">
                @{activeBidder}
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">
                {isMyTurnToBid ? '¡Tu turno!' : 'Esperando...'}
              </span>
            </div>
          </div>

          {/* Bid actions */}
          {isMyTurnToBid ? (
            <form onSubmit={handlePlaceBid} className="space-y-3">
              <div className="flex gap-2">
                <div className="w-1/3">
                  <Input
                    label="Tu Oferta"
                    type="number"
                    min={auction.highestBid + 1}
                    value={customBidAmount}
                    onChange={(e) => setCustomBidAmount(Math.max(auction.highestBid + 1, parseInt(e.target.value) || 0))}
                  />
                </div>
                <div className="w-2/3 flex items-end">
                  <Button type="submit" variant="gold" fullWidth className="py-3">
                    Ofertar S/. {customBidAmount}
                  </Button>
                </div>
              </div>
              <Button type="button" variant="secondary" onClick={handlePassBid} fullWidth>
                Pasar / Retirarse de la subasta
              </Button>
            </form>
          ) : (
            <div className="p-3 bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] rounded-xl text-center text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider py-4">
              Esperando puja del oferente...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default AuctionPanel;
