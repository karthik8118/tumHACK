# MPG Unicorn Analyst

A comprehensive AI-powered system for evaluating the breakthrough potential of research and transforming scientific insights into successful unicorn startups.

## 🌟 Overview

This system combines advanced AI agents, real-time analysis, and interactive interfaces to provide comprehensive startup evaluation based on multiple criteria including technology readiness, market potential, team composition, scaling opportunities, funding requirements, and societal impact.

## 🚀 Features

### 🤖 AI-Powered Analysis
- **6 Specialized AI Agents** for comprehensive evaluation
- **Real-time Analysis** with live progress updates
- **Multi-criteria Assessment** covering all aspects of startup potential
- **Patent & Publication Search** using Logic Mill database
- **Research Gap Analysis** for innovation opportunities

### 🎨 Modern Frontend
- **Animated Landing Page** with particle effects
- **Interactive Dashboard** with real-time metrics
- **AI Chat Interface** with voice capabilities
- **PDF Upload & Processing** for research papers
- **Comprehensive Results Display** with visualizations

### 🔄 Real-time Communication
- **WebSocket Integration** for live updates
- **Voice-to-Text & Text-to-Speech** using ElevenLabs
- **Beyond Presence Avatar** for lifelike AI interactions
- **Context-aware Conversations** with analysis history

### 📊 Analytics & Reporting
- **Performance Metrics** and trend analysis
- **Export Functionality** for detailed reports
- **Comparison Tools** for multiple evaluations
- **Historical Data** tracking and insights

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   APIs          │
│                 │    │                 │    │                 │
│ • Hero Page     │    │ • CrewAI        │    │ • Anthropic     │
│ • Dashboard     │    │ • Agents        │    │ • ElevenLabs    │
│ • AI Chat       │    │ • WebSocket     │    │ • Logic Mill    │
│ • Forms         │    │ • PDF Parser    │    │ • Beyond        │
│ • Results       │    │ • Orchestrator  │    │   Presence      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with modern hooks and context
- **Vite** for fast development and building
- **Tailwind CSS** with custom animations
- **Framer Motion** for smooth transitions
- **Recharts** for data visualization
- **WebSocket** for real-time communication

### Backend
- **FastAPI** for high-performance API
- **CrewAI** for agent orchestration
- **Anthropic Claude** for AI analysis
- **WebSocket** for real-time updates
- **PDF Processing** with PyPDF
- **Vector Search** with FAISS

### External Services
- **ElevenLabs** for voice synthesis
- **Beyond Presence** for AI avatars
- **Logic Mill** for patent/publication search
- **Anthropic Claude** for text generation

## 📁 Project Structure

```
tumHACK/
├── backend/                    # Backend API and agents
│   ├── agents/                # AI agent implementations
│   │   ├── tech_ip_agent.py   # Technology & IP analysis
│   │   ├── market_agent.py    # Market research
│   │   ├── team_agent.py      # Team evaluation
│   │   ├── scaling_agent.py   # Scaling potential
│   │   ├── funding_agent.py   # Funding analysis
│   │   └── impact_agent.py    # Impact assessment
│   ├── utils/                 # Utility functions
│   ├── main.py               # FastAPI application
│   ├── crewai_orchestrator.py # Agent orchestration
│   └── comprehensive_scorer.py # Scoring system
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/          # State management
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API services
│   │   └── App.jsx           # Main application
│   ├── package.json          # Dependencies
│   └── vite.config.js        # Build configuration
├── data/                     # Data files
│   ├── eu_market_sizes.csv   # Market data
│   ├── eu_regulations.json   # Regulatory info
│   └── horizon_calls.json    # Funding opportunities
├── start_full_system.py      # Full system startup
├── start_with_claude.py      # Backend-only startup
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### 1. Clone and Setup
```bash
git clone <repository-url>
cd tumHACK
```

### 2. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Set environment variables
export ANTHROPIC_API_KEY="your_claude_api_key"
export ELEVENLABS_API_KEY="your_elevenlabs_api_key"
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Configure environment
cp env.example .env
# Edit .env with your API keys
```

### 4. Start Full System
```bash
# From project root
python start_full_system.py
```

This will start:
- Backend API on http://localhost:8000
- Frontend on http://localhost:3000
- API documentation on http://localhost:8000/docs

## 🔧 Individual Component Startup

### Backend Only
```bash
python start_with_claude.py
```

### Frontend Only
```bash
cd frontend
npm run dev
```

## 📊 Evaluation Criteria

The system evaluates startups across 6 key dimensions:

