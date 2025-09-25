# MPG Breakthrough Analyst

A comprehensive startup potential analyzer for Max Planck research commercialization, featuring real-time AI conversation, advanced visualizations, and multi-agent analysis.

## 🚀 Features

### Core Functionality
- **Real-time AI Conversation** with Claude 3.5 Sonnet
- **Beyond Presence Avatar** for immersive interaction
- **ElevenLabs TTS/STT** for voice-enabled conversations
- **Startup Evaluation** with 8 key criteria analysis
- **Patent Similarity Search** integration ready
- **Market Insights** with trend analysis
- **Competitor Mapping** and positioning

### AI Services Integration
- **Anthropic Claude 3.5 Sonnet** for intelligent analysis
- **ElevenLabs** for high-quality text-to-speech and speech-to-text
- **Beyond Presence** for realistic AI avatar interaction
- **WebSocket** for real-time communication

### Visualizations
- Interactive radar charts for evaluation metrics
- Market size projections and adoption curves
- Research gap analysis matrix
- Competitor positioning scatter plots
- Real-time dashboard with animated metrics

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Open in Browser**
   ```
   http://localhost:3000
   ```

### Development Mode
```bash
npm run dev
```

## 🔧 Configuration

The application uses the following API keys (configured in `config.js`):

- **Anthropic API**: For Claude 3.5 Sonnet LLM responses
- **ElevenLabs API**: For text-to-speech and speech-to-text
- **Beyond Presence**: For AI avatar integration

## 📊 Usage

### Startup Evaluation
1. Navigate to the "Evaluate" section
2. Fill in startup details and criteria scores
3. Upload PDF documents (optional)
4. Get AI-powered analysis with recommendations

### AI Avatar Chat
1. Go to "AI Avatar" section
2. Use text input or voice commands
3. Get real-time responses with speech synthesis
4. Interact with the Beyond Presence avatar

### Dashboard & Analytics
- View portfolio metrics and trends
- Analyze market insights and projections
- Explore patent similarities and research gaps
- Monitor competitive landscape

## 🏗️ Architecture

### Frontend
- **HTML5/CSS3** with modern animations
- **Vanilla JavaScript** with WebSocket integration
- **Chart.js** for data visualizations
- **Responsive design** for all devices

### Backend
- **Node.js/Express** server
- **WebSocket** for real-time communication
- **Anthropic SDK** for AI responses
- **ElevenLabs SDK** for voice processing

### AI Services
- **Claude 3.5 Sonnet**: Advanced reasoning and analysis
- **ElevenLabs**: High-quality voice synthesis
- **Beyond Presence**: Realistic avatar interaction

## 🎯 Evaluation Criteria

The system evaluates startups across 8 key dimensions:

1. **Research Gap** - Novelty and innovation level
2. **Future Potential** - Long-term market opportunity
3. **Competition** - Competitive landscape analysis
4. **Team Strength** - Capabilities and expertise
5. **Tech Novelty** - Technical innovation
6. **Market Demand** - Customer need validation
7. **Market Potential** - Addressable market size
8. **Revenue Generation** - Monetization potential

## 🔮 Future Integrations

- **Logic Mill** vector database for patent/publication similarity
- **OpenAlex** for research publication analysis
- **Espacenet** for patent database integration
- **Real-time market data** feeds
- **Advanced ML models** for prediction

## 📱 Mobile Support

Fully responsive design with:
- Touch-optimized interface
- Mobile-friendly navigation
- Adaptive layouts for all screen sizes
- Voice input support on mobile devices

## 🚀 Deployment

### Production Setup
1. Set environment variables for API keys
2. Configure CORS for your domain
3. Deploy to your preferred hosting platform
4. Ensure WebSocket support

### Docker (Optional)
```bash
docker build -t mpg-analyst .
docker run -p 3000:3000 mpg-analyst
```

## 🤝 Contributing

This is a hackathon project for the Max Planck Breakthrough Analyst challenge. Contributions and improvements are welcome!

## 📄 License

MIT License - see LICENSE file for details.

## 🏆 Hackathon Info

**Challenge**: Build an Analyst for evaluating breakthrough startup potential of Max Planck research

**Winning Criteria**:
- ✅ Analyze Max Planck research for breakthrough potential
- ✅ Define criteria for assessment (Technology, Team, Market)
- ✅ Leverage AI tech tools (Claude, ElevenLabs, Beyond Presence)
- ✅ Create usable prototype for analyzing breakthrough potential

**Data Sources Ready**:
- Logic Mill vector database integration
- Espacenet patent database
- OpenAlex publications
- External data source compatibility

---

Built with ❤️ for the MPG Hackathon Team


