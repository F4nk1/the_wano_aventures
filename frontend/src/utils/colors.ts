export const getGroupColorHex = (group?: string): string => {
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

export const getPlayerOffset = (playerIndex: number, totalPlayers: number): { dx: number; dy: number } => {
  if (totalPlayers <= 1) return { dx: 0, dy: 0 };
  const angle = (playerIndex * 2 * Math.PI) / totalPlayers;
  const radius = 12;
  return {
    dx: Math.cos(angle) * radius,
    dy: Math.sin(angle) * radius
  };
};
