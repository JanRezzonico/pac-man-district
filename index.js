const app = require('express')();
const express = require('express');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const maxPlayers = 2;
var roomMap = {};

class Room {
  constructor(id, owner, publicFlag) {
    console.log(id, owner);
    this.id = id;
    this.owner = owner;
    this.players = [];
    this.started = false;
    this.currentRound = -1;
    this.public = publicFlag;
  }
}

class Player {
  constructor(name, socketId) {
    this.name = name;
    this.socketId = socketId;
    this.pacman;
  }
}

app.use(express.static(__dirname + '/'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  // gestione stanze
  socket.on('join room', (roomId, playerName) => {
    roomId = String(roomId);
    let newplayer = new Player(playerName, socket.id);
    
    if (roomId in roomMap) { // user try to join a game
      if (nameAlreadyInUse(roomMap[roomId].players, playerName)) {
        socket.emit('alert', "name already in use");
      } else if (roomMap[roomId].players.length >= maxPlayers) {
        socket.emit('alert', "room full");
      } else if (roomMap[roomId].started) {
        socket.emit('alert', "game already started, wait for it to end");
      } else {
        roomMap[roomId].players.push(newplayer);
        socket.join(String(roomId));
        socket.emit('room joined', roomId);
        io.in(String(roomId)).emit('player updated', roomMap[roomId].players);
      }
    } else {
      socket.emit('alert', "room not found");
    }
  });

  socket.on('new room', (playerName, public) => {
    // create new room
    let roomId = 0;
    while (roomId in roomMap) {
      roomId++;
    }
    roomId = String(roomId);
    let owner = new Player(playerName, socket.id);
    let newRoom = new Room(roomId, owner, public);
    console.log(owner.name + " created room " + roomId);
    roomMap[roomId] = newRoom;

    // owner joins new room
    socket.emit('created room', roomId);
  });

  socket.on('leave room', (roomId) => {
    if (roomId in roomMap) {
      let user = getUsername(socket, roomId);
      console.log(user + " disconnected from room " + roomId);
      if (roomMap[roomId].players.some(player => player.name == user)) {
        roomMap[roomId].players.splice(roomMap[roomId].players.indexOf(user), 1);
        io.in(roomId).emit('player updated', roomMap[roomId].players);
        if (roomMap[roomId].players.length == 0) {
          console.log("room " + roomId + " is empty, deleting");
          delete roomMap[roomId];
        }
      }
    }
  });
  socket.on('disconnect', (reason) => {
    console.log(reason);
    //find room where socketId == socket.id
    for (let room in roomMap) {
      if (roomMap[room].players.some(player => player.socketId == socket.id)) {
        let username = roomMap[room].players.find(player => player.socketId == socket.id).name;
        console.log(username + " disconnected from room " + room);
        roomMap[room].players.splice(roomMap[room].players.indexOf(username), 1);
        io.in(room).emit('player updated', roomMap[room].players);
        if (roomMap[room].players.length == 0) {
          console.log("room " + room + " is empty, deleting");
          delete roomMap[room];
        }
      }
    }
  });
  socket.on('destroy room', (roomId) => {
    if (!(roomId in roomMap)) {
      socket.emit('alert', "room not found");
      return;
    }
    let user = getUsername(socket, roomId);
    if (roomMap[roomId].owner.name != user) {
      socket.emit('alert', "you are not the owner of this room");
      return;
    }
    io.in(roomId).emit('room destroyed');
    console.log("deleting room " + roomId);
    delete roomMap[roomId];
  });

  socket.on('get public rooms', () => {
    let privateRooms = [];
    for (let room in roomMap) {
      if (roomMap[room].public && !roomMap[room].started) {
        privateRooms.push(roomMap[room]);
      }
    }
    socket.emit('public rooms', privateRooms);
  });

  // fine gestione stanze 
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });
});

// healping functions 
function nameAlreadyInUse(playerArray, name) {
  let flag = false;
  playerArray.forEach(playerInGame => {
    if (playerInGame.name == name) {
      flag = true;
    }
  });
  return flag;
}
function getUsername(socket, roomId) {
  roomId = String(roomId);
  if (!(roomId in roomMap)) {
    return undefined;
  }
  let player = roomMap[roomId].players.find(p => p.socketId == socket.id);
  if (player === undefined) {
    return undefined;
  }
  return player.name;
}

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});