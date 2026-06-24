const { applySolidarityCheck } = require('./passives');
const { movePlayerBack } = require('./movement');
const { JAIL_TILE_ID } = require('../config/constants');

// Railroad tile IDs on the board
const RAILROAD_TILE_IDS = [5, 15, 25, 35];
// Utility tile IDs on the board
const UTILITY_TILE_IDS = [12, 28];

// Execute a card action based on its type
// Supports: receive, pay, go-to-tile, go-to-jail, pay-all, receive-all,
// move-back, free-jail-card, steal, repair, nearest-railroad, nearest-utility, birthday
function executeCardAction(game, player, card) {
  if (card.action === 'receive') {
    player.cash += card.value;

  } else if (card.action === 'pay') {
    player.cash -= card.value;
    applySolidarityCheck(game, player);
    if (player.cash < 0) {
      game.log.push(`BANCARROTA: ${player.username} en saldo negativo.`);
    }

  } else if (card.action === 'go-to-tile') {
    const oldPos = player.position;
    player.position = card.value;
    if (player.position < oldPos) {
      player.cash += 200;
      game.log.push(`MONEY: ${player.username} cobro S/. 200 al pasar por el Paradero Inicial.`);
    }
    const currentTile = game.board.find(t => t.id === player.position);
    // Defer landing processing to caller via return value
    return { landOnTile: currentTile };

  } else if (card.action === 'go-to-jail') {
    player.inJail = true;
    player.position = JAIL_TILE_ID;
    game.hasRolled = true;

  } else if (card.action === 'pay-all') {
    // Player pays N to EACH other non-bankrupt player
    const otherPlayers = game.players.filter(p => p.username !== player.username && !p.isBankrupt);
    let totalPaid = 0;
    otherPlayers.forEach(p => {
      p.cash += card.value;
      totalPaid += card.value;
    });
    player.cash -= totalPaid;
    game.log.push(`CARTA: ${player.username} pago S/. ${card.value} a cada jugador (total: S/. ${totalPaid}).`);
    applySolidarityCheck(game, player);
    if (player.cash < 0) {
      game.log.push(`BANCARROTA: ${player.username} en saldo negativo.`);
    }

  } else if (card.action === 'receive-all') {
    // Player receives N from EACH other non-bankrupt player
    const otherPlayers = game.players.filter(p => p.username !== player.username && !p.isBankrupt);
    let totalReceived = 0;
    otherPlayers.forEach(p => {
      const amount = Math.min(p.cash, card.value);
      p.cash -= amount;
      totalReceived += amount;
      applySolidarityCheck(game, p);
    });
    player.cash += totalReceived;
    game.log.push(`CARTA: ${player.username} cobro S/. ${card.value} de cada jugador (total: S/. ${totalReceived}).`);

  } else if (card.action === 'move-back') {
    // Player moves backwards N tiles
    movePlayerBack(game, player, card.value);
    const landedTile = game.board.find(t => t.id === player.position);
    game.log.push(`CARTA: ${player.username} retrocedio ${card.value} casillas hasta ${landedTile.name}.`);
    return { landOnTile: landedTile };

  } else if (card.action === 'free-jail-card') {
    // Player gains a get-out-of-jail-free card
    player.jailFreeCards = (player.jailFreeCards || 0) + 1;
    game.log.push(`CARTA: ${player.username} obtuvo una tarjeta libre de comisaria. Tiene ${player.jailFreeCards} tarjeta(s).`);

  } else if (card.action === 'steal') {
    // Steals N from a random non-bankrupt opponent
    const targets = game.players.filter(p => p.username !== player.username && !p.isBankrupt && p.cash > 0);
    if (targets.length > 0) {
      const victim = targets[Math.floor(Math.random() * targets.length)];
      const stolen = Math.min(victim.cash, card.value);
      victim.cash -= stolen;
      player.cash += stolen;
      game.log.push(`CARTA: ${player.username} le robo S/. ${stolen} a ${victim.username}.`);
      applySolidarityCheck(game, victim);
    } else {
      game.log.push(`CARTA: ${player.username} no encontro a nadie a quien robar.`);
    }

  } else if (card.action === 'repair') {
    // Player pays N per house and M per hotel they own
    const perHouse = card.value.perHouse;
    const perHotel = card.value.perHotel;
    let totalCost = 0;
    game.board.forEach(t => {
      if (t.owner === player.username && t.houses > 0) {
        if (t.houses === 5) {
          totalCost += perHotel;
        } else {
          totalCost += t.houses * perHouse;
        }
      }
    });
    player.cash -= totalCost;
    game.log.push(`CARTA: ${player.username} pago S/. ${totalCost} en reparaciones.`);
    applySolidarityCheck(game, player);
    if (player.cash < 0) {
      game.log.push(`BANCARROTA: ${player.username} en saldo negativo.`);
    }

  } else if (card.action === 'nearest-railroad') {
    // Move to the nearest railroad tile and pay double rent if owned
    const currentPos = player.position;
    let nearestRailroad = null;
    let minDistance = Infinity;

    RAILROAD_TILE_IDS.forEach(rId => {
      // Calculate forward distance on circular board
      let dist = rId - currentPos;
      if (dist <= 0) dist += 40;
      if (dist < minDistance) {
        minDistance = dist;
        nearestRailroad = rId;
      }
    });

    const oldPos = player.position;
    player.position = nearestRailroad;
    // Check if passed GO
    if (nearestRailroad < oldPos) {
      player.cash += 200;
      game.log.push(`MONEY: ${player.username} cobro S/. 200 al pasar por el Paradero Inicial.`);
    }

    const railTile = game.board.find(t => t.id === nearestRailroad);
    game.log.push(`CARTA: ${player.username} fue al transporte mas cercano: ${railTile.name}.`);

    // If owned by another player, pay double rent
    if (railTile.owner && railTile.owner !== player.username && !railTile.mortgaged) {
      const ownerObj = game.players.find(p => p.username === railTile.owner);
      if (ownerObj && !ownerObj.isBankrupt) {
        const ownedRailroads = game.board.filter(t => t.group === 'transport' && t.owner === railTile.owner).length;
        let rent = (railTile.rent[ownedRailroads - 1] || 25) * 2;
        player.cash -= rent;
        ownerObj.cash += rent;
        game.log.push(`ALQUILER: ${player.username} pago S/. ${rent} (doble) a ${railTile.owner} por ${railTile.name}.`);
        applySolidarityCheck(game, player);
        if (player.cash < 0) {
          game.log.push(`BANCARROTA: ${player.username} en saldo negativo.`);
        }
      }
    } else if (!railTile.owner) {
      // Unowned: offer to buy
      return { landOnTile: railTile };
    }

  } else if (card.action === 'nearest-utility') {
    // Move to nearest utility and pay 10x dice roll if owned
    const currentPos = player.position;
    let nearestUtility = null;
    let minDistance = Infinity;

    UTILITY_TILE_IDS.forEach(uId => {
      let dist = uId - currentPos;
      if (dist <= 0) dist += 40;
      if (dist < minDistance) {
        minDistance = dist;
        nearestUtility = uId;
      }
    });

    const oldPos = player.position;
    player.position = nearestUtility;
    // Check if passed GO
    if (nearestUtility < oldPos) {
      player.cash += 200;
      game.log.push(`MONEY: ${player.username} cobro S/. 200 al pasar por el Paradero Inicial.`);
    }

    const utilTile = game.board.find(t => t.id === nearestUtility);
    game.log.push(`CARTA: ${player.username} fue al servicio mas cercano: ${utilTile.name}.`);

    // If owned by another player, pay 10x dice roll
    if (utilTile.owner && utilTile.owner !== player.username && !utilTile.mortgaged) {
      const ownerObj = game.players.find(p => p.username === utilTile.owner);
      if (ownerObj && !ownerObj.isBankrupt) {
        const rollTotal = game.dice[0] + game.dice[1];
        const rent = rollTotal * 10;
        player.cash -= rent;
        ownerObj.cash += rent;
        game.log.push(`ALQUILER: ${player.username} pago S/. ${rent} (10x dados) a ${utilTile.owner} por ${utilTile.name}.`);
        applySolidarityCheck(game, player);
        if (player.cash < 0) {
          game.log.push(`BANCARROTA: ${player.username} en saldo negativo.`);
        }
      }
    } else if (!utilTile.owner) {
      // Unowned: offer to buy
      return { landOnTile: utilTile };
    }

  } else if (card.action === 'birthday') {
    // Each player pays the current player N
    const otherPlayers = game.players.filter(p => p.username !== player.username && !p.isBankrupt);
    let totalReceived = 0;
    otherPlayers.forEach(p => {
      const amount = Math.min(p.cash, card.value);
      p.cash -= amount;
      totalReceived += amount;
      applySolidarityCheck(game, p);
    });
    player.cash += totalReceived;
    game.log.push(`CARTA: Feliz cumple! ${player.username} recibio S/. ${totalReceived} de todos los jugadores.`);
  }

  return null;
}

module.exports = { executeCardAction };
