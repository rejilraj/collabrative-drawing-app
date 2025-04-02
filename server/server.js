const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
// app.use(cors({
//   origin: [
//     'https://4e0a-2409-40f3-12-a75-c4d3-a312-2139-ff2c.ngrok-free.app',
//     'http://localhost:3000' // For local dev
//   ],
//   credentials: true
// }));

app.use(cors({
  origin: '*', // Allow all origins temporarily
  credentials: true
}));

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
// const wss = new WebSocket.Server({ 
//   server,
//   verifyClient: (info, done) => {
//   // Allow ngrok and localhost
//   const origin = info.origin || info.req.headers.origin;
//   if (origin.includes('ngrok-free.app') || origin.includes('localhost')) {
//     return done(true);
//   }
//   done(false, 401, 'Unauthorized');
// }
// });

const wss = new WebSocket.Server({ server });

// Track connected clients with unique IDs
const clients = new Map();
let userCount = 0;

// WebSocket connection handler
wss.on('connection', (ws) => {
  const userId = uuidv4();
  const username = `User ${++userCount}`;
  clients.set(ws, { id: userId, username });

  console.log(`New connection: ${username} (${userId})`);

  // Notify everyone about the new user
  broadcastUserEvent(username, 'connected');

  // Send current user count
  ws.send(JSON.stringify({
    type: 'info',
    message: `Welcome! You are ${username}. There are ${clients.size} users connected.`
  }));

  // Message handler
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    // Handle different message types
    switch (data.type) {
      case 'draw':
        // Broadcast drawing data to all clients
        broadcast(message, ws);
        break;
      
      case 'reset':
        // Broadcast canvas reset to all clients
        broadcastReset(username);
        break;
      
      default:
        console.log(`Unknown message type: ${data.type}`);
    }
  });

  // Handle disconnection
  ws.on('close', () => {
    const { username } = clients.get(ws);
    clients.delete(ws);
    console.log(`${username} disconnected`);
    broadcastUserEvent(username, 'disconnected');
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error(`WebSocket error for ${clients.get(ws)?.username || 'unknown user'}:`, error);
  });
});

// Broadcast drawing data to all clients except sender
function broadcast(message, sender) {
    const messageString = typeof message === 'string' ? message : JSON.stringify(message);
    
    clients.forEach((client, clientWs) => {
      if (clientWs !== sender && clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(messageString);
      }
    });
  }

// Broadcast user connection/disconnection events
function broadcastUserEvent(username, event) {
  const message = JSON.stringify({
    type: 'user',
    username,
    event,
    count: clients.size
  });
  
  clients.forEach((client, clientWs) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(message);
    }
  });
}

// Broadcast canvas reset
function broadcastReset(username) {
  const message = JSON.stringify({
    type: 'reset',
    username
  });
  
  clients.forEach((client, clientWs) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(message);
    }
  });
}

// For production, serve static files from React build folder
if (process.env.NODE_ENV === 'production' && process.env.SERVE_FRONTEND === 'true') {
  // Only try to serve the React build if explicitly configured to do so
  const buildPath = path.join(__dirname, '../client/build');
  
  // Check if the build directory exists before trying to serve from it
  try {
    if (require('fs').existsSync(buildPath)) {
      app.use(express.static(buildPath));
      
      app.get('*', (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
      });
    } else {
      console.log('Build directory does not exist. Running in API-only mode.');
    }
  } catch (err) {
    console.log('Error checking build directory:', err);
    console.log('Running in API-only mode.');
  }
} else {
  // API-only mode or development
  app.get('/', (req, res) => {
    res.send('Drawing App API server running');
  });
}


// Start the server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});