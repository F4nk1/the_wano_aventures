import React from 'react';
import type { Tile } from '../../types';

interface TileIconProps {
  tile: Tile;
  isCorner: boolean;
  isOnLeftRight: boolean;
}

export const TileIcon: React.FC<TileIconProps> = ({ tile, isCorner, isOnLeftRight }) => {
  let dy = 16;
  let dx = 0;
  if (isCorner) {
    dy = 22;
  } else if (isOnLeftRight) {
    dy = 20;
  } else {
    const isTopRow = tile.id > 20 && tile.id < 30;
    if (isTopRow) {
      dy = 12;
    } else {
      dy = 20;
    }
  }

  const iconColor = "#4A5568";

  switch (tile.type) {
    case 'go':
      return (
        <g transform={`translate(0, ${dy})`}>
          <path d="M-20,0 L20,0 M-20,0 L-10,-8 M-20,0 L-10,8" stroke="#E53E3E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case 'jail':
      return (
        <g transform={`translate(0, 15)`} stroke={iconColor} strokeWidth="1.8" fill="none" strokeLinecap="round">
          <rect x="-15" y="-10" width="30" height="20" rx="2" fill="#E2E8F0" />
          <line x1="-9" y1="-10" x2="-9" y2="10" />
          <line x1="-3" y1="-10" x2="-3" y2="10" />
          <line x1="3" y1="-10" x2="3" y2="10" />
          <line x1="9" y1="-10" x2="9" y2="10" />
        </g>
      );
    case 'parking':
      return (
        <g transform={`translate(0, 20)`} stroke={iconColor} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="0" cy="0" r="12" fill="#FEF3C7" />
          <line x1="-8" y1="-8" x2="8" y2="8" stroke="#F59E0B" strokeWidth="2" />
          <line x1="8" y1="-8" x2="-8" y2="8" stroke="#F59E0B" strokeWidth="2" />
        </g>
      );
    case 'go-to-jail':
      return (
        <g transform={`translate(0, 15)`} stroke="#E53E3E" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="0,-12 10,-4 6,8 -6,8 -10,-4" fill="#FEE2E2" />
          <line x1="0" y1="-6" x2="0" y2="2" />
          <circle cx="0" cy="5" r="1" fill="#E53E3E" />
        </g>
      );
    case 'railroad':
      return (
        <g transform={`translate(${dx}, ${dy - 2})`} stroke="#2B6CB0" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="-14" y="-8" width="28" height="15" rx="2" fill="#EBF8FF" />
          <line x1="-14" y1="1" x2="14" y2="1" />
          <circle cx="-7" cy="7" r="2.5" fill="#2B6CB0" />
          <circle cx="7" cy="7" r="2.5" fill="#2B6CB0" />
          <rect x="-10" y="-5" width="6" height="4" rx="0.5" />
          <rect x="0" y="-5" width="6" height="4" rx="0.5" />
        </g>
      );
    case 'utility':
      if (tile.name.toLowerCase().includes('luz')) {
        return (
          <g transform={`translate(${dx}, ${dy})`} stroke="#D69E2E" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M-6,-4 a6,6 0 1,1 12,0 c0,3.3 -2.7,6 -3,8 h-6 c-.3,-2 -3,-4.7 -3,-8 z" fill="#FEFCBF" />
            <line x1="-3" y1="7" x2="3" y2="7" />
            <line x1="-2" y1="10" x2="2" y2="10" />
          </g>
        );
      } else {
        return (
          <g transform={`translate(${dx}, ${dy})`} stroke="#3182CE" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M0,-10 C0,-10 8,-2 8,3 A8,8 0 1,1 -8,3 C-8,-2 0,-10 0,-10 Z" fill="#EBF8FF" />
          </g>
        );
      }
    case 'chance':
      return (
        <g transform={`translate(${dx}, ${dy})`} stroke="#805AD5" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="-3" cy="-3" r="5" fill="#FAF5FF" />
          <line x1="1" y1="1" x2="9" y2="9" strokeWidth="2.5" />
        </g>
      );
    case 'chest':
      return (
        <g transform={`translate(${dx}, ${dy})`} stroke="#319795" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="-11" y="-7" width="22" height="14" rx="1" fill="#E6FFFA" />
          <path d="M-11,-2 L11,-2" />
          <circle cx="0" cy="-2" r="1.5" fill="#319795" />
        </g>
      );
    case 'tax':
      return (
        <g transform={`translate(${dx}, ${dy})`} stroke="#E53E3E" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="-10" y="-8" width="20" height="14" rx="1" fill="#FFF5F5" />
          <circle cx="0" cy="-1" r="4" fill="none" />
          <text x="0" y="2.5" textAnchor="middle" fontSize="8" fill="#E53E3E" stroke="none" fontWeight="bold">S/</text>
        </g>
      );
    default:
      return null;
  }
};
export default TileIcon;
