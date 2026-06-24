import React from 'react';
import { useGameContext } from '../../context/GameContext';
import type { Tile } from '../../types';
import { BoardTile } from './BoardTile';
import { CenterControls } from './CenterControls';

interface GameBoardProps {
  selectedTile: Tile | null;
  onSelectTile: (tile: Tile | null) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ selectedTile, onSelectTile }) => {
  const { gameState } = useGameContext();

  if (!gameState) return null;

  return (
    <div className="w-full max-w-[800px] aspect-square relative bg-[#faf6ee] rounded-2xl border-4 border-[#0a2f1b] shadow-2xl p-1 flex flex-col">
      <svg 
        viewBox="0 0 1000 1000" 
        className="w-full h-full select-none"
      >
        {/* Soft inner shadow of parchment board */}
        <rect x="0" y="0" width="1000" height="1000" fill="#faf6ee" rx="16" />

        {/* Inner board border line */}
        <rect x="140" y="140" width="720" height="720" fill="none" stroke="#0d3a24" strokeWidth="3" />
        <rect x="0" y="0" width="1000" height="1000" fill="none" stroke="#0d3a24" strokeWidth="8" rx="16" />

        {/* Draw paradero nodes (Classic Square Cards) */}
        {gameState.board.map((tile) => {
          const playersOnTile = gameState.players.filter(p => p.position === tile.id && !p.isBankrupt);
          return (
            <BoardTile
              key={tile.id}
              tile={tile}
              isSelected={selectedTile?.id === tile.id}
              onSelect={onSelectTile}
              playersOnTile={playersOnTile}
            />
          );
        })}
      </svg>

      {/* Central Controls Overlay */}
      <CenterControls />
    </div>
  );
};
export default GameBoard;
