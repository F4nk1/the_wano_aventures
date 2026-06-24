const { CRISIS_EVENTS } = require('../data/crisisEvents');
const { applySolidarityCheck } = require('./passives');
const { JAIL_TILE_ID } = require('../config/constants');

// Trigger random national crisis event
function triggerCrisisEvent(game) {
  const event = CRISIS_EVENTS[Math.floor(Math.random() * CRISIS_EVENTS.length)];
  game.log.push(`CRISIS: ${event.name} - ${event.text}`);

  game.activeCrisis = {
    name: event.name,
    text: event.text,
    type: event.type,
    remainingTurns: game.players.filter(p => !p.isBankrupt).length * 2
  };

  // Immediate effects based on crisis type
  if (event.type === 'raid') {
    game.players.forEach(p => {
      if (!p.isBankrupt && !p.inJail) {
        const currentTile = game.board.find(t => t.id === p.position);
        if (currentTile && (currentTile.group === 'brown' || currentTile.group === 'cyan')) {
          p.inJail = true;
          p.position = JAIL_TILE_ID;
          game.log.push(`   JAIL: ${p.username} fue retenido en ${currentTile.name} por redada municipal. Al calabozo.`);
        }
      }
    });
  }

  if (event.type === 'destruction') {
    let upgradedTiles = game.board.filter(t => t.houses > 0);
    if (upgradedTiles.length > 0) {
      upgradedTiles = upgradedTiles.sort(() => 0.5 - Math.random()).slice(0, 3);
      upgradedTiles.forEach(t => {
        t.houses -= 1;
        game.log.push(`   DANO: Se destruyo 1 estera en ${t.name}. Quedan ${t.houses}.`);
      });
    }
  }

  if (event.type === 'earthquake') {
    let upgradedTiles = game.board.filter(t => t.houses > 0);
    if (upgradedTiles.length > 0) {
      upgradedTiles = upgradedTiles.sort(() => 0.5 - Math.random()).slice(0, 5);
      upgradedTiles.forEach(t => {
        t.houses -= 1;
        game.log.push(`   DANO: Terremoto destruyo 1 estera en ${t.name}. Quedan ${t.houses}.`);
      });
    }
  }

  if (event.type === 'elections') {
    game.players.forEach(p => {
      if (!p.isBankrupt) {
        p.cash -= 50;
        game.log.push(`   ELECCIONES: ${p.username} pago S/. 50 por gastos electorales.`);
        applySolidarityCheck(game, p);
      }
    });
  }

  if (event.type === 'crypto_boom') {
    game.players.forEach(p => {
      if (!p.isBankrupt) {
        p.cash += 100;
        game.log.push(`   CRYPTO: ${p.username} recibio S/. 100 por inversiones.`);
      }
    });
  }

  if (event.type === 'teacher_strike') {
    game.players.forEach(p => {
      if (!p.isBankrupt) {
        const currentTile = game.board.find(t => t.id === p.position);
        if (currentTile && currentTile.group === 'pink') {
          p.cash -= 30;
          game.log.push(`   HUELGA: ${p.username} pago S/. 30 extra por estar en zona rosada.`);
          applySolidarityCheck(game, p);
        }
      }
    });
  }

  if (event.type === 'festival') {
    game.players.forEach(p => {
      if (!p.isBankrupt) {
        p.cash += 50;
        game.log.push(`   FESTIVAL: ${p.username} recibio S/. 50 de celebracion criolla.`);
      }
    });
  }
}

module.exports = { triggerCrisisEvent };
