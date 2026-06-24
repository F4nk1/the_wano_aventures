import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { useSocketContext } from '../../context/SocketContext';
import type { Tile } from '../../types';
import { PlayersList } from './PlayersList';
import { PropertyInspector } from './PropertyInspector';
import { GameLog } from './GameLog';
import { ChatPanel } from '../chat/ChatPanel';
import { CrisisAlert } from './CrisisAlert';
import { Save, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface GameSidebarProps {
  selectedTile: Tile | null;
  onSelectTile: (tile: Tile | null) => void;
  onProposeTrade: (username: string) => void;
}

export const GameSidebar: React.FC<GameSidebarProps> = ({
  selectedTile,
  onSelectTile,
  onProposeTrade
}) => {
  const { gameState, roomCode, exitRoom } = useGameContext();
  const { socket } = useSocketContext();

  if (!gameState) return null;

  const handleSaveGame = () => {
    if (!socket || !roomCode) return;
    socket.emit('saveGame', { roomCode });
  };

  const handleBankruptcy = () => {
    if (window.confirm('¿Seguro que quieres declararte en BANCARROTA? Perderas tus propiedades.')) {
      if (!socket || !roomCode) return;
      socket.emit('declareBankruptcy', { roomCode });
    }
  };

  return (
    <div className="w-full xl:w-[440px] bg-[var(--bg-secondary)] flex flex-col h-full border-l border-[var(--bg-primary)] shadow-xl overflow-hidden">
      {/* Top: Header */}
      <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)] animate-pulse" />
            <h2 className="font-extrabold text-sm text-[var(--text-primary)] uppercase tracking-wider">
              Monopolio Chicha
            </h2>
          </div>
          <button 
            onClick={exitRoom} 
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          >
            Salir de la Sala
          </button>
        </div>

        {/* Active crisis */}
        <CrisisAlert />
      </div>

      {/* Scrollable Center Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Players List */}
        <PlayersList onProposeTrade={onProposeTrade} />

        {/* Property Inspector */}
        {selectedTile && (
          <PropertyInspector 
            selectedTile={selectedTile} 
            onClose={() => onSelectTile(null)} 
          />
        )}

        {/* Game Log */}
        <GameLog />
      </div>

      {/* Chat Area */}
      <ChatPanel />

      {/* Global Actions Footer */}
      <div className="p-3 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] flex gap-2 text-xs">
        <Button
          onClick={handleSaveGame}
          variant="secondary"
          className="flex-1 text-xs py-2"
        >
          <Save size={14} className="mr-1.5" /> Guardar Partida
        </Button>
        <Button
          onClick={handleBankruptcy}
          variant="danger"
          className="flex-1 text-xs py-2"
        >
          <Trash2 size={14} className="mr-1.5" /> Quiebra
        </Button>
      </div>
    </div>
  );
};
export default GameSidebar;
