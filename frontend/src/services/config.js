// Configuration file for API keys and settings
export const config = {
  // Anthropic Claude API Configuration (Primary)
  anthropic: {
    apiKey: 'key'
  },
  
  // Google Gemini API Configuration (Fallback)
  gemini: {
    apiKey: 'key'
  },
  
  // ElevenLabs API Configuration
  elevenlabs: {
    apiKey: 'key',
    voiceId: 'kPzsL2i3teMYv0FxEYQ6',
    model: 'eleven_multilingual_v2'
  },
  
  // Beyond Presence Configuration
  beyondPresence: {
    agentId: 'key',
    avatarId: '1474429c-7295-4a6d-9213-ff2ad571e7a1'
  },
  
  // Server Configuration
  server: {
    port: import.meta.env.VITE_PORT || 3000,
    corsOrigin: import.meta.env.VITE_CORS_ORIGIN || 'http://localhost:3000'
  },
  
  // Backend API Configuration
  backend: {
    baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
    wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'
  }
}
