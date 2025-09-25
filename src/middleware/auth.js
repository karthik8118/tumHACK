// Authentication middleware
import { config } from '../config.js';

export const authMiddleware = {
  // Simple API key validation (for future use)
  validateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }
    
    // In a real application, you would validate against a database
    // For now, we'll just check if it exists
    if (apiKey.length < 10) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    next();
  },

  // CORS middleware
  corsOptions: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // In production, you would check against a whitelist
      callback(null, true);
    },
    credentials: true
  },

  // Rate limiting (basic implementation)
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  }
};


