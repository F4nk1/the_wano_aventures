import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { useAuthContext } from '../../context/AuthContext';
import { useSocketContext } from '../../context/SocketContext';
import type { Tile } from '../../types';
import { getGroupColorHex } from '../board/BoardTile';
import { Button } from '../ui/Button';

interface PropertyInspectorProps {
  selectedTile: Tile | null;
  onClose: () => void;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({ selectedTile, onClose }) => {
  const { gameState, roomCode, getCurrentPlayer } = useGameContext();
  const { user } = useAuthContext();
  const { socket } = useSocketContext();

  if (!gameState || !user || !selectedTile) return null;

  const selfObj = getCurrentPlayer();

  // Socket emissions
  const handleBuildHouse = () => {
    if (!socket || !roomCode) return;
    socket.emit('buildHouse', { roomCode, tileId: selectedTile.id });
  };

  const handleSellHouse = () => {
    if (!socket || !roomCode) return;
    socket.emit('sellHouse', { roomCode, tileId: selectedTile.id });
  };

  const handleMortgage = () => {
    if (!socket || !roomCode) return;
    socket.emit('mortgageProperty', { roomCode, tileId: selectedTile.id });
  };

  const handleUnmortgage = () => {
    if (!socket || !roomCode) return;
    socket.emit('unmortgageProperty', { roomCode, tileId: selectedTile.id });
  };

  return (
    <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-subtle)]">
      <div className="flex justify-between items-start mb-3 border-b border-[var(--border-subtle)] pb-2">
        <div>
          <h4 className="text-[9px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Detalle del Paradero
          </h4>
          <h3 className="text-md font-black text-[var(--text-primary)] mt-0.5">
            {selectedTile.name}
          </h3>
        </div>
        <button 
          onClick={onClose} 
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
        >
          Cerrar
        </button>
      </div>

      {selectedTile.price ? (
        <div className="space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Grupo de Casillas:</span>
            <span className="font-bold uppercase" style={{ color: getGroupColorHex(selectedTile.group) }}>
              {selectedTile.group || 'Especial'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Precio Base:</span>
            <span className="font-bold text-[var(--text-primary)] font-mono">
              S/. {selectedTile.price}
            </span>
          </div>
          {selectedTile.rent && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Alquiler actual:</span>
              <span className="font-bold text-[var(--success)] font-mono">
                S/. {selectedTile.mortgaged ? 0 : selectedTile.rent[selectedTile.houses]}
              </span>
            </div>
          )}
          <div className="flex justify-between border-t border-[var(--border-subtle)] pt-1.5">
            <span className="text-[var(--text-secondary)]">Esteras Edificadas:</span>
            <span className="font-bold text-[var(--text-primary)]">
              {selectedTile.houses === 5 ? 'Hotel' : selectedTile.houses}
            </span>
          </div>

          {/* Actions for owner */}
          {selectedTile.owner === user.username && !selfObj?.isBankrupt && (
            <div className="pt-3 flex flex-col gap-2 border-t border-[var(--border-subtle)]">
              {selectedTile.type === 'property' && selectedTile.houses < 5 && !selectedTile.mortgaged && (
                <Button
                  onClick={handleBuildHouse}
                  variant="success"
                  className="py-1.5 px-3 text-[10px]"
                >
                  Construir Estera (S/. {selfObj?.characterClass === 'emprendedor' ? Math.round((selectedTile.housePrice || 0) * 0.85) : selectedTile.housePrice})
                </Button>
              )}
              {selectedTile.type === 'property' && selectedTile.houses > 0 && (
                <Button
                  onClick={handleSellHouse}
                  variant="danger"
                  className="py-1.5 px-3 text-[10px]"
                >
                  Vender Estera (+S/. {Math.round((selectedTile.housePrice || 0) / 2)})
                </Button>
              )}
              {!selectedTile.mortgaged ? (
                <Button
                  onClick={handleMortgage}
                  variant="gold"
                  className="py-1.5 px-3 text-[10px]"
                >
                  Hipotecar (+S/. {selectedTile.mortgageValue})
                </Button>
              ) : (
                <Button
                  onClick={handleUnmortgage}
                  variant="primary"
                  className="py-1.5 px-3 text-[10px]"
                >
                  Deshipotecar (-S/. {Math.round((selectedTile.mortgageValue || 0) * 1.1)})
                </Button>
              )}
            </div>
          )}

          {selectedTile.owner && selectedTile.owner !== user.username && (
            <div className="p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-[10px] text-[var(--text-secondary)]">
              Dueño: <span className="font-bold text-[var(--info)]">@{selectedTile.owner}</span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-[var(--text-secondary)] italic bg-[var(--bg-surface)] p-2.5 rounded border border-[var(--border-subtle)]">
          {selectedTile.description || 'Casilla de transito especial del juego.'}
        </p>
      )}
    </div>
  );
};
export default PropertyInspector;
