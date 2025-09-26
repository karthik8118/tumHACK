// Configuration file for API keys and settings
export const config = {
  // Anthropic Claude API Configuration (Primary)
  anthropic: {
    apiKey: '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'
  },
  
  // Google Gemini API Configuration (Fallback)
  gemini: {
    apiKey: 'AIzaSyBhN-c0_Pb6b03u9NPQ-WJykHgm0mMrAo8'
  },
  
  // ElevenLabs API Configuration
  elevenlabs: {
    apiKey: 'sk_5616e09946bbb43ad8c26584e05b6ed7f1471e1b097b5421',
    voiceId: 'kPzsL2i3teMYv0FxEYQ6',
    model: 'eleven_multilingual_v2'
  },
  
  // Beyond Presence Configuration
  beyondPresence: {
    agentId: 'AIzaSyDonQGPoLuWyN76cKPTWl9gfNAqYK4NK3Y',
    avatarId: '1474429c-7295-4a6d-9213-ff2ad571e7a1'
  },
  
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  }
};
