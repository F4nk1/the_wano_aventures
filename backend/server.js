const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { initDb, dbRun, dbGet } = require('./db');
const { router: authRouter } = require('./auth');
const { BOARD_TILES, CHANCE_CARDS, CHEST_CARDS } = require('./boardData');

const app = express();
app.use(cors());
app.use(express.json());

// API Auth Routes
app.use('/api/auth', authRouter);

// Basic check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor del Monopolio corriendo.' });
});

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 4000;

// Memory storage for live games
// Maps roomCode -> GameState
const activeGames = new Map();

// Helper to generate a random 4-letter uppercase code
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Make sure it's unique in memory
  if (activeGames.has(code)) {
    return generateRoomCode();
  }
  return code;
}

// Helper to initialize a new game state
function createInitialGameState(roomCode, creator) {
  // Deep clone BOARD_TILES so each game has its own board state
  const board = BOARD_TILES.map(tile => ({
    ...tile,
    owner: null,
    houses: 0,
    mortgaged: false
  }));

  return {
    roomCode,
    creator,
    players: [], // { username, socketId, cash: 1500, position: 0, inJail: false, jailTurns: 0, isBankrupt: false, color: string }
    board,
    turnIndex: 0,
    status: 'lobby', // 'lobby' | 'playing' | 'ended'
    log: [`Sala creada por ${creator}.`],
    dice: [1, 1],
    hasRolled: false,
    doubleRollCount: 0,
    currentPlayerAction: null, // Track if player needs to make a decision (e.g. 'buy_or_auction', 'jail_decision')
    saved: false
  };
}

// Assign unique color to players
const PLAYER_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

