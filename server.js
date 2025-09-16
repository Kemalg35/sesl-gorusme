const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);

// public klasöründeki dosyaları sun
app.use(express.static("public"));

// WebSocket sunucusu (signaling için)
const wss = new WebSocket.Server({ server, path: "/ws" });

// Her client için heartbeat ayarları
wss.on("connection", (ws) => {
  console.log("User connected");
  ws.isAlive = true;

  // Ping/pong ile heartbeat
  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());

    // Eğer Phone1 çağrı başlatıyorsa, Phone2'ye ilet
    if (data.type === "incomingCall") {
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "incomingCall" }));
        }
      });
    }

    // Phone1 veya Phone2 offer, answer veya candidate gönderirse diğerine ilet
    if (["offer", "answer", "candidate", "callAccepted", "callEnded"].includes(data.type)) {
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("User disconnected");
  });
});

// 30 saniyede bir heartbeat kontrolü
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 10000);

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
