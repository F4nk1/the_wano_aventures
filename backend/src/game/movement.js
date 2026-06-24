const { GO_SALARY, JAIL_TILE_ID } = require('../config/constants');
const { applySolidarityCheck, getJailFineCost } = require('./passives');
const { CHANCE_CARDS } = require('../data/chanceCards');
const { CHEST_CARDS } = require('../data/chestCards');

// Simple loop step movement along the board
function movePlayerSteps(game, player, steps) {
  let currentPos = player.position;

  for (let i = 0; i < steps; i++) {
    const currentTile = game.board.find(t => t.id === currentPos);
    if (!currentTile) break;

    const nextPos = currentTile.next[0];

    // Passing GO (Paradero Inicial = Node 0)
    if (nextPos === 0) {
      player.cash += GO_SALARY;
      game.log.push(`MONEY: ${player.username} cobro S/. ${GO_SALARY} al pasar por el Paradero Inicial.`);
    }

    currentPos = nextPos;
  }

  player.position = currentPos;
  return true;
}

// Move player backwards N tiles (for move-back card action)
function movePlayerBack(game, player, steps) {
  let currentPos = player.position;

  // Move backwards by calculating new position on the circular 40-tile board
  let newPos = currentPos - steps;
  if (newPos < 0) {
    newPos = 40 + newPos; // Wrap around
  }

  player.position = newPos;
  return true;
}

function processLandingTile(game, player, tile) {
  const { executeCardAction } = require('./cards');
  if (tile.type === 'property' || tile.type === 'railroad' || tile.type === 'utility') {
    if (tile.owner === null) {
      game.currentPlayerAction = 'buy_or_auction';
    } else if (tile.owner === player.username) {
      game.log.push(`TABLERO: Es propiedad de ${player.username}.`);
    } else {
      if (tile.mortgaged) {
        game.log.push(`TABLERO: ${tile.name} esta hipotecada. Sin alquiler.`);
        return;
      }

      if (tile.type === 'railroad' && game.activeCrisis && game.activeCrisis.type === 'transport_strike') {
        game.log.push(`CRISIS: Huelga de transportes activa. Pasaje libre en ${tile.name}.`);
        return;
      }

      let rentToPay = 0;
      const ownerObj = game.players.find(p => p.username === tile.owner);
      if (!ownerObj || ownerObj.isBankrupt) return;

      if (tile.type === 'property') {
        rentToPay = tile.rent[tile.houses];
        if (tile.houses === 0) {
          const sameGroup = game.board.filter(t => t.group === tile.group);
          const ownsAll = sameGroup.every(t => t.owner === tile.owner);
          if (ownsAll) {
            rentToPay *= 2;
            game.log.push(`TABLERO: Alquiler base duplicado por poseer el monopolio del color.`);
          }
        }
      } else if (tile.type === 'railroad') {
        const ownedRailroads = game.board.filter(t => t.group === 'transport' && t.owner === tile.owner).length;
        rentToPay = tile.rent[ownedRailroads - 1] || 25;

        if (ownerObj.characterClass === 'cobrador') {
          rentToPay *= 2;
          game.log.push(`Habilidad: Cobrador de Combi duplica pasaje a S/. ${rentToPay}.`);
        }
      } else if (tile.type === 'utility') {
        if (game.activeCrisis && game.activeCrisis.type === 'water_cut') {
          game.log.push(`CRISIS: Corte de agua masivo activo. Servicio libre en ${tile.name}.`);
          return;
        }
        const ownedUtilities = game.board.filter(t => t.group === 'utility' && t.owner === tile.owner).length;
        const rollTotal = game.dice[0] + game.dice[1];
        const multiplier = ownedUtilities === 2 ? 10 : 4;
        rentToPay = rollTotal * multiplier;
      }

      if (game.activeCrisis && game.activeCrisis.type === 'inflation') {
        rentToPay *= 2;
        game.log.push(`CRISIS: Inflacion duplica el pago a S/. ${rentToPay}.`);
      }

      if (game.activeCrisis && game.activeCrisis.type === 'pandemic') {
        rentToPay = Math.round(rentToPay / 2);
        game.log.push(`CRISIS: Pandemia reduce el pago a la mitad: S/. ${rentToPay}.`);
      }

      if (game.activeCrisis && game.activeCrisis.type === 'copa' && (tile.group === 'yellow' || tile.group === 'red')) {
        rentToPay *= 3;
        game.log.push(`CRISIS: Copa America triplica el pago en zonas amarillas/rojas: S/. ${rentToPay}.`);
      }

      if (game.activeCrisis && game.activeCrisis.type === 'teacher_strike' && tile.group === 'pink') {
        rentToPay += 30;
        game.log.push(`CRISIS: Huelga de maestros agrega recargo de S/. 30 en zonas rosadas: S/. ${rentToPay}.`);
      }

      player.cash -= rentToPay;
      ownerObj.cash += rentToPay;
      game.log.push(`ALQUILER: ${player.username} pago S/. ${rentToPay} de alquiler a ${tile.owner}.`);

      applySolidarityCheck(game, player);
      if (player.cash < 0) {
        game.log.push(`BANCARROTA: ${player.username} esta en saldo negativo.`);
      }
    }
  }

  else if (tile.type === 'chance') {
    const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
    game.log.push(`SUERTE: Carta obtenida - "${card.text}"`);
    const result = executeCardAction(game, player, card);

    // Urraco character passive
    const urraco = game.players.find(p => p.characterClass === 'urraco' && !p.isBankrupt && p.username !== player.username);
    if (urraco) {
      const stolen = Math.min(player.cash, 50);
      if (stolen > 0) {
        player.cash -= stolen;
        urraco.cash += stolen;
        game.log.push(`Habilidad: Urraco de Magaly le cobro ampay de S/. ${stolen} a @${player.username}.`);
        applySolidarityCheck(game, player);
      }
    }

    if (result && result.landOnTile) {
      processLandingTile(game, player, result.landOnTile);
    }
  }

  else if (tile.type === 'chest') {
    const card = CHEST_CARDS[Math.floor(Math.random() * CHEST_CARDS.length)];
    game.log.push(`CAJA: Bono obtenido - "${card.text}"`);
    const result = executeCardAction(game, player, card);
    if (result && result.landOnTile) {
      processLandingTile(game, player, result.landOnTile);
    }
  }

  else if (tile.type === 'tax') {
    player.cash -= tile.cost;
    game.log.push(`IMPUESTOS: ${player.username} pago S/. ${tile.cost} de arbitrios.`);
    applySolidarityCheck(game, player);
    if (player.cash < 0) {
      game.log.push(`BANCARROTA: ${player.username} en quiebra por impuestos.`);
    }
  }

  // Go To Jail
  else if (tile.type === 'go-to-jail') {
    player.inJail = true;
    player.position = JAIL_TILE_ID;
    game.log.push(`JAIL: Te detuvo el Serenazgo. ${player.username} va a la comisaria.`);
    game.hasRolled = true; 
  }
}

module.exports = {
  movePlayerSteps,
  movePlayerBack,
  processLandingTile
};
