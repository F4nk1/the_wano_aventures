export interface Player {
  username: string;
  socketId: string;
  cash: number;
  position: number;
  inJail: boolean;
  jailTurns: number;
  jailFreeCards: number;
  isBankrupt: boolean;
  color: string;
  characterClass: 'emprendedor' | 'cobrador' | 'tramitador' | 'urraco' | 'organizador';
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
  x: number;
  y: number;
  next: number[];
  owner: string | null;
  houses: number;
  mortgaged: boolean;
}

export interface AuctionState {
  tileId: number;
  highestBid: number;
  highestBidder: string | null;
  activeBidders: string[];
  bidderIndex: number;
}

export interface TradeOffer {
  sender: string;
  receiver: string;
  offerCash: number;
  offerProperties: number[];
  requestCash: number;
  requestProperties: number[];
}

export interface CrisisEvent {
  name: string;
  text: string;
  type: string;
  remainingTurns: number;
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
  currentPlayerAction: 'buy_or_auction' | 'auction_bidding' | null;
  auction: AuctionState | null;
  tradeOffer: TradeOffer | null;
  activeCrisis: CrisisEvent | null;
  rollCount: number;
  saved: boolean;
}
