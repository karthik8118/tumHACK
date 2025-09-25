// Main application entry point
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import our modules
import { config } from './src/config.js';
import { setupWebSocket } from './src/services/websocket.js';
import { setupRoutes } from './src/routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Setup routes
setupRoutes(app);

// Setup WebSocket
setupWebSocket(wss);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      gemini: 'connected',
      elevenlabs: 'connected',
      websocket: 'active'
    }
  });
});

// Start server
server.listen(config.server.port, () => {
  console.log(`🚀 MPG Breakthrough Analyst Server running on port ${config.server.port}`);
  console.log(`📊 Dashboard: http://localhost:${config.server.port}`);
  console.log(`🤖 AI Services: Google Gemini + ElevenLabs + Beyond Presence`);
});

export default app;

