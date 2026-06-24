// Passive abilities and character-specific mechanics

// Solidarity Passive - Organizador class ability
function applySolidarityCheck(game, targetPlayer) {
  if (targetPlayer.isBankrupt || targetPlayer.cash >= 100) return;

  const org = game.players.find(p => p.username === targetPlayer.username && p.characterClass === 'organizador');
  if (!org) return;

  game.log.push(`POLLADA: Habilidad de Organizador - ${targetPlayer.username} tiene menos de S/. 100 y organiza una pollada solidaria.`);

  game.players.forEach(p => {
    if (p.username !== targetPlayer.username && !p.isBankrupt) {
      const donation = Math.min(p.cash, 50);
      if (donation > 0) {
        p.cash -= donation;
        targetPlayer.cash += donation;
        game.log.push(`   * ${p.username} aporto S/. ${donation} a la chancha.`);
      }
    }
  });
}

// Jail fine cost - Tramitador class gets discount
function getJailFineCost(player) {
  return player.characterClass === 'tramitador' ? 25 : 50;
}

module.exports = {
  applySolidarityCheck,
  getJailFineCost
};
