const { BOARD_TILES } = require('../data/board');
const { PLAYER_COLORS, STARTING_CASH } = require('../config/constants');

// Memory storage for live games
const activeGames = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  if (activeGames.has(code)) {
    return generateRoomCode();
  }
  return code;
}

function createInitialGameState(roomCode, creator) {
  const board = BOARD_TILES.map(tile => ({
    ...tile,
    owner: null,
    houses: 0,
    mortgaged: false
  }));

  return {
    roomCode,
    creator,
    players: [],
    board,
    turnIndex: 0,
    status: 'lobby', // 'lobby' | 'playing' | 'ended'
    log: [`Sala creada por ${creator}.`],
    dice: [1, 1],
    hasRolled: false,
    doubleRollCount: 0,
    currentPlayerAction: null, // 'buy_or_auction' | 'auction_bidding' | null
    auction: null,
    tradeOffer: null,
    activeCrisis: null,
    rollCount: 0,
    saved: false
  };
}

function createPlayer(username, socketId, index, characterClass) {
  return {
    username,
    socketId,
    cash: STARTING_CASH,
    position: 0,
    inJail: false,
    jailTurns: 0,
    jailFreeCards: 0,
    isBankrupt: false,
    color: PLAYER_COLORS[index % PLAYER_COLORS.length],
    characterClass: characterClass || 'emprendedor'
  };
}

module.exports = {
  activeGames,
  generateRoomCode,
  createInitialGameState,
  createPlayer
};
