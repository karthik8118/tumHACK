# Max Planck Startup Evaluator Frontend

A modern, animated frontend for the Max Planck Research Startup Evaluation System. This React application provides a comprehensive interface for analyzing startup potential with AI-powered insights, real-time chat, and interactive dashboards.

## Features

### 🎨 Modern UI/UX
- **Animated Landing Page** with particle effects and smooth transitions
- **Responsive Design** that works on all devices
- **Dark/Light Theme** support with smooth transitions
- **Glassmorphism Effects** and modern design patterns

### 🤖 AI-Powered Analysis
- **Multi-Agent Evaluation** using 6 specialized AI agents
- **Real-time Analysis** with live progress updates
- **Comprehensive Metrics** covering technology, market, team, scaling, funding, and impact
- **Interactive Charts** and visualizations

### 💬 AI Chat Interface
- **Voice-to-Text** and **Text-to-Speech** capabilities
- **Beyond Presence Avatar** integration for lifelike interactions
- **Real-time WebSocket** communication
- **Context-aware** conversations

### 📊 Analytics Dashboard
- **Performance Metrics** with trend analysis
- **Evaluation History** and comparison tools
- **Export Functionality** for reports
- **Real-time Updates** from backend agents

### 📄 Document Processing
- **PDF Upload** with drag-and-drop interface
- **Text Extraction** and analysis
- **Research Paper** evaluation
- **Patent Search** integration

## Technology Stack

- **React 18** with modern hooks and context
- **Vite** for fast development and building
- **Tailwind CSS** for styling with custom animations
- **Framer Motion** for smooth animations and transitions
- **Recharts** for data visualization
- **WebSocket** for real-time communication
- **ElevenLabs** for voice synthesis
- **Beyond Presence** for AI avatar integration

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on port 8000

### Installation

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
VITE_BEYOND_PRESENCE_AGENT_ID=your_beyond_presence_agent_id
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Hero.jsx        # Landing page
│   │   ├── Navbar.jsx      # Navigation
│   │   ├── StartupForm.jsx # Evaluation form
│   │   ├── AIChat.jsx      # Chat interface
│   │   ├── Dashboard.jsx   # Analytics dashboard
│   │   ├── EvaluationResults.jsx # Results display
│   │   └── ...
│   ├── context/            # React context
│   │   └── AppContext.jsx  # Global state management
│   ├── hooks/              # Custom hooks
│   │   └── useWebSocket.js # WebSocket integration
│   ├── services/           # API services
│   │   ├── anthropic.js    # Claude API
│   │   ├── elevenlabs.js   # Voice services
│   │   ├── logicMill.js    # Patent search
│   │   └── beyondPresence.js # Avatar integration
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── public/                 # Static assets
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Key Components

### Hero Component
- Animated landing page with particle effects
- Feature showcase with rotating highlights
- Call-to-action buttons with smooth transitions
- Statistics display with animated counters

### StartupForm Component
- Multi-step form with progress indicators
- PDF upload with drag-and-drop
- Real-time validation and feedback
- Integration with backend analysis

### AIChat Component
- Real-time chat interface
- Voice input/output capabilities
- Beyond Presence avatar integration
- Context-aware conversations

### EvaluationResults Component
- Comprehensive results display
- Interactive charts and visualizations
- Export and sharing functionality
- Detailed analysis breakdowns

### Dashboard Component
- Analytics and metrics overview
- Trend analysis and comparisons
- Quick actions and navigation
- Real-time data updates

## API Integration

The frontend integrates with several APIs:

### Backend API (Port 8000)
- `/analyze-paper` - PDF analysis endpoint
- `/analyze-text` - Text analysis endpoint
- `/health` - Health check endpoint

### WebSocket (Port 8000/ws)
- Real-time chat communication
- Analysis progress updates
- Voice streaming

### External APIs
- **Anthropic Claude** - AI text generation
- **ElevenLabs** - Voice synthesis
- **Logic Mill** - Patent and publication search
- **Beyond Presence** - AI avatar integration

## Styling and Animations

### Tailwind CSS Configuration
- Custom color palette with primary, secondary, accent colors
- Extended animations for smooth transitions
- Responsive design utilities
- Custom component classes

### Framer Motion Animations
- Page transitions with slide effects
- Component entrance animations
- Hover and interaction effects
- Loading states and progress indicators

### Custom Animations
- Particle background system
- Floating elements
- Gradient animations
- Shimmer effects

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Style
- ESLint configuration for React
- Prettier for code formatting
- TypeScript support (optional)
- Component-based architecture

## Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
- Configure production API URLs
- Set up CDN for static assets
- Configure WebSocket endpoints
- Set up SSL certificates

### Hosting Options
- Vercel (recommended for React)
- Netlify
- AWS S3 + CloudFront
- Docker containerization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the Max Planck Research Startup Evaluation System.

## Support

For support and questions:
- Check the documentation
- Review the backend API documentation
- Contact the development team

---

Built with ❤️ for Max Planck research commercialization.


