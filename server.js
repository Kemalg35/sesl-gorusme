const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);

// Public klasöründeki dosyaları sun
app.use(express.static("public"));

// WebSocket sunucusu
const wss = new WebSocket.Server({ server, path: "/ws" });

wss.on("connection", (ws) => {
  console.log("User connected");

  ws.on("message", (message) => {
    // Mesajı diğer tüm client’lara ilet
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on("close", () => {
    console.log("User disconnected");
  });
});

// Render ortamında portu Render verir, localde 10000 kullan
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
