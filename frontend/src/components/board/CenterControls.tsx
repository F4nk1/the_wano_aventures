import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { useAuthContext } from '../../context/AuthContext';
import { useSocketContext } from '../../context/SocketContext';
import { Button } from '../ui/Button';
import { DiceDisplay } from './DiceDisplay';
import { Dice5, Award } from 'lucide-react';

export const CenterControls: React.FC = () => {
  const { 
    gameState, 
    roomCode, 
    isMyTurn, 
    getCurrentPlayer,
    customBidAmount,
    setCustomBidAmount
  } = useGameContext();
  const { user } = useAuthContext();
  const { socket } = useSocketContext();

  if (!gameState || !user) return null;

  const isTurn = isMyTurn();
  const selfObj = getCurrentPlayer();
  const currentPlayerObj = gameState.players[gameState.turnIndex];

  // Socket emissions
  const handleRollDice = () => {
    if (!socket || !roomCode) return;
    socket.emit('rollDice', { roomCode });
  };

  const handleBuyProperty = () => {
    if (!socket || !roomCode) return;
    socket.emit('buyProperty', { roomCode });
  };

  const handleDeclineProperty = () => {
    if (!socket || !roomCode) return;
    socket.emit('declineProperty', { roomCode });
  };

  const handlePassProperty = () => {
    if (!socket || !roomCode) return;
    socket.emit('passProperty', { roomCode });
  };

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !roomCode || !customBidAmount) return;
    socket.emit('placeBid', { roomCode, bidAmount: customBidAmount });
  };

  const handlePassBid = () => {
    if (!socket || !roomCode) return;
    socket.emit('passBid', { roomCode });
  };

  const handleEndTurn = () => {
    if (!socket || !roomCode) return;
    socket.emit('endTurn', { roomCode });
  };

  const handlePayJailFine = () => {
    if (!socket || !roomCode) return;
    socket.emit('payJailFine', { roomCode });
  };

  const standingTile = selfObj ? gameState.board.find(t => t.id === selfObj.position) : null;
  const showBuyOption = gameState.currentPlayerAction === 'buy_or_auction' && isTurn;

  return (
    <div className="absolute left-[24%] right-[24%] top-[24%] bottom-[24%] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-4 flex flex-col justify-between items-center text-center shadow-2xl z-30 backdrop-blur-sm">
      
      {/* Title Header */}
      <div>
        <span className="bg-gold-gradient text-slate-900 text-[9px] uppercase tracking-widest font-black px-3 py-1 rounded-full shadow-md">
          Monopolio Online
        </span>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)] mt-2">
          CHICHA EDITION
        </h2>
        <p className="text-[9px] text-[var(--text-secondary)] font-mono tracking-widest uppercase">
          SALA: {roomCode}
        </p>
      </div>

      {/* Game State Content Area */}
      <div className="w-full max-w-xs py-1">
        {gameState.status === 'ended' ? (
          <div>
            <Award className="text-[var(--chicha-yellow)] mx-auto animate-bounce mb-2" size={32} />
            <h3 className="text-sm font-bold text-[var(--chicha-yellow)]">PARTIDA FINALIZADA</h3>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">Solo un jugador sobrevivio a las deudas.</p>
          </div>
        ) : gameState.currentPlayerAction === 'auction_bidding' && gameState.auction ? (
          /* Active Auction Status */
          <div className="bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-subtle)] text-center space-y-2">
            <h4 className="text-xs font-black text-[var(--gold)] uppercase tracking-wider">
              Subasta en Curso
            </h4>
            <p className="text-[11px] text-[var(--text-primary)] font-semibold">
              Propiedad: {gameState.board.find(t => t.id === gameState.auction?.tileId)?.name}
            </p>
            <p className="text-xs text-[var(--success)] font-mono font-black">
              Oferta: S/. {gameState.auction.highestBid} {gameState.auction.highestBidder ? `(@${gameState.auction.highestBidder})` : '(Nadie)'}
            </p>
            <p className="text-[10px] text-[var(--text-secondary)]">
              Turno: @{gameState.auction.activeBidders[gameState.auction.bidderIndex]}
            </p>
          </div>
        ) : (
          /* Default Turn and Dice Display */
          <div className="space-y-2">
            <div className="flex justify-center items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentPlayerObj?.color }} />
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {isTurn ? 'TU TURNO DE JUGAR' : `Turno: ${currentPlayerObj?.username}`}
              </span>
            </div>
            <DiceDisplay dice={gameState.dice} />
          </div>
        )}
      </div>

      {/* Center Interactive Buttons */}
      <div className="w-full max-w-xs space-y-2">
        {gameState.status === 'playing' && gameState.currentPlayerAction === 'auction_bidding' && gameState.auction && (
          <div className="w-full">
            {gameState.auction.activeBidders[gameState.auction.bidderIndex] === user.username ? (
              <form onSubmit={handlePlaceBid} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={gameState.auction.highestBid + 1}
                    value={customBidAmount}
                    onChange={(e) => setCustomBidAmount(parseInt(e.target.value) || 0)}
                    className="w-24 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-2 text-center text-xs text-[var(--text-primary)] focus:outline-none"
                  />
                  <Button type="submit" variant="gold" className="flex-grow py-1 px-3 text-xs">
                    Ofertar S/. {customBidAmount}
                  </Button>
                </div>
                <Button type="button" variant="secondary" onClick={handlePassBid} className="w-full py-1 text-xs">
                  Pasar / Retirarse
                </Button>
              </form>
            ) : (
              <p className="text-[10px] text-[var(--text-muted)] italic font-semibold uppercase tracking-wider">
                Esperando que el oferente haga su puja...
              </p>
            )}
          </div>
        )}

        {isTurn && gameState.status === 'playing' && gameState.currentPlayerAction !== 'auction_bidding' && (
          <div className="space-y-2 w-full">
            {/* Standard Roll Dice */}
            {!gameState.hasRolled && !selfObj?.inJail && (
              <Button
                variant="chicha"
                onClick={handleRollDice}
                fullWidth
              >
                <Dice5 size={14} className="mr-1.5" /> Lanzar Dados
              </Button>
            )}

            {/* In Jail options */}
            {selfObj?.inJail && !gameState.hasRolled && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-[var(--warning)] font-semibold uppercase tracking-wider">
                  Detenido en la Comisaria
                </p>
                <Button onClick={handleRollDice} variant="chicha" fullWidth>
                  Lanzar Dobles
                </Button>
                <Button
                  onClick={handlePayJailFine}
                  disabled={selfObj.cash < (selfObj.characterClass === 'tramitador' ? 25 : 50)}
                  variant="secondary"
                  fullWidth
                >
                  Pagar Fianza (S/. {selfObj.characterClass === 'tramitador' ? 25 : 50})
                </Button>
              </div>
            )}

            {/* Buying Option decisions */}
            {showBuyOption && standingTile && (
              <div className="space-y-2">
                <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                  ¿Quieres comprar <span className="font-bold text-[var(--text-primary)]">{standingTile.name}</span> por{' '}
                  <span className="font-mono font-bold text-[var(--success)]">
                    S/. {selfObj && selfObj.characterClass === 'emprendedor'
                      ? Math.round((standingTile.price || 0) * 0.85)
                      : standingTile.price
                    }
                  </span>?
                  {selfObj?.characterClass === 'emprendedor' && (
                    <span className="block text-[8px] text-[var(--warning)] font-semibold mt-0.5">
                      Descuento del 15% activo
                    </span>
                  )}
                </p>
                <div className="flex flex-col gap-2 w-full">
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Button
                      onClick={handleBuyProperty}
                      variant="success"
                      disabled={!!(selfObj && selfObj.cash < (selfObj.characterClass === 'emprendedor'
                        ? Math.round((standingTile.price || 0) * 0.85)
                        : (standingTile.price || 0)
                      ))}
                    >
                      Comprar
                    </Button>
                    <Button
                      onClick={handleDeclineProperty}
                      variant="danger"
                    >
                      Subastar
                    </Button>
                  </div>
                  <Button
                    onClick={handlePassProperty}
                    variant="secondary"
                    fullWidth
                  >
                    Dejar Pasar
                  </Button>
                </div>
              </div>
            )}

            {/* End Turn */}
            {gameState.hasRolled && gameState.currentPlayerAction === null && (
              <Button
                onClick={handleEndTurn}
                variant="secondary"
                fullWidth
              >
                Terminar Turno
              </Button>
            )}
          </div>
        )}

        {!isTurn && gameState.status === 'playing' && !gameState.auction && (
          <p className="text-[10px] text-[var(--text-muted)] italic font-semibold uppercase tracking-wider">
            Esperando que juegue su turno...
          </p>
        )}
      </div>
    </div>
  );
};
export default CenterControls;
