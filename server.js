require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const { joinWaitingPlayers, trowPlayersOut } = require('./socketsData');

const app = express();

// Port
const port = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const playersRouter = require('./routes/players');
app.use('/api/players', playersRouter);

// Database connection
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', (err) => console.error(err));
db.once('open', () => console.log('Connect to DB!'));

// Socketio
const server = http.createServer(app);
const io = socketio(server);

function getPlayersInRoom(room) {
  var players = [];
  const socketsIdsInLobby = Object.keys(io.sockets.adapter.rooms[room].sockets);
  socketsIdsInLobby.map((socketId) =>
    players.push(io.sockets.adapter.nsp.connected[socketId])
  );

  return players;
}

io.on('connection', (socket) => {
  let userData = { socket, nickname: '' };
  socket.on('join', async ({ nickname }) => {
    console.log('player joined');
    userData.nickname = nickname;
    console.log(userData);
    socket.join('lobby');
    io.to('lobby').emit('game-ready');
  });

  socket.on('game-mul-start', (data) => {
    const playersInLobby = getPlayersInRoom('lobby');
    if (playersInLobby.length >= 2) {
      const gameId = joinWaitingPlayers(playersInLobby);
      const gameTime = 300000;
      if (gameId) {
        io.to(gameId).emit('start-game', { gameId, gameTime });

        setTimeout(() => {
          io.to(gameId).emit('end-game', { result: 'chicken' });
        }, gameTime);
      }
    } else {
      socket.emit('game-mul-start-no-enough-people');
    }
  });

  socket.on('email-data', (data) => {
    const { nickname, message } = data;
    console.log(data);
    io.emit('email-data', { nickname, message });
  });

  socket.on('ready-move', (data) => {
    const { board: opponentBoard, score: opponentScore } = data;
    console.log(Object.keys(socket.adapter.rooms));
    const gameSocketId = Object.keys(socket.adapter.rooms).find((room) =>
      room.includes('lobby')
    );
    socket
      .to(gameSocketId)
      .emit('ready-move', { opponentBoard, opponentScore });
  });

  socket.on('move', (data) => {
    const { board: opponentBoard, score: opponentScore } = data;
    const gameSocketId = Object.keys(socket.adapter.rooms).find((room) =>
      room.includes('game')
    );
    socket.to(gameSocketId).emit('move', { opponentBoard, opponentScore });
  });

  socket.on('game-event', (eventType) => {
    const gameSocketId = Object.keys(socket.adapter.rooms).find((room) =>
      room.includes('game')
    );
    socket.to(gameSocketId).emit('game-event', eventType);
  });

  socket.on('player-lost', () => {
    const gameSocketId = Object.keys(socket.adapter.rooms).find((room) =>
      room.includes('game')
    );
    console.log('opponent lost');
    socket.to(gameSocketId).emit('opponent-lost');
  });

  socket.on('disconnect', function () {
    const gameId = Object.keys(socket.adapter.rooms).find((room) =>
      room.includes('game')
    );
    if (gameId) {
      io.to(gameId).emit('end-game', { result: 'chicken' });
      const playersInRoom = getPlayersInRoom(gameId);
      trowPlayersOut(playersInRoom, gameId);
    }
  });
});

// Server listening
server.listen(port, () => console.log(`Server running on port ${port}.`));
