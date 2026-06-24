const { activeGames } = require('../game/state');
const { movePlayerSteps, processLandingTile } = require('../game/movement');
const { startPropertyAuction, placeBid, passBid } = require('../game/auction');
const { proposeTrade, acceptTrade, declineTrade } = require('../game/trade');
const { buildHouse, sellHouse, mortgageProperty, unmortgageProperty } = require('../game/building');
const { applySolidarityCheck, getJailFineCost } = require('../game/passives');
const { triggerCrisisEvent } = require('../game/crisis');

function registerGameHandlers(io, socket) {
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

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;
    game.dice = [die1, die2];
    
    const isDouble = die1 === die2;
    game.log.push(`DADOS: ${currentPlayer.username} saco ${die1} y ${die2} (Total: ${total}).`);

    if (isDouble) {
      game.doubleRollCount += 1;
      if (game.doubleRollCount === 3) {
        game.log.push(`JAIL: ${currentPlayer.username} saco dobles 3 veces seguidas. Al calabozo.`);
        currentPlayer.inJail = true;
        currentPlayer.position = 10; // Jail is Node 10
        game.hasRolled = true;
        game.doubleRollCount = 0;
        io.to(roomCode).emit('gameUpdated', game);
        return;
      }
    } else {
      game.doubleRollCount = 0;
    }

    // Handle jail logic
    if (currentPlayer.inJail) {
      // First check if they have a get-out-of-jail free card and want/can use it
      // Let's check if they have a card, if so, they use it automatically to get out before rolling
      if (currentPlayer.jailFreeCards > 0) {
        currentPlayer.jailFreeCards -= 1;
        currentPlayer.inJail = false;
        currentPlayer.jailTurns = 0;
        game.log.push(`JAIL: ${currentPlayer.username} uso una tarjeta libre de comisaria para salir gratis.`);
      } else if (isDouble) {
        currentPlayer.inJail = false;
        currentPlayer.jailTurns = 0;
        game.log.push(`JAIL: ${currentPlayer.username} saco dobles y sale libre de la comisaria.`);
      } else {
        currentPlayer.jailTurns += 1;
        const fine = getJailFineCost(currentPlayer);
        if (currentPlayer.jailTurns >= 3) {
          currentPlayer.inJail = false;
          currentPlayer.jailTurns = 0;
          currentPlayer.cash -= fine;
          game.log.push(`JAIL: Fianza obligatoria de S/. ${fine} pagada por ${currentPlayer.username} tras estar 3 turnos encerrado.`);
          applySolidarityCheck(game, currentPlayer);
        } else {
          game.log.push(`JAIL: ${currentPlayer.username} sigue detenido (Intento ${currentPlayer.jailTurns}/3).`);
          game.hasRolled = true;
          io.to(roomCode).emit('gameUpdated', game);
          return;
        }
      }
    }

    game.rollCount += 1;
    if (game.rollCount % 8 === 0) {
      triggerCrisisEvent(game);
    }

    // Direct movement
    movePlayerSteps(game, currentPlayer, total);

    const currentTile = game.board.find(t => t.id === currentPlayer.position);
    game.log.push(`TABLERO: ${currentPlayer.username} llego a ${currentTile.name}.`);
    processLandingTile(game, currentPlayer, currentTile);

    if (isDouble && !currentPlayer.inJail && !currentPlayer.isBankrupt && game.currentPlayerAction === null) {
      game.hasRolled = false;
      game.log.push(`DADOS: ${currentPlayer.username} repite tiro por sacar dobles.`);
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

    const currentTile = game.board.find(t => t.id === currentPlayer.position);
    
    let price = currentTile.price;
    if (currentPlayer.characterClass === 'emprendedor') {
      price = Math.round(price * 0.85);
    }

    if (currentPlayer.cash < price) {
      return socket.emit('errorMsg', 'No tienes suficiente efectivo.');
    }

    currentPlayer.cash -= price;
    currentTile.owner = currentPlayer.username;
    game.log.push(`COMPRA: ${currentPlayer.username} compro ${currentTile.name} por S/. ${price} soles.`);
    
    game.currentPlayerAction = null;
    io.to(roomCode).emit('gameUpdated', game);
  });

  // Action: Decline Buy -> Triggers Auction
  socket.on('declineProperty', ({ roomCode }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const currentPlayer = game.players[game.turnIndex];
    if (currentPlayer.socketId !== socket.id) return;

    if (game.currentPlayerAction !== 'buy_or_auction') return;

    const currentTile = game.board.find(t => t.id === currentPlayer.position);
    game.log.push(`COMPRA: ${currentPlayer.username} decidio no comprar ${currentTile.name}.`);

    startPropertyAuction(game, currentTile.id);
    io.to(roomCode).emit('gameUpdated', game);
  });

  // Action: Pass Property -> Ignore and continue turn without auction
  socket.on('passProperty', ({ roomCode }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const currentPlayer = game.players[game.turnIndex];
    if (currentPlayer.socketId !== socket.id) return;

    if (game.currentPlayerAction !== 'buy_or_auction') return;

    const currentTile = game.board.find(t => t.id === currentPlayer.position);
    game.log.push(`COMPRA: ${currentPlayer.username} dejo pasar ${currentTile.name} sin subasta.`);

    game.currentPlayerAction = null;
    io.to(roomCode).emit('gameUpdated', game);
  });

  // Action: Bid in Auction
  socket.on('placeBid', ({ roomCode, bidAmount }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const success = placeBid(game, socket, bidAmount);
    if (success) {
      io.to(roomCode).emit('gameUpdated', game);
    }
  });

  // Action: Fold in Auction
  socket.on('passBid', ({ roomCode }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const success = passBid(game, socket);
    if (success) {
      io.to(roomCode).emit('gameUpdated', game);
    }
  });

  // Action: Propose P2P Trade
  socket.on('proposeTrade', ({ roomCode, receiver, offerCash, offerProperties, requestCash, requestProperties }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const success = proposeTrade(game, socket, { receiver, offerCash, offerProperties, requestCash, requestProperties });
    if (success) {
      io.to(roomCode).emit('gameUpdated', game);
    }
  });

  // Action: Accept P2P Trade
  socket.on('acceptTrade', ({ roomCode }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const success = acceptTrade(game, socket);
    if (success) {
      io.to(roomCode).emit('gameUpdated', game);
    }
  });

  // Action: Decline P2P Trade
  socket.on('declineTrade', ({ roomCode }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const success = declineTrade(game, socket);
    if (success) {
      io.to(roomCode).emit('gameUpdated', game);
    }
  });

  // Action: Build House / Hotel
  socket.on('buildHouse', ({ roomCode, tileId }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const success = buildHouse(game, socket, tileId);
    if (success) {
      io.to(roomCode).emit('gameUpdated', game);
    }
  });

  // Action: Sell House / Hotel
  socket.on('sellHouse', ({ roomCode, tileId }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const success = sellHouse(game, socket, tileId);
    if (success) {
      io.to(roomCode).emit('gameUpdated', game);
    }
  });

  // Action: Mortgage Property
  socket.on('mortgageProperty', ({ roomCode, tileId }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const success = mortgageProperty(game, socket, tileId);
    if (success) {
      io.to(roomCode).emit('gameUpdated', game);
    }
  });

  // Action: Unmortgage Property
  socket.on('unmortgageProperty', ({ roomCode, tileId }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const success = unmortgageProperty(game, socket, tileId);
    if (success) {
      io.to(roomCode).emit('gameUpdated', game);
    }
  });

  // Action: Pay Jail Fine
  socket.on('payJailFine', ({ roomCode }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const currentPlayer = game.players[game.turnIndex];
    if (currentPlayer.socketId !== socket.id) return;
    if (!currentPlayer.inJail) return;

    const fine = getJailFineCost(currentPlayer);
    if (currentPlayer.cash < fine) {
      return socket.emit('errorMsg', `No tienes S/. ${fine} para pagar la fianza.`);
    }

    currentPlayer.cash -= fine;
    currentPlayer.inJail = false;
    currentPlayer.jailTurns = 0;
    game.log.push(`JAIL: ${currentPlayer.username} pago fianza de S/. ${fine} y salio libre.`);
    
    applySolidarityCheck(game, currentPlayer);
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
      return socket.emit('errorMsg', 'Debes resolver la accion actual antes de terminar tu turno.');
    }

    if (currentPlayer.cash < 0) {
      return socket.emit('errorMsg', 'Tienes saldo negativo. Debes hipotecar propiedades, vender edificaciones o declararte en bancarrota para resolver tu deuda antes de terminar tu turno.');
    }

    if (game.activeCrisis) {
      game.activeCrisis.remainingTurns -= 1;
      if (game.activeCrisis.remainingTurns <= 0) {
        game.log.push(`CRISIS: El evento "${game.activeCrisis.name}" ha finalizado.`);
        game.activeCrisis = null;
      }
    }

    applySolidarityCheck(game, currentPlayer);

    // Pass turn
    let nextIndex = game.turnIndex;
    do {
      nextIndex = (nextIndex + 1) % game.players.length;
    } while (game.players[nextIndex].isBankrupt && nextIndex !== game.turnIndex);

    game.turnIndex = nextIndex;
    game.hasRolled = false;
    game.doubleRollCount = 0;
    game.log.push(`PARTIDA: Turno de ${game.players[game.turnIndex].username}.`);

    io.to(roomCode).emit('gameUpdated', game);
  });

  // Action: Declare Bankruptcy
  socket.on('declareBankruptcy', ({ roomCode }) => {
    const game = activeGames.get(roomCode);
    if (!game) return;

    const player = game.players.find(p => p.socketId === socket.id);
    if (!player || player.isBankrupt) return;

    player.isBankrupt = true;
    player.cash = 0;
    game.log.push(`QUIEBRA: ${player.username} se ha declarado en bancarrota.`);

    // Return properties to bank
    game.board.forEach(t => {
      if (t.owner === player.username) {
        t.owner = null;
        t.houses = 0;
        t.mortgaged = false;
      }
    });

    const activePlayers = game.players.filter(p => !p.isBankrupt);
    if (activePlayers.length === 1) {
      game.status = 'ended';
      game.log.push(`PARTIDA: @${activePlayers[0].username} es el ganador del juego!`);
    } else {
      // If it was their turn, pass turn automatically
      const currentTurnPlayer = game.players[game.turnIndex];
      if (currentTurnPlayer.username === player.username) {
        let nextIndex = game.turnIndex;
        do {
          nextIndex = (nextIndex + 1) % game.players.length;
        } while (game.players[nextIndex].isBankrupt && nextIndex !== game.turnIndex);
        game.turnIndex = nextIndex;
        game.hasRolled = false;
        game.doubleRollCount = 0;
        game.currentPlayerAction = null;
        game.log.push(`PARTIDA: Turno de ${game.players[game.turnIndex].username}.`);
      }
    }

    io.to(roomCode).emit('gameUpdated', game);
  });
}

module.exports = { registerGameHandlers };
