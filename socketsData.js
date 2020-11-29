const { v4: uuidv4 } = require('uuid');

const games = {};

const joinWaitingPlayers = (playersInLobby) => {
  const gameId = `game ${uuidv4()}`;

  // Create game room
  games[gameId] = {
    players: [],
  };

  playersInLobby.map((players) => {
    players.leave('lobby');
    players.join(gameId);
    games[gameId].players.push(players.id);
  });

  return gameId;
};

const trowPlayersOut = (playersInRoom, gameId) => {
  delete games[gameId];
  playersInRoom.map((players) => {
    players.leave(gameId);
  });
};

module.exports = {
  joinWaitingPlayers,
  trowPlayersOut,
};
