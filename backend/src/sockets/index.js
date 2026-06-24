const { registerRoomHandlers } = require('./roomHandlers');
const { registerGameHandlers } = require('./gameHandlers');
const { registerChatHandlers } = require('./chatHandlers');

function initSockets(io) {
  io.on('connection', (socket) => {
    console.log(`Conectado: ${socket.id}`);

    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);
    registerChatHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`Desconectado: ${socket.id}`);
    });
  });
}

module.exports = { initSockets };
