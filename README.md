# Research Paper Unicorn Potential Analyzer

**Hackathon**: CDTM x TUM.ai x Anthropic  
**Team**: Hack-a-thong

---

## Description

This project is an AI-powered system that evaluates research papers to determine their potential to become unicorn startups. It uses **CrewAI orchestration** to coordinate multiple specialized agents that analyze different aspects of the research.

### Technology Stack

- **CrewAI** for intelligent multi-agent orchestration  
- **Claude (Anthropic)** for advanced reasoning & scoring  
- **FastAPI** for robust backend API
- **Streamlit** for interactive web interface
- **LogicMill API** for patent similarity analysis  
- **SearchVentures / OpenVC** for market & funding insights  
- **FAISS** for semantic similarity search

### Analysis Criteria

The system analyzes research papers across six key dimensions:

1. **Technology/IP** - Innovation level, patent potential, TRL assessment
2. **Market** - Market size, competitors, commercial viability  
3. **Team** - Entrepreneurial capabilities, missing roles
4. **Scaling** - Growth potential, operational risks
5. **Funding** - Investment opportunities, funding readiness
6. **Impact** - Societal benefit, sustainability, SDG alignment

Each analysis contributes to a final **Unicorn Potential Score** (0-100).

---

## Quick Start

### Prerequisites

- Python 3.9+
- Anthropic API key
- LogicMill API key (optional)

### Installation

1. **Clone and setup environment:**
```bash
git clone <repository-url>
cd tumHACK
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure environment variables:**
Create a `.env` file in the project root:
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
LOGICMILL_API_KEY=your_logicmill_api_key_here  # Optional
```

3. **Start the system:**
```bash
python start_system.py
```

This will start both the backend API (port 8000) and frontend interface (port 8501).

### Access Points

- **Frontend Interface**: http://localhost:8501
- **Backend API**: http://localhost:8000  
- **API Documentation**: http://localhost:8000/docs

---

## Usage

### Web Interface

1. Open http://localhost:8501 in your browser
2. **Upload a PDF** or **paste text** from your research paper
3. Select which analyses to run (default: all)
4. Click "Analyze Paper" and wait for results
5. View the unicorn potential score and detailed analysis
6. Download results as JSON

### API Usage

```python
import requests

# Upload PDF
with open("research_paper.pdf", "rb") as f:
    response = requests.post("http://localhost:8000/analyze-paper", files={"file": f})

# Or send text directly
data = {
    "text": "Your research paper text here...",
    "authors": "Author names and affiliations...",
    "agents_to_run": ["tech_ip", "market", "team"]  # Optional: specify agents
}
response = requests.post("http://localhost:8000/analyze-paper", json=data)

results = response.json()
print(f"Unicorn Potential Score: {results['unicorn_potential_score']}")
```

---

## Testing

Run the test suite to verify everything works:

```bash
python test_system.py
```

This will test:
- CrewAI orchestration
- PDF parsing
- Backend API endpoints
- Agent coordination

---

## Architecture

### CrewAI Orchestration

The system uses CrewAI to coordinate specialized agents:

- **Tech/IP Agent**: Analyzes technological innovation and IP potential
- **Market Agent**: Identifies market opportunities and competitors  
- **Team Agent**: Evaluates team composition and capabilities
- **Scaling Agent**: Assesses growth potential and risks
- **Funding Agent**: Identifies funding opportunities
- **Impact Agent**: Evaluates societal and environmental impact

### Backend Structure

```
backend/
├── crewai_orchestrator.py    # Main CrewAI orchestration
├── main.py                   # FastAPI application
├── agents/                   # Individual agent implementations
│   ├── tech_ip_agent.py
│   ├── market_agent.py
│   ├── team_agent.py
│   ├── scaling_agent.py
│   ├── funding_agent.py
│   └── impact_agent.py
└── utils/                    # Utility functions
    ├── claude_client.py
    ├── pdf_utils.py
    └── ...
```

### Frontend Structure

```
frontend/
└── app.py                    # Streamlit web interface
```

---

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Claude API key for analysis | Yes |
| `LOGICMILL_API_KEY` | LogicMill API for patent search | No |
| `SEARCHVENTURES_CSV_PATH` | Path to SearchVentures data | No |
| `OPENVC_CSV_PATH` | Path to OpenVC data | No |

### Agent Configuration

You can customize which agents run by modifying the `agents_to_run` parameter:

```python
# Run all agents (default)
agents_to_run = ["tech_ip", "market", "team", "scaling", "funding", "impact"]

# Run specific agents only
agents_to_run = ["tech_ip", "market"]
```

---

## Troubleshooting

### Common Issues

1. **"Claude request failed"**
   - Check your `ANTHROPIC_API_KEY` is set correctly
   - Verify you have sufficient API credits

2. **"PDF parsing failed"**
   - Ensure the PDF is not encrypted
   - Try with a different PDF file

3. **"Backend connection failed"**
   - Make sure the backend is running on port 8000
   - Check for port conflicts

4. **"CrewAI orchestration failed"**
   - Verify all dependencies are installed
   - Check the logs for specific error messages

### Logs

Check the logs directory for detailed error information:
```bash
tail -f logs/latest.log
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

---

## License

This project is developed for the CDTM x TUM.ai x Anthropic Hackathon.

---

## Acknowledgments

- **CrewAI** for multi-agent orchestration framework
- **Anthropic** for Claude AI capabilities
- **LogicMill** for patent analysis
- **SearchVentures/OpenVC** for market data
