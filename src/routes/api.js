// API routes
import express from 'express';
import { analysisController } from '../controllers/analysisController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Analysis routes
router.post('/analyze', analysisController.analyzeStartup);
router.get('/history', analysisController.getAnalysisHistory);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      anthropic: 'connected',
      elevenlabs: 'connected'
    }
  });
});

export default router;


