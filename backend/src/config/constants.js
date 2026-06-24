// Game server configuration constants

const PORT = process.env.PORT || 4000;

const PLAYER_COLORS = [
  '#EF4444',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899'
];

const JWT_SECRET = process.env.JWT_SECRET || 'monopoly-secreto-perucho-123';

const MAX_PLAYERS = 6;
const STARTING_CASH = 1500;
const GO_SALARY = 200;
const JAIL_TILE_ID = 10;
const CRISIS_ROLL_INTERVAL = 8;

module.exports = {
  PORT,
  PLAYER_COLORS,
  JWT_SECRET,
  MAX_PLAYERS,
  STARTING_CASH,
  GO_SALARY,
  JAIL_TILE_ID,
  CRISIS_ROLL_INTERVAL
};
