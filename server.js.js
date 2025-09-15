const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Root URL direkt phone1.html açar
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/phone1.html'));
});

// Socket.io signaling
io.on('connection', socket => {
  console.log('User connected:', socket.id);

  socket.on('offer', data => {
    io.to(data.to).emit('offer', { sdp: data.sdp, from: socket.id });
  });

  socket.on('answer', data => {
    io.to(data.to).emit('answer', { sdp: data.sdp, from: socket.id });
  });

  socket.on('ice-candidate', data => {
    io.to(data.to).emit('ice-candidate', { candidate: data.candidate, from: socket.id });
  });

  socket.on('register', data => {
    socket.join(data.name);
    console.log(`${data.name} registered with id: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