// Socket.io connections
io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);

  // Create room
  socket.on('createRoom', ({ username }) => {
    if (!username) return;
    const roomCode = generateRoomCode();
    const gameState = createInitialGameState(roomCode, username);
    
    // Add creator as player
    gameState.players.push({
      username,
      socketId: socket.id,
      cash: 1500,
      position: 0,
      inJail: false,
      jailTurns: 0,
      isBankrupt: false,
      color: PLAYER_COLORS[0]
    });

    activeGames.set(roomCode, gameState);
    socket.join(roomCode);
    
    socket.emit('roomCreated', { roomCode, gameState });
    console.log(`Sala creada: ${roomCode} por ${username}`);
  });

  // Join room
  socket.on('joinRoom', ({ username, roomCode }) => {
    if (!username || !roomCode) return;
    const code = roomCode.toUpperCase();
    const game = activeGames.get(code);

    if (!game) {
      return socket.emit('errorMsg', 'La sala no existe o ha expirado.');
    }

    if (game.status !== 'lobby') {
      // If playing, check if player is reconnecting
      const existingPlayer = game.players.find(p => p.username === username);
      if (existingPlayer) {
        existingPlayer.socketId = socket.id;
        socket.join(code);
        socket.emit('roomJoined', { roomCode: code, gameState: game });
        io.to(code).emit('gameUpdated', game);
        game.log.push(`${username} se ha reconectado.`);
        io.to(code).emit('logUpdated', game.log);
        return;
      } else {
        return socket.emit('errorMsg', 'La partida ya comenzó.');
      }
    }

    // Check if username is already taken in the room
    if (game.players.some(p => p.username === username)) {
      return socket.emit('errorMsg', 'Ese nombre de usuario ya está en uso en esta sala.');
    }

    if (game.players.length >= 6) {
      return socket.emit('errorMsg', 'La sala está llena (máximo 6 jugadores).');
    }

    // Add player
    const playerColor = PLAYER_COLORS[game.players.length % PLAYER_COLORS.length];
    game.players.push({
      username,
      socketId: socket.id,
      cash: 1500,
      position: 0,
      inJail: false,
      jailTurns: 0,
      isBankrupt: false,
      color: playerColor
    });

    socket.join(code);
    game.log.push(`${username} se ha unido a la sala.`);
    
    io.to(code).emit('roomJoined', { roomCode: code, gameState: game });
    io.to(code).emit('gameUpdated', game);
    console.log(`${username} se unió a sala ${code}`);
  });

  // Start game
  socket.on('startGame', ({ roomCode }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    if (game.players.length < 2) {
      return socket.emit('errorMsg', 'Se necesitan al menos 2 jugadores para comenzar.');
    }

    game.status = 'playing';
    game.turnIndex = 0;
    game.log.push(`¡La partida ha comenzado! Turno de ${game.players[0].username}.`);
    
    io.to(roomCode).emit('gameUpdated', game);
  });

  // Roll Dice
  socket.on('rollDice', ({ roomCode }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const currentPlayer = game.players[game.turnIndex];
    if (currentPlayer.socketId !== socket.id) {
      return socket.emit('errorMsg', 'No es tu turno.');
    }

    if (game.hasRolled) {
      return socket.emit('errorMsg', 'Ya tiraste los dados en este turno.');
    }

    // Roll dice (1-6)
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;
    game.dice = [die1, die2];
    
    const isDouble = die1 === die2;
    game.log.push(`${currentPlayer.username} sacó ${die1} y ${die2} (Total: ${total}).`);

    // Handle double roll and jail count
    if (isDouble) {
      game.doubleRollCount += 1;
      if (game.doubleRollCount === 3) {
        game.log.push(`¡${currentPlayer.username} sacó doble tres veces seguidas! Va directo a la comisaría.`);
        currentPlayer.inJail = true;
        currentPlayer.position = 10; // Jail position
        game.hasRolled = true; // Ends roll phase
        game.doubleRollCount = 0;
        io.to(roomCode).emit('gameUpdated', game);
        return;
      }
    } else {
      game.doubleRollCount = 0;
    }

    // Handle jail logic
    if (currentPlayer.inJail) {
      if (isDouble) {
        currentPlayer.inJail = false;
        currentPlayer.jailTurns = 0;
        game.log.push(`¡${currentPlayer.username} sacó dobles y sale libre de la comisaría!`);
      } else {
        currentPlayer.jailTurns += 1;
        if (currentPlayer.jailTurns >= 3) {
          currentPlayer.inJail = false;
          currentPlayer.jailTurns = 0;
          currentPlayer.cash -= 50;
          game.log.push(`¡${currentPlayer.username} pagó fianza obligatoria de 50 soles por estar 3 turnos encerrado y sale libre!`);
        } else {
          game.log.push(`${currentPlayer.username} sigue detenido (Intento ${currentPlayer.jailTurns}/3).`);
          game.hasRolled = true;
          io.to(roomCode).emit('gameUpdated', game);
          return;
        }
      }
    }

    // Move player
    const oldPos = currentPlayer.position;
    currentPlayer.position = (oldPos + total) % 40;

    // Check if player passed GO (Paradero Inicial)
    if (currentPlayer.position < oldPos && !currentPlayer.inJail) {
      currentPlayer.cash += 200;
      game.log.push(`${currentPlayer.username} pasó por el Paradero Inicial y cobró 200 soles.`);
    }

    const currentTile = game.board[currentPlayer.position];
    game.log.push(`${currentPlayer.username} cayó en ${currentTile.name}.`);

    // Process landing tile effects
    processLandingTile(game, currentPlayer, currentTile);

    // If it's a double roll, the player can roll again (unless they ended up in jail or bankrupt)
    if (isDouble && !currentPlayer.inJail && !currentPlayer.isBankrupt && game.currentPlayerAction === null) {
      game.hasRolled = false; // Allow rolling again
      game.log.push(`¡Al sacar dobles, ${currentPlayer.username} tiene otro tiro!`);
    } else {
      game.hasRolled = true;
    }

    io.to(roomCode).emit('gameUpdated', game);
  });

  // Action: Buy Property
  socket.on('buyProperty', ({ roomCode }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const currentPlayer = game.players[game.turnIndex];
    if (currentPlayer.socketId !== socket.id) return;

    if (game.currentPlayerAction !== 'buy_or_auction') return;

    const currentTile = game.board[currentPlayer.position];
    if (currentPlayer.cash < currentTile.price) {
      return socket.emit('errorMsg', 'No tienes suficiente efectivo.');
    }

    // Buy process
    currentPlayer.cash -= currentTile.price;
    currentTile.owner = currentPlayer.username;
    game.log.push(`${currentPlayer.username} compró ${currentTile.name} por ${currentTile.price} soles.`);
    
    game.currentPlayerAction = null;
    io.to(roomCode).emit('gameUpdated', game);
  });

  // Action: Decline Buy
  socket.on('declineProperty', ({ roomCode }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const currentPlayer = game.players[game.turnIndex];
    if (currentPlayer.socketId !== socket.id) return;

    if (game.currentPlayerAction !== 'buy_or_auction') return;

    const currentTile = game.board[currentPlayer.position];
    game.log.push(`${currentPlayer.username} decidió no comprar ${currentTile.name}.`);

    game.currentPlayerAction = null;
    io.to(roomCode).emit('gameUpdated', game);
  });

  // Action: Build House / Hotel
  socket.on('buildHouse', ({ roomCode, tileId }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const currentPlayer = game.players.find(p => p.socketId === socket.id);
    if (!currentPlayer) return;

    const tile = game.board[tileId];
    if (tile.owner !== currentPlayer.username) {
      return socket.emit('errorMsg', 'No eres dueño de esta propiedad.');
    }

    if (tile.mortgaged) {
      return socket.emit('errorMsg', 'La propiedad está hipotecada.');
    }

    // Verify player owns all properties of the color group (Monopoly)
    const colorGroup = tile.group;
    const sameGroupProperties = game.board.filter(t => t.group === colorGroup);
    const ownsAll = sameGroupProperties.every(t => t.owner === currentPlayer.username);

    if (!ownsAll) {
      return socket.emit('errorMsg', 'Debes poseer todas las propiedades de este color para poder edificar.');
    }

    // Check if any property in the group is mortgaged
    if (sameGroupProperties.some(t => t.mortgaged)) {
      return socket.emit('errorMsg', 'No puedes edificar si hay propiedades hipotecadas en este grupo.');
    }

    if (tile.houses >= 5) {
      return socket.emit('errorMsg', 'Ya has construido un hotel (máximo).');
    }

    // Check money
    if (currentPlayer.cash < tile.housePrice) {
      return socket.emit('errorMsg', 'No tienes suficiente efectivo para edificar.');
    }

    // Build
    currentPlayer.cash -= tile.housePrice;
    tile.houses += 1;
    const buildType = tile.houses === 5 ? 'un Hotel' : `una estera (Casa ${tile.houses})`;
    game.log.push(`${currentPlayer.username} construyó ${buildType} en ${tile.name} por ${tile.housePrice} soles.`);

    io.to(roomCode).emit('gameUpdated', game);
  });

  // Action: Mortgage Property
  socket.on('mortgageProperty', ({ roomCode, tileId }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const currentPlayer = game.players.find(p => p.socketId === socket.id);
    if (!currentPlayer) return;

    const tile = game.board[tileId];
    if (tile.owner !== currentPlayer.username) return;

    if (tile.mortgaged) return;

    if (tile.houses > 0) {
      return socket.emit('errorMsg', 'Debes vender todas las construcciones antes de hipotecar.');
    }

    tile.mortgaged = true;
    currentPlayer.cash += tile.mortgageValue;
    game.log.push(`${currentPlayer.username} hipotecó ${tile.name} y obtuvo ${tile.mortgageValue} soles.`);

    io.to(roomCode).emit('gameUpdated', game);
  });

  // Action: Unmortgage Property
  socket.on('unmortgageProperty', ({ roomCode, tileId }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const currentPlayer = game.players.find(p => p.socketId === socket.id);
    if (!currentPlayer) return;

    const tile = game.board[tileId];
    if (tile.owner !== currentPlayer.username) return;

    if (!tile.mortgaged) return;

    const unmortgageCost = Math.round(tile.mortgageValue * 1.1); // 10% interest
    if (currentPlayer.cash < unmortgageCost) {
      return socket.emit('errorMsg', 'No tienes suficiente efectivo para deshipotecar.');
    }

    tile.mortgaged = false;
    currentPlayer.cash -= unmortgageCost;
    game.log.push(`${currentPlayer.username} pagó la hipoteca de ${tile.name} por ${unmortgageCost} soles.`);

    io.to(roomCode).emit('gameUpdated', game);
  });

  // Action: Pay out of Jail (Fine)
  socket.on('payJailFine', ({ roomCode }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const currentPlayer = game.players[game.turnIndex];
    if (currentPlayer.socketId !== socket.id) return;

    if (!currentPlayer.inJail) return;

    if (currentPlayer.cash < 50) {
      return socket.emit('errorMsg', 'No tienes 50 soles para pagar la fianza.');
    }

    currentPlayer.cash -= 50;
    currentPlayer.inJail = false;
    currentPlayer.jailTurns = 0;
    game.log.push(`${currentPlayer.username} pagó una coima/fianza de 50 soles al Serenazgo y salió libre.`);
    
    io.to(roomCode).emit('gameUpdated', game);
  });

  // Action: End Turn
  socket.on('endTurn', ({ roomCode }) => {
    const game = activeGames.get(roomCode);
    if (!roomCode || !game) return;

    const currentPlayer = game.players[game.turnIndex];
    if (currentPlayer.socketId !== socket.id) return;

    if (!game.hasRolled) {
      return socket.emit('errorMsg', 'Debes tirar los dados antes de terminar tu turno.');
    }

    if (game.currentPlayerAction !== null) {
      return socket.emit('errorMsg', 'Debes resolver la acción actual antes de terminar tu turno.');
    }

    // Move to next player (skip bankrupt players)
    let nextIndex = game.turnIndex;
    do {
      nextIndex = (nextIndex + 1) % game.players.length;
    } while (game.players[nextIndex].isBankrupt && nextIndex !== game.turnIndex);

    game.turnIndex = nextIndex;
    game.hasRolled = false;
    game.doubleRollCount = 0;
    game.log.push(`Turno de ${game.players[game.turnIndex].username}.`);

    io.to(roomCode).emit('gameUpdated', game);
  });

  // Action: Save Game to DB
  socket.on('saveGame', async ({ roomCode }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    try {
      const stateStr = JSON.stringify(game);
      // Check if it exists in SQLite
      const existing = await dbGet('SELECT id FROM games WHERE room_code = ?', [roomCode]);
      
      if (existing) {
        await dbRun(
          'UPDATE games SET game_state = ?, updated_at = CURRENT_TIMESTAMP WHERE room_code = ?',
          [stateStr, roomCode]
        );
      } else {
        await dbRun(
          'INSERT INTO games (room_code, game_state) VALUES (?, ?)',
          [roomCode, stateStr]
        );
      }

      game.saved = true;
      game.log.push(`Partida guardada exitosamente en la base de datos local.`);
      io.to(roomCode).emit('gameUpdated', game);
      socket.emit('infoMsg', 'La partida se guardó correctamente.');
    } catch (err) {
      console.error('Error saving game:', err);
      socket.emit('errorMsg', 'Error al guardar la partida en el servidor.');
    }
  });

  // Action: Load Game from DB
  socket.on('loadGame', async ({ roomCode, username }) => {
    if (!roomCode) return;
    const code = roomCode.toUpperCase();

    try {
      const row = await dbGet('SELECT game_state FROM games WHERE room_code = ?', [code]);
      if (!row) {
        return socket.emit('errorMsg', `No se encontró ninguna partida guardada con el código: ${code}`);
      }

      const savedGame = JSON.parse(row.game_state);
      
      // Update players sockets
      const player = savedGame.players.find(p => p.username === username);
      if (player) {
        player.socketId = socket.id;
      }

      // Restore game state in active games mapping
      activeGames.set(code, savedGame);
      socket.join(code);

      savedGame.log.push(`Partida recuperada por ${username}.`);
      socket.emit('roomJoined', { roomCode: code, gameState: savedGame });
      io.to(code).emit('gameUpdated', savedGame);
      console.log(`Partida cargada exitosamente: ${code}`);
    } catch (err) {
      console.error('Error loading game:', err);
      socket.emit('errorMsg', 'Error al recuperar la partida.');
    }
  });

  // Action: Declare Bankruptcy
  socket.on('declareBankrupt', ({ roomCode }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const player = game.players.find(p => p.socketId === socket.id);
    if (!player) return;

    player.isBankrupt = true;
    player.cash = 0;
    game.log.push(`💥 ¡${player.username} se ha declarado en BANCARROTA!`);

    // Free all their properties
    game.board.forEach(tile => {
      if (tile.owner === player.username) {
        tile.owner = null;
        tile.houses = 0;
        tile.mortgaged = false;
      }
    });

    // Check if game is over (only 1 player remains not bankrupt)
    const activePlayers = game.players.filter(p => !p.isBankrupt);
    if (activePlayers.length === 1) {
      game.status = 'ended';
      game.log.push(`🏆 ¡Tenemos un ganador! Felicitaciones a ${activePlayers[0].username} por adueñarse de todo el Perú.`);
    } else {
      // If it was their turn, pass turn automatically
      if (game.players[game.turnIndex].username === player.username) {
        game.currentPlayerAction = null;
        game.hasRolled = true;
        // The user can now press 'End Turn' or we can advance it
      }
    }

    io.to(roomCode).emit('gameUpdated', game);
  });

  // Action: Chat Message
  socket.on('chatMessage', ({ roomCode, username, text }) => {
    if (!roomCode || !username || !text) return;
    io.to(roomCode).emit('newChatMessage', { username, text, timestamp: new Date().toLocaleTimeString() });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.id}`);
    // Find rooms containing the player and log their disconnection
    for (const [roomCode, game] of activeGames.entries()) {
      const player = game.players.find(p => p.socketId === socket.id);
      if (player) {
        game.log.push(`${player.username} se ha desconectado. Esperando reconexión.`);
        io.to(roomCode).emit('gameUpdated', game);
        break;
      }
    }
  });
});

// Process Landing Tile Effects
function processLandingTile(game, player, tile) {
  // 1. Property / Railroad / Utility
  if (tile.type === 'property' || tile.type === 'railroad' || tile.type === 'utility') {
    if (tile.owner === null) {
      // Offer for purchase
      game.currentPlayerAction = 'buy_or_auction';
    } else if (tile.owner === player.username) {
      // Landed on own property
      game.log.push(`Es propiedad de ${player.username}. No paga alquiler.`);
    } else {
      // Check if mortgaged
      if (tile.mortgaged) {
        game.log.push(`${tile.name} está hipotecada. No se paga alquiler.`);
        return;
      }

      // Calculate rent
      let rentToPay = 0;
      const ownerObj = game.players.find(p => p.username === tile.owner);
      if (!ownerObj || ownerObj.isBankrupt) return;

      if (tile.type === 'property') {
        // Base or Houses rent
        rentToPay = tile.rent[tile.houses];
        // If owner owns all colors in group and 0 houses, rent is doubled
        if (tile.houses === 0) {
          const sameGroup = game.board.filter(t => t.group === tile.group);
          const ownsAll = sameGroup.every(t => t.owner === tile.owner);
          if (ownsAll) {
            rentToPay *= 2;
            game.log.push(`¡El dueño posee todo el grupo! El alquiler se duplica a ${rentToPay} soles.`);
          }
        }
      } else if (tile.type === 'railroad') {
        // Rent based on number of railroads owned
        const ownedRailroads = game.board.filter(t => t.group === 'transport' && t.owner === tile.owner).length;
        rentToPay = tile.rent[ownedRailroads - 1] || 25;
      } else if (tile.type === 'utility') {
        // Utility rent based on dice roll
        const ownedUtilities = game.board.filter(t => t.group === 'utility' && t.owner === tile.owner).length;
        const rollTotal = game.dice[0] + game.dice[1];
        const multiplier = ownedUtilities === 2 ? 10 : 4;
        rentToPay = rollTotal * multiplier;
        game.log.push(`El cobro es de ${multiplier} veces los dados (${rollTotal} x ${multiplier}).`);
      }

      // Pay rent
      player.cash -= rentToPay;
      ownerObj.cash += rentToPay;
      game.log.push(`${player.username} pagó ${rentToPay} soles de alquiler a ${tile.owner}.`);

      // Bankrupt protection (check if negative)
      if (player.cash < 0) {
        game.log.push(`💥 ¡${player.username} no tiene dinero suficiente! Está al borde de la bancarrota.`);
      }
    }
  }

  // 2. Chance (Suerte)
  else if (tile.type === 'chance') {
    const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
    game.log.push(`Carta de Suerte: "${card.text}"`);
    executeCardAction(game, player, card);
  }

  // 3. Chest (Caja de Comunidad)
  else if (tile.type === 'chest') {
    const card = CHEST_CARDS[Math.floor(Math.random() * CHEST_CARDS.length)];
    game.log.push(`Bono Yanapay (Caja): "${card.text}"`);
    executeCardAction(game, player, card);
  }

  // 4. Tax (Impuestos / Serenazgo)
  else if (tile.type === 'tax') {
    player.cash -= tile.cost;
    game.log.push(`${player.username} pagó ${tile.cost} soles a la banca.`);
    if (player.cash < 0) {
      game.log.push(`💥 ¡${player.username} está al borde de la bancarrota por deudas de impuestos!`);
    }
  }

  // 5. Go To Jail (Calabozo)
  else if (tile.type === 'go-to-jail') {
    player.inJail = true;
    player.position = 10; // Jail position
    game.log.push(`👮 ¡Al calabozo! ${player.username} va retenido a la comisaría.`);
    game.hasRolled = true; // Prevents moving again this turn
  }
}

// Card Actions helper
function executeCardAction(game, player, card) {
  if (card.action === 'receive') {
    player.cash += card.value;
  } else if (card.action === 'pay') {
    player.cash -= card.value;
    if (player.cash < 0) {
      game.log.push(`💥 ¡${player.username} está al borde de la bancarrota por deudas de tarjeta/tarifa!`);
    }
  } else if (card.action === 'go-to-tile') {
    const oldPos = player.position;
    player.position = card.value;
    // Handle passing start
    if (player.position < oldPos) {
      player.cash += 200;
      game.log.push(`${player.username} cobró 200 soles por pasar por el Paradero Inicial.`);
    }
    const currentTile = game.board[player.position];
    processLandingTile(game, player, currentTile);
  } else if (card.action === 'go-to-jail') {
    player.inJail = true;
    player.position = 10;
    game.hasRolled = true;
  }
}

// Serve static frontend in production
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  }
});

// Start Server
server.listen(PORT, async () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  // Initialize Database
  await initDb();
});
