const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));
app.use(express.json());

app.post('/incoming-call', (req, res) => {
  console.log('ESP tetikledi:', req.body || {});
  io.emit('incoming-trigger');
  res.sendStatus(200);
});

io.on('connection', (socket) => {
  console.log('Socket bağlandı', socket.id);
  socket.on('offer', (offer) => socket.broadcast.emit('offer', offer));
  socket.on('answer', (answer) => socket.broadcast.emit('answer', answer));
  socket.on('ice', (candidate) => socket.broadcast.emit('ice', candidate));
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log('Signaling server listening on', PORT));
