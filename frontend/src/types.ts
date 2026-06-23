export interface Player {
  username: string;
  socketId: string;
  cash: number;
  position: number;
  inJail: boolean;
  jailTurns: number;
  isBankrupt: boolean;
  color: string;
}

export interface Tile {
  id: number;
  name: string;
  type: 'property' | 'railroad' | 'utility' | 'go' | 'tax' | 'chance' | 'chest' | 'jail' | 'parking' | 'go-to-jail';
  group?: string;
  price?: number;
  rent?: number[];
  housePrice?: number;
  mortgageValue?: number;
  description?: string;
  cost?: number;
  
  // Dynamic fields injected by the game loop
  owner: string | null;
  houses: number;
  mortgaged: boolean;
}

export interface GameState {
  roomCode: string;
  creator: string;
  players: Player[];
  board: Tile[];
  turnIndex: number;
  status: 'lobby' | 'playing' | 'ended';
  log: string[];
  dice: [number, number];
  hasRolled: boolean;
  doubleRollCount: number;
  currentPlayerAction: 'buy_or_auction' | 'jail_decision' | null;
  saved: boolean;
}

export interface ChatMessage {
  username: string;
  text: string;
  timestamp: string;
}
