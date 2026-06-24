import React from 'react';
import type { Tile, Player } from '../../types';
import { TileIcon } from './TileIcons';
import { PlayerToken } from './PlayerToken';

interface BoardTileProps {
  tile: Tile;
  isSelected: boolean;
  onSelect: (tile: Tile) => void;
  playersOnTile: Player[];
}

export const getGroupColorHex = (group?: string) => {
  switch (group) {
    case 'brown': return '#9A3412';
    case 'cyan': return '#06B6D4';
    case 'pink': return '#D946EF';
    case 'orange': return '#F97316';
    case 'red': return '#EF4444';
    case 'yellow': return '#EAB308';
    case 'green': return '#10B981';
    case 'blue': return '#2563EB';
    default: return '#64748B';
  }
};

const getPlayerOffset = (playerIndex: number, totalPlayers: number) => {
  if (totalPlayers <= 1) return { dx: 0, dy: 0 };
  const angle = (playerIndex * 2 * Math.PI) / totalPlayers;
  const radius = 12; // offset radius in SVG units
  return {
    dx: Math.cos(angle) * radius,
    dy: Math.sin(angle) * radius
  };
};

export const BoardTile: React.FC<BoardTileProps> = ({
  tile,
  isSelected,
  onSelect,
  playersOnTile
}) => {
  const hasOwner = tile.owner !== null;
  const tileColorHex = getGroupColorHex(tile.group);

  const isCorner = tile.id === 0 || tile.id === 10 || tile.id === 20 || tile.id === 30;
  let width = isCorner ? 140 : 80;
  let height = 140;

  const isOnLeftRight = (tile.id > 10 && tile.id < 20) || (tile.id > 30 && tile.id < 40);
  if (isOnLeftRight && !isCorner) {
    width = 140;
    height = 80;
  }

  const halfW = width / 2;
  const halfH = height / 2;

  // Coordinate adjustments to avoid overlap and create perfect symmetry
  const getAdjustedCoords = (tileId: number, originalX: number, originalY: number) => {
    let x = originalX;
    let y = originalY;

    if (tileId >= 0 && tileId <= 10) {
      y = 930;
    }
    if (tileId >= 20 && tileId <= 30) {
      y = 70;
    }
    if (tileId >= 10 && tileId <= 20) {
      x = 70;
    }
    if (tileId >= 30 && tileId < 40) {
      x = 930;
    }
    if (tileId === 0) { x = 930; y = 930; }
    if (tileId === 10) { x = 70; y = 930; }
    if (tileId === 20) { x = 70; y = 70; }
    if (tileId === 30) { x = 930; y = 70; }

    return { x, y };
  };

  const { x: drawX, y: drawY } = getAdjustedCoords(tile.id, tile.x, tile.y);

  // Split name for nicer layout
  const nameParts = tile.name.split(" ");
  const firstWord = nameParts[0] || "";
  const restWords = nameParts.slice(1).join(" ");

  return (
    <g 
      transform={`translate(${drawX}, ${drawY})`}
      onClick={() => onSelect(tile)}
      className="cursor-pointer group"
    >
      {/* Outer selection border glow */}
      <rect 
        x={-halfW - 3} 
        y={-halfH - 3} 
        width={width + 6} 
        height={height + 6} 
        fill="none" 
        stroke={isSelected ? 'var(--chicha-yellow)' : 'none'} 
        strokeWidth="4" 
        rx="6" 
        className="animate-pulse"
      />

      {/* Primary Node square card */}
      <rect 
        x={-halfW} 
        y={-halfH} 
        width={width} 
        height={height} 
        fill={
          tile.type === 'go' ? '#edf7ed' : 
          tile.type === 'jail' ? '#fdf2f2' : 
          tile.type === 'parking' ? '#fefbf0' : 
          tile.type === 'go-to-jail' ? '#fff5f5' : 
          tile.type === 'tax' ? '#f7f7f7' : 
          hasOwner ? '#f0faf4' : '#fcfbf9'
        } 
        stroke="#0d3a24" 
        strokeWidth="2"
        className="transition group-hover:fill-slate-50 duration-200"
      />

      {/* Property Banner coloring */}
      {tile.type === 'property' && (
        <>
          {/* Banner on top (Bottom edge nodes 1 to 9) */}
          {tile.id > 0 && tile.id < 10 && (
            <rect x={-halfW} y={-halfH} width={width} height="30" fill={tileColorHex} stroke="#0d3a24" strokeWidth="2" />
          )}
          {/* Banner on bottom (Top edge nodes 21 to 29) */}
          {tile.id > 20 && tile.id < 30 && (
            <rect x={-halfW} y={halfH - 30} width={width} height="30" fill={tileColorHex} stroke="#0d3a24" strokeWidth="2" />
          )}
          {/* Banner on right (Left edge nodes 11 to 19) */}
          {tile.id > 10 && tile.id < 20 && (
            <rect x={halfW - 30} y={-halfH} width="30" height={height} fill={tileColorHex} stroke="#0d3a24" strokeWidth="2" />
          )}
          {/* Banner on left (Right edge nodes 31 to 39) */}
          {tile.id > 30 && tile.id < 40 && (
            <rect x={-halfW} y={-halfH} width="30" height={height} fill={tileColorHex} stroke="#0d3a24" strokeWidth="2" />
          )}
        </>
      )}

      {/* Name inside card */}
      <text 
        textAnchor="middle" 
        y={isCorner ? -15 : isOnLeftRight ? -12 : -20}
        fill="#1A202C" 
        className="text-[9px] font-black pointer-events-none uppercase tracking-tighter"
      >
        {firstWord}
      </text>
      <text 
        textAnchor="middle" 
        y={isCorner ? 0 : isOnLeftRight ? 0 : -8}
        fill="#4A5568" 
        className="text-[7px] font-bold pointer-events-none uppercase tracking-tighter"
      >
        {restWords}
      </text>

      {/* Rent houses indicators */}
      {tile.houses > 0 && (
        <g transform={`translate(0, ${isCorner ? 25 : isOnLeftRight ? 18 : 10})`}>
          {tile.houses === 5 ? (
            <polygon points="-8,4 -8,-3 0,-7 8,-3 8,4" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
          ) : (
            Array.from({ length: tile.houses }).map((_, hidx) => (
              <polygon 
                key={hidx} 
                points="-4,2 -4,-2 0,-5 4,-2 4,2" 
                transform={`translate(${(hidx - (tile.houses - 1) / 2) * 10}, 0)`}
                fill="#10B981" 
                stroke="#047857" 
                strokeWidth="0.8" 
              />
            ))
          )}
        </g>
      )}

      {/* Render Detailed Illustration for special tiles */}
      <TileIcon tile={tile} isCorner={isCorner} isOnLeftRight={isOnLeftRight} />

      {/* Render Tile Cost/Status */}
      {tile.price && (
        <text 
          textAnchor="middle" 
          y={isCorner ? 45 : isOnLeftRight ? 32 : 55}
          fill="#2D3748" 
          className="text-[8px] font-mono pointer-events-none"
        >
          {tile.mortgaged ? "HIPOTECADO" : tile.owner ? `@${tile.owner}` : `S/. ${tile.price}`}
        </text>
      )}
      {tile.cost && (
        <text 
          textAnchor="middle" 
          y={45}
          fill="#E53E3E" 
          className="text-[8px] font-mono font-bold pointer-events-none"
        >
          S/. {tile.cost}
        </text>
      )}

      {/* Render player tokens with vector shapes */}
      {playersOnTile.map((p, pidx) => {
        const offset = getPlayerOffset(pidx, playersOnTile.length);
        return (
          <g key={p.username} transform={`translate(${offset.dx}, ${offset.dy})`}>
            <PlayerToken characterClass={p.characterClass} color={p.color} />
          </g>
        );
      })}
    </g>
  );
};
export default BoardTile;
