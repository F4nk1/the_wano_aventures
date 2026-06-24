// Building management - build/sell houses and hotels, mortgage/unmortgage

function buildHouse(game, socket, tileId) {
  const currentPlayer = game.players.find(p => p.socketId === socket.id);
  if (!currentPlayer) return false;

  const tile = game.board.find(t => t.id === tileId);
  if (tile.owner !== currentPlayer.username) {
    socket.emit('errorMsg', 'No eres dueno de esta propiedad.');
    return false;
  }

  if (tile.mortgaged) {
    socket.emit('errorMsg', 'La propiedad esta hipotecada.');
    return false;
  }

  const colorGroup = tile.group;
  const sameGroupProperties = game.board.filter(t => t.group === colorGroup);
  const ownsAll = sameGroupProperties.every(t => t.owner === currentPlayer.username);

  if (!ownsAll) {
    socket.emit('errorMsg', 'Debes poseer todo el grupo para edificar.');
    return false;
  }

  if (sameGroupProperties.some(t => t.mortgaged)) {
    socket.emit('errorMsg', 'Hay propiedades hipotecadas en este grupo.');
    return false;
  }

  if (tile.houses >= 5) {
    socket.emit('errorMsg', 'Ya has construido el hotel.');
    return false;
  }

  // Even-building rule
  const currentHouses = tile.houses;
  const hasFewerHousesElsewhere = sameGroupProperties.some(t => t.houses < currentHouses);
  if (hasFewerHousesElsewhere) {
    socket.emit('errorMsg', 'Debes edificar de forma equitativa en todas las propiedades del grupo.');
    return false;
  }

  let cost = tile.housePrice;
  if (currentPlayer.characterClass === 'emprendedor') {
    cost = Math.round(cost * 0.85);
  }

  if (currentPlayer.cash < cost) {
    socket.emit('errorMsg', 'Efectivo insuficiente.');
    return false;
  }

  currentPlayer.cash -= cost;
  tile.houses += 1;
  const buildType = tile.houses === 5 ? 'Hotel' : `Estera ${tile.houses}`;
  game.log.push(`EDIFICAR: ${currentPlayer.username} edifico ${buildType} en ${tile.name} por S/. ${cost} soles.`);

  return true;
}

function sellHouse(game, socket, tileId) {
  const currentPlayer = game.players.find(p => p.socketId === socket.id);
  if (!currentPlayer) return false;

  const tile = game.board.find(t => t.id === tileId);
  if (tile.owner !== currentPlayer.username) {
    socket.emit('errorMsg', 'No eres dueno de esta propiedad.');
    return false;
  }

  if (tile.houses === 0) {
    socket.emit('errorMsg', 'No hay edificaciones para vender.');
    return false;
  }

  const colorGroup = tile.group;
  const sameGroupProperties = game.board.filter(t => t.group === colorGroup);

  // Even-selling rule: cannot sell if another property in the group has more houses
  const currentHouses = tile.houses;
  const hasMoreHousesElsewhere = sameGroupProperties.some(t => t.houses > currentHouses);
  if (hasMoreHousesElsewhere) {
    socket.emit('errorMsg', 'Debes vender las edificaciones de forma equitativa.');
    return false;
  }

  const refund = Math.round(tile.housePrice / 2);
  tile.houses -= 1;
  currentPlayer.cash += refund;
  const sellType = tile.houses === 4 ? 'Hotel' : `Estera ${tile.houses + 1}`;
  game.log.push(`EDIFICAR: ${currentPlayer.username} vendio su ${sellType} en ${tile.name} al banco por S/. ${refund} soles.`);

  return true;
}

function mortgageProperty(game, socket, tileId) {
  const currentPlayer = game.players.find(p => p.socketId === socket.id);
  if (!currentPlayer) return false;

  const tile = game.board.find(t => t.id === tileId);
  if (tile.owner !== currentPlayer.username) return false;
  if (tile.mortgaged) return false;

  if (tile.houses > 0) {
    socket.emit('errorMsg', 'Vende las esteras construidas antes de hipotecar.');
    return false;
  }

  tile.mortgaged = true;
  currentPlayer.cash += tile.mortgageValue;
  game.log.push(`BANCO: ${currentPlayer.username} hipoteco ${tile.name} por S/. ${tile.mortgageValue} soles.`);

  return true;
}

function unmortgageProperty(game, socket, tileId) {
  const currentPlayer = game.players.find(p => p.socketId === socket.id);
  if (!currentPlayer) return false;

  const tile = game.board.find(t => t.id === tileId);
  if (tile.owner !== currentPlayer.username) return false;
  if (!tile.mortgaged) return false;

  const unmortgageCost = Math.round(tile.mortgageValue * 1.1);
  if (currentPlayer.cash < unmortgageCost) {
    socket.emit('errorMsg', 'Efectivo insuficiente.');
    return false;
  }

  tile.mortgaged = false;
  currentPlayer.cash -= unmortgageCost;
  game.log.push(`BANCO: ${currentPlayer.username} pago hipoteca de ${tile.name} por S/. ${unmortgageCost} soles.`);

  return true;
}

module.exports = {
  buildHouse,
  sellHouse,
  mortgageProperty,
  unmortgageProperty
};
