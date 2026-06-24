import React from 'react';

interface PlayerTokenProps {
  characterClass: string;
  color: string;
  size?: number;
}

export const PlayerToken: React.FC<PlayerTokenProps> = ({ characterClass, color, size = 30 }) => {
  const getIconPath = (cl: string) => {
    switch (cl) {
      case 'emprendedor': // Construction helmet
        return (
          <path d="M6 14.5a6 6 0 0 1 12 0v1H6v-1zm6-9.5v3.5m-3-2.5v2m6-2v2" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
        );
      case 'cobrador': // Microbus/combi
        return (
          <path d="M5 7h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zm2 10v2m10-2v2m-11-6h14m-12 3a1 1 0 1 0 0-2 1 0 0 0 0 2zm10 0a1 1 0 1 0 0-2 1 0 0 0 0 2z" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'tramitador': // Scales of justice
        return (
          <path d="M12 4v16m-7-5 7-2 7 2M5 11h14M8 11v5c0 1.5 1.5 2.5 4 2.5s4-1 4-2.5v-5" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'urraco': // Camera
        return (
          <path d="M19 16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2.5l1.5-2.5h2L14.5 7H17a2 2 0 0 1 2 2v7zm-7-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        );
      case 'organizador': // Roasted chicken/drumstick
        return (
          <path d="M12 4a3 3 0 0 1 3 3c0 2.5-3 5-3 5s-3-2.5-3-3a3 3 0 0 1 3-3zm0 8v5m-5-2.5h10M4 18h16" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        );
      default: // Traditional pawn
        return (
          <path d="M12 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-5 10a5 5 0 0 1 10 0H7z" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
        );
    }
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="drop-shadow-lg pointer-events-none animate-token-pop">
      <circle cx="12" cy="12" r="10" fill={color} stroke="#FFFFFF" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="10" fill="none" stroke="#000000" strokeWidth="0.5" opacity="0.3" />
      <g transform="translate(0, 0)">
        {getIconPath(characterClass)}
      </g>
    </svg>
  );
};
export default PlayerToken;
