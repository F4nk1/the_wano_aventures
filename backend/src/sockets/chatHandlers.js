const { activeGames } = require('../game/state');

function registerChatHandlers(io, socket) {
  socket.on('chatMessage', ({ roomCode, message }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const player = game.players.find(p => p.socketId === socket.id);
    if (!player) return;

    const chatMsg = {
      username: player.username,
      text: message,
      timestamp: new Date().toLocaleTimeString()
    };

    io.to(roomCode).emit('chatMessage', chatMsg);
  });
}

module.exports = { registerChatHandlers };
