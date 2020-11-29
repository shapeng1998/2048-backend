const { v4: uuidv4 } = require('uuid');

const games = {};

function joinWaitingPlayers(playersInLobby) {
  const gameId = `game ${uuidv4()}`;

  // create game room
  games[gameId] = {
    players: [],
  };

  playersInLobby.map((player) => {
    player.leave('lobby');
    player.join(gameId);
    games[gameId].players.push(player.id);
  });

  return gameId;
}

function trowPlayersOut(playersInRoom, gameId) {
  delete games[gameId];
  playersInRoom.map((player) => {
    player.leave(gameId);
  });
}

module.exports = {
  joinWaitingPlayers,
  trowPlayersOut,
};