### 1. Technology & IP (Tech Agent)
- **Technology Readiness Level (TRL)** assessment
- **Innovation novelty** and uniqueness
- **Patent landscape** analysis
- **Intellectual property** potential

### 2. Market Analysis (Market Agent)
- **Market size** and growth potential
- **Competitive landscape** research
- **Customer segments** identification
- **Market entry** barriers and opportunities

### 3. Team Assessment (Team Agent)
- **Team composition** and expertise
- **Missing roles** identification
- **Entrepreneurial readiness** evaluation
- **Execution capabilities** assessment

### 4. Scaling Potential (Scaling Agent)
- **Growth strategies** and scalability
- **Operational risks** and challenges
- **Resource requirements** for scaling
- **Market expansion** opportunities

### 5. Funding Analysis (Funding Agent)
- **Funding requirements** and timeline
- **Investment readiness** assessment
- **Funding sources** recommendations
- **Financial projections** and viability

### 6. Impact Evaluation (Impact Agent)
- **Societal impact** potential
- **Environmental benefits** assessment
- **SDG alignment** evaluation
- **Sustainability metrics** analysis

## 🎯 Usage Examples

### 1. Research Paper Analysis
```python
# Upload a PDF research paper
POST /analyze-paper
Content-Type: multipart/form-data

# Get comprehensive analysis
{
  "unicorn_potential_score": 85,
  "tech_ip": { "trl": 7, "novelty_score": 8.5 },
  "market": { "market_size": "€2.5B", "competitors": 12 },
  "team": { "team_score_0_5": 4.2, "missing_roles": ["Marketing"] },
  "scaling": { "scaling_score_0_5": 3.8, "growth_potential": "High" },
  "funding": { "funding_score_0_5": 4.0, "recommended_sources": ["VC", "Grants"] },
  "impact": { "impact_score_0_5": 4.5, "sdg_alignment": ["SDG 3", "SDG 9"] }
}
```

### 2. AI Chat Interaction
```javascript
// Real-time chat with AI advisor
const response = await sendChatMessage("What makes a startup successful?");
// Get voice response with avatar lip-sync
```

### 3. Patent Search
```python
# Search for similar patents
POST /patent-search
{
  "query": "quantum computing algorithms",
  "limit": 10
}
```

## 🔌 API Endpoints

### Analysis Endpoints
- `POST /analyze-paper` - Analyze uploaded PDF
- `POST /analyze-text` - Analyze text input
- `GET /health` - System health check

### WebSocket Events
- `chat` - Send chat message
- `startup_analysis` - Start analysis
- `speech_to_text` - Voice input
- `text_to_speech` - Voice output
- `patent_search` - Search patents
- `research_gap_analysis` - Analyze research gaps

## 🎨 Frontend Features

### Landing Page
- Animated hero section with particle effects
- Feature showcase with rotating highlights
- Statistics display with animated counters
- Smooth scroll animations

### Evaluation Form
- Multi-step form with progress indicators
- PDF upload with drag-and-drop
- Real-time validation and feedback
- Integration with backend analysis

### AI Chat Interface
- Real-time chat with typing indicators
- Voice input/output capabilities
- Beyond Presence avatar integration
- Context-aware conversations

### Results Dashboard
- Comprehensive results visualization
- Interactive charts and graphs
- Export and sharing functionality
- Detailed analysis breakdowns

### Analytics Dashboard
- Performance metrics overview
- Trend analysis and comparisons
- Quick actions and navigation
- Real-time data updates

## 🔐 Security & Privacy

- **API Key Management** with environment variables
- **CORS Configuration** for secure cross-origin requests
- **Input Validation** and sanitization
- **Error Handling** with proper logging
- **Rate Limiting** for API endpoints

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
pip install -r requirements.txt
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM python:3.9
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Configuration
```env
# Production environment variables
ANTHROPIC_API_KEY=your_production_key
ELEVENLABS_API_KEY=your_production_key
LOGIC_MILL_API_TOKEN=your_production_token
```

## 📈 Performance

- **Real-time Analysis** with WebSocket updates
- **Optimized Rendering** with React 18 features
- **Efficient State Management** with Context API
- **Lazy Loading** for better performance
- **Caching Strategies** for API responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the Max Planck Research Startup Evaluation System.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the API documentation at `/docs`
- Contact the development team

## 🎯 Future Enhancements

- **Machine Learning Models** for improved scoring
- **Advanced Visualizations** with 3D charts
- **Mobile App** development
- **Integration** with more research databases
- **Automated Report Generation** with templates
- **Collaborative Features** for team evaluations

---

Built with ❤️ for Max Planck research commercialization and startup success.