const { applySolidarityCheck } = require('./passives');

// Start property Auction engine
function startPropertyAuction(game, tileId) {
  const activeBidders = game.players.filter(p => !p.isBankrupt).map(p => p.username);
  game.auction = {
    tileId,
    highestBid: 0,
    highestBidder: null,
    activeBidders,
    bidderIndex: 0
  };
  game.currentPlayerAction = 'auction_bidding';
  const tileName = game.board.find(t => t.id === tileId).name;
  game.log.push(`SUBASTA: Se inicio la subasta de la propiedad ${tileName}. Oferta inicial: S/. 0.`);
}

// Process a bid from a player
function placeBid(game, socket, bidAmount) {
  if (game.currentPlayerAction !== 'auction_bidding' || !game.auction) return false;

  const bidderName = game.auction.activeBidders[game.auction.bidderIndex];
  const bidderObj = game.players.find(p => p.username === bidderName);

  if (!bidderObj || bidderObj.socketId !== socket.id) {
    socket.emit('errorMsg', 'No es tu turno de ofertar en la subasta.');
    return false;
  }

  if (bidAmount <= game.auction.highestBid) {
    socket.emit('errorMsg', 'La oferta debe ser mayor a la puja mas alta.');
    return false;
  }

  if (bidderObj.cash < bidAmount) {
    socket.emit('errorMsg', 'No tienes suficiente efectivo para respaldar esa oferta.');
    return false;
  }

  game.auction.highestBid = bidAmount;
  game.auction.highestBidder = bidderName;
  game.log.push(`SUBASTA: @${bidderName} oferto S/. ${bidAmount} soles.`);

  // Advance bidding index
  game.auction.bidderIndex = (game.auction.bidderIndex + 1) % game.auction.activeBidders.length;
  return true;
}

// Process a pass (fold) from a player in auction
function passBid(game, socket) {
  if (game.currentPlayerAction !== 'auction_bidding' || !game.auction) return false;

  const bidderName = game.auction.activeBidders[game.auction.bidderIndex];
  const bidderObj = game.players.find(p => p.username === bidderName);

  if (!bidderObj || bidderObj.socketId !== socket.id) {
    socket.emit('errorMsg', 'No es tu turno en la subasta.');
    return false;
  }

  game.log.push(`SUBASTA: @${bidderName} paso.`);

  // Remove from active bidders
  game.auction.activeBidders.splice(game.auction.bidderIndex, 1);

  const tile = game.board.find(t => t.id === game.auction.tileId);

  // Check end conditions of auction
  if (game.auction.activeBidders.length === 0) {
    // Nobody bid or last bidder passed
    if (game.auction.highestBidder) {
      const winner = game.players.find(p => p.username === game.auction.highestBidder);
      winner.cash -= game.auction.highestBid;
      tile.owner = winner.username;
      game.log.push(`SUBASTA: @${winner.username} gano la subasta de ${tile.name} por S/. ${game.auction.highestBid}.`);
      applySolidarityCheck(game, winner);
    } else {
      game.log.push(`SUBASTA: Subasta desierta. Nadie compro ${tile.name}.`);
    }
    game.auction = null;
    game.currentPlayerAction = null;
  }
  else if (game.auction.activeBidders.length === 1 && game.auction.highestBidder !== null) {
    // One bidder left who actually placed a bid
    const winnerName = game.auction.highestBidder;
    const winner = game.players.find(p => p.username === winnerName);
    winner.cash -= game.auction.highestBid;
    tile.owner = winner.username;
    game.log.push(`SUBASTA: @${winner.username} gano la subasta de ${tile.name} por S/. ${game.auction.highestBid}.`);
    applySolidarityCheck(game, winner);

    game.auction = null;
    game.currentPlayerAction = null;
  }
  else {
    // Wrap bidder index
    if (game.auction.activeBidders.length > 0) {
      game.auction.bidderIndex = game.auction.bidderIndex % game.auction.activeBidders.length;
    } else {
      game.auction = null;
      game.currentPlayerAction = null;
    }
  }

  return true;
}

module.exports = {
  startPropertyAuction,
  placeBid,
  passBid
};
