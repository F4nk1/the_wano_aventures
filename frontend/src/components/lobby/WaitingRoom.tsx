import React, { useState } from 'react';
import { useGameContext } from '../../context/GameContext';
import { useAuthContext } from '../../context/AuthContext';
import { useSocketContext } from '../../context/SocketContext';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Copy, Check, Play, LogOut } from 'lucide-react';
import { CHARACTER_CLASSES } from './CharacterPicker';

export const WaitingRoom: React.FC = () => {
  const { gameState, roomCode, exitRoom } = useGameContext();
  const { user } = useAuthContext();
  const { socket } = useSocketContext();
  const [copied, setCopied] = useState(false);

  if (!gameState || !user) return null;

  const isHost = gameState.creator === user.username;

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    if (!socket || !roomCode) return;
    socket.emit('startGame', { roomCode });
  };

  const getClassName = (clsId: string) => {
    const found = CHARACTER_CLASSES.find(c => c.id === clsId);
    return found ? found.name : clsId;
  };

  const getClassColor = (clsId: string) => {
    const found = CHARACTER_CLASSES.find(c => c.id === clsId);
    return found ? found.color : 'var(--text-secondary)';
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <Card className="border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
              Sala de Espera
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
              Esperando a que el host inicie la partida...
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={exitRoom} className="text-[var(--danger)] hover:bg-[var(--danger)]/10">
            <LogOut size={16} className="mr-1.5" /> Salir de Sala
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 p-6">
          {/* Room Code Display */}
          <div className="flex flex-col items-center bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl p-6 text-center">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Codigo de la Sala
            </span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-extrabold font-mono tracking-widest text-[var(--chicha-yellow)] text-chicha-glow">
                {roomCode}
              </span>
              <button
                onClick={copyRoomCode}
                className="p-2 bg-[var(--bg-elevated)] hover:bg-[var(--border-active)] border border-[var(--border-subtle)] rounded-xl transition text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="Copiar codigo"
              >
                {copied ? <Check size={18} className="text-[var(--success)]" /> : <Copy size={18} />}
              </button>
            </div>
            {copied && (
              <span className="text-xs text-[var(--success)] font-medium mt-2">
                Codigo copiado al portapapeles!
              </span>
            )}
          </div>

          {/* Connected Players */}
          <div>
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Jugadores Conectados ({gameState.players.length})
            </h3>
            <div className="flex flex-col gap-3">
              {gameState.players.map((player) => {
                const isPlayerHost = gameState.creator === player.username;
                const isMe = player.username === user.username;
                
                return (
                  <div
                    key={player.username}
                    className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: getClassColor(player.characterClass) }}
                      />
                      <div>
                        <span className="font-bold text-[var(--text-primary)]">
                          {player.username} {isMe && '(Tú)'}
                        </span>
                        <div className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                          Clase: {getClassName(player.characterClass)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPlayerHost && (
                        <Badge variant="gold">Creador</Badge>
                      )}
                      {!isPlayerHost && (
                        <Badge variant="secondary">Jugador</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Row */}
          {isHost ? (
            <Button
              variant="chicha"
              onClick={handleStartGame}
              disabled={gameState.players.length < 2}
              fullWidth
              size="lg"
            >
              <Play size={18} className="mr-2 fill-current" /> Comenzar Partida
            </Button>
          ) : (
            <div className="text-center text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider py-2">
              Solo el creador puede iniciar la partida.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default WaitingRoom;
