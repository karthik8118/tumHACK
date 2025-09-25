// Main routes setup
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function setupRoutes(app) {
  // API routes
  app.use('/api', apiRoutes);

  // Serve the main page
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
  });

  // Catch all handler for SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
  });
}
