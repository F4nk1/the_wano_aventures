const { activeGames, generateRoomCode, createInitialGameState, createPlayer } = require('../game/state');
const { dbGet, dbRun } = require('../db/connection');

function registerRoomHandlers(io, socket) {
  // Create room
  socket.on('createRoom', ({ username, characterClass }) => {
    if (!username) return;
    const roomCode = generateRoomCode();
    const gameState = createInitialGameState(roomCode, username);
    
    const firstPlayer = createPlayer(username, socket.id, 0, characterClass);
    gameState.players.push(firstPlayer);

    activeGames.set(roomCode, gameState);
    socket.join(roomCode);
    socket.emit('roomCreated', { roomCode, gameState });
  });

  // Join room
  socket.on('joinRoom', ({ username, roomCode, characterClass }) => {
    if (!username || !roomCode) return;
    const code = roomCode.toUpperCase();
    const game = activeGames.get(code);

    if (!game) {
      return socket.emit('errorMsg', 'La sala no existe o ha expirado.');
    }

    if (game.status !== 'lobby') {
      const existingPlayer = game.players.find(p => p.username === username);
      if (existingPlayer) {
        existingPlayer.socketId = socket.id;
        socket.join(code);
        socket.emit('roomJoined', { roomCode: code, gameState: game });
        io.to(code).emit('gameUpdated', game);
        game.log.push(`${username} se ha reconectado.`);
        return;
      } else {
        return socket.emit('errorMsg', 'La partida ya comenzo.');
      }
    }

    if (game.players.some(p => p.username === username)) {
      return socket.emit('errorMsg', 'Nombre de usuario ya esta en uso.');
    }

    if (game.players.length >= 6) {
      return socket.emit('errorMsg', 'Sala llena (maximo 6 jugadores).');
    }

    const newPlayer = createPlayer(username, socket.id, game.players.length, characterClass);
    game.players.push(newPlayer);

    socket.join(code);
    game.log.push(`${username} se unio. Habilidad: ${characterClass || 'emprendedor'}.`);
    
    io.to(code).emit('roomJoined', { roomCode: code, gameState: game });
    io.to(code).emit('gameUpdated', game);
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
    game.log.push(`PARTIDA: Ha comenzado la partida. Turno de ${game.players[0].username}.`);
    io.to(roomCode).emit('gameUpdated', game);
  });

  // Save game
  socket.on('saveGame', async ({ roomCode }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    try {
      const stateStr = JSON.stringify(game);
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
      game.log.push(`SISTEMA: Partida guardada en la base de datos.`);
      io.to(roomCode).emit('gameUpdated', game);
      socket.emit('infoMsg', 'La partida se guardo correctamente.');
    } catch (err) {
      console.error(err);
      socket.emit('errorMsg', 'Error al guardar.');
    }
  });

  // Load game
  socket.on('loadGame', async ({ roomCode, username }) => {
    if (!roomCode) return;
    const code = roomCode.toUpperCase();

    try {
      const row = await dbGet('SELECT game_state FROM games WHERE room_code = ?', [code]);
      if (!row) {
        return socket.emit('errorMsg', `No se encontro partida con codigo: ${code}`);
      }

      const game = JSON.parse(row.game_state);
      const player = game.players.find(p => p.username === username);

      if (!player) {
        return socket.emit('errorMsg', 'No perteneces a esta partida.');
      }

      player.socketId = socket.id;
      activeGames.set(code, game);

      socket.join(code);
      game.log.push(`SISTEMA: @${username} cargo la partida y se reconecto.`);
      
      socket.emit('roomJoined', { roomCode: code, gameState: game });
      io.to(code).emit('gameUpdated', game);
    } catch (err) {
      console.error(err);
      socket.emit('errorMsg', 'Error al cargar la partida.');
    }
  });
}

module.exports = { registerRoomHandlers };
