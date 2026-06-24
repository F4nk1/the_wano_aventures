const { applySolidarityCheck } = require('./passives');

// Propose a P2P trade
function proposeTrade(game, socket, { receiver, offerCash, offerProperties, requestCash, requestProperties }) {
  const sender = game.players.find(p => p.socketId === socket.id);
  if (!sender) return false;

  const receiverObj = game.players.find(p => p.username === receiver);
  if (!receiverObj || receiverObj.isBankrupt) {
    socket.emit('errorMsg', 'El destinatario del trato no existe o esta en quiebra.');
    return false;
  }

  if (sender.cash < offerCash) {
    socket.emit('errorMsg', 'No tienes suficiente efectivo para ofrecer.');
    return false;
  }
  if (receiverObj.cash < requestCash) {
    socket.emit('errorMsg', 'El destinatario no cuenta con ese efectivo.');
    return false;
  }

  // Verify properties ownership
  const senderOwnsAll = offerProperties.every(id => game.board.find(t => t.id === id).owner === sender.username);
  const receiverOwnsAll = requestProperties.every(id => game.board.find(t => t.id === id).owner === receiver);

  if (!senderOwnsAll || !receiverOwnsAll) {
    socket.emit('errorMsg', 'Falla de propiedad. Revisa que posean las tarjetas a intercambiar.');
    return false;
  }

  game.tradeOffer = {
    sender: sender.username,
    receiver,
    offerCash,
    offerProperties,
    requestCash,
    requestProperties
  };

  game.log.push(`TRATO: @${sender.username} le propuso un intercambio a @${receiver}.`);
  return true;
}

// Accept a P2P trade
function acceptTrade(game, socket) {
  if (!game.tradeOffer) return false;

  const receiver = game.players.find(p => p.username === game.tradeOffer.receiver);
  if (!receiver || receiver.socketId !== socket.id) {
    socket.emit('errorMsg', 'No eres el destinatario de esta oferta.');
    return false;
  }

  const sender = game.players.find(p => p.username === game.tradeOffer.sender);
  if (!sender || sender.isBankrupt) {
    game.tradeOffer = null;
    socket.emit('errorMsg', 'El proponente ya no esta en la partida.');
    return true; // State changed (trade cleared)
  }

  // Recalculate cash constraints
  if (sender.cash < game.tradeOffer.offerCash || receiver.cash < game.tradeOffer.requestCash) {
    game.tradeOffer = null;
    socket.emit('errorMsg', 'Trato cancelado por falta de fondos.');
    return true; // State changed (trade cleared)
  }

  // Swap money
  sender.cash -= game.tradeOffer.offerCash;
  receiver.cash += game.tradeOffer.offerCash;

  receiver.cash -= game.tradeOffer.requestCash;
  sender.cash += game.tradeOffer.requestCash;

  // Swap properties
  game.tradeOffer.offerProperties.forEach(id => {
    const tile = game.board.find(t => t.id === id);
    tile.owner = receiver.username;
    tile.houses = 0; // reset houses on ownership change
  });

  game.tradeOffer.requestProperties.forEach(id => {
    const tile = game.board.find(t => t.id === id);
    tile.owner = sender.username;
    tile.houses = 0;
  });

  game.log.push(`TRATO: @${receiver.username} acepto la propuesta de @${sender.username}. Intercambio exitoso.`);
  game.tradeOffer = null;

  applySolidarityCheck(game, sender);
  applySolidarityCheck(game, receiver);
  return true;
}

// Decline a P2P trade
function declineTrade(game, socket) {
  if (!game.tradeOffer) return false;

  const receiver = game.players.find(p => p.username === game.tradeOffer.receiver);
  if (!receiver || receiver.socketId !== socket.id) return false;

  game.log.push(`TRATO: @${receiver.username} rechazo la propuesta de trato.`);
  game.tradeOffer = null;
  return true;
}

module.exports = {
  proposeTrade,
  acceptTrade,
  declineTrade
};
