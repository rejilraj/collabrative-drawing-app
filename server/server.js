const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();

// Enable CORS for all origins (Modify if needed)
app.use(cors());

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Track connected clients
const clients = new Map();
let userCount = 0;

// WebSocket connection handler
wss.on('connection', (ws) => {
  const userId = uuidv4();
  const username = `User ${++userCount}`;
  clients.set(ws, { id: userId, username });

  console.log(`New connection: ${username} (${userId})`);

  // Notify all clients about the new user
  broadcastUserEvent(username, 'connected');

  // Send welcome message to the new user
  ws.send(
    JSON.stringify({
      type: 'info',
      message: `Welcome! You are ${username}. There are ${clients.size} users connected.`,
    })
  );

  // Message handler
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'draw':
          // Broadcast drawing data to all clients except sender
          broadcast(message, ws);
          break;

        case 'reset':
          // Broadcast canvas reset to all clients
          broadcastReset(username);
          break;

        default:
          console.log(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    const clientInfo = clients.get(ws);
    if (clientInfo) {
      console.log(`${clientInfo.username} disconnected`);
      clients.delete(ws);
      broadcastUserEvent(clientInfo.username, 'disconnected');
    }
  });

  // Handle WebSocket errors
  ws.on('error', (error) => {
    console.error(`WebSocket error for ${clients.get(ws)?.username || 'unknown user'}:`, error);
  });
});

// Function to broadcast messages to all clients except the sender
function broadcast(message, sender) {
  const messageString = typeof message === 'string' ? message : JSON.stringify(message);

  clients.forEach((client, clientWs) => {
    if (clientWs !== sender && clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(messageString);
    }
  });
}

// Function to broadcast user connection/disconnection events
function broadcastUserEvent(username, event) {
  const message = JSON.stringify({
    type: 'user',
    username,
    event,
    count: clients.size,
  });

  clients.forEach((client, clientWs) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(message);
    }
  });
}

// Function to broadcast canvas reset
function broadcastReset(username) {
  const message = JSON.stringify({
    type: 'reset',
    username,
  });

  clients.forEach((client, clientWs) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(message);
    }
  });
}

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/build');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Development server running');
  });
}

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
