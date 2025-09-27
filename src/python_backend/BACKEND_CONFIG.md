# Backend Configuration Guide

## Overview
The funding agent has been reverted to use hardcoded values with backend-dependent configuration. This makes the system more reliable and configurable without external dependencies.

## Configuration Options

### Environment Variables

Set these environment variables to configure the backend behavior:

```bash
# Default funding scores (0-5 scale)
DEFAULT_FUNDING_FIT_SCORE=4
DEFAULT_EXIT_PROSPECTS_SCORE=3

# Funding timeline
DEFAULT_FUNDING_TIMELINE=12-18 months

# Analysis mode
USE_HARDCODED_ANALYSIS=true
ENABLE_AI_FUNDING_ANALYSIS=false
ENABLE_EXTERNAL_APIS=false

# API settings
API_TIMEOUT_SECONDS=30
MAX_API_RETRIES=2
```

### Configuration in config.py

The `FUNDING_CONFIG` dictionary contains:

- **default_funding_fit_score**: Base funding fit score (default: 4)
- **default_exit_prospects_score**: Base exit prospects score (default: 3)
- **enable_ai_analysis**: Whether to use AI analysis (default: false)
- **fallback_recommended_calls**: List of recommended funding programs
- **fallback_timeline**: Default funding timeline
- **keyword_boost_sectors**: Sector-specific score boosts

### Sector-Specific Boosts

The system automatically boosts scores based on content keywords:

- **AI/ML**: +1 funding fit, +1 exit prospects
- **Healthcare/Biotech**: +1 funding fit, +1 exit prospects  
- **Sustainability**: +1 funding fit
- **Fintech**: +1 exit prospects

## Usage

### Hardcoded Mode (Default)
```python
from agents.funding_agent import evaluate_funding

# Uses hardcoded analysis with backend configuration
result = evaluate_funding("AI-powered healthcare solution...")
```

### AI Analysis Mode
Set `ENABLE_AI_FUNDING_ANALYSIS=true` and `USE_HARDCODED_ANALYSIS=false` to enable AI analysis with hardcoded fallback.

## Benefits

1. **Reliability**: No external API dependencies
2. **Configurability**: Easy to adjust scores and behavior
3. **Performance**: Fast hardcoded analysis
4. **Fallback**: Automatic fallback to hardcoded values on errors
5. **Transparency**: Clear indication of analysis type used

## Analysis Types

The system returns an `analysis_type` field indicating:
- `"backend_hardcoded"`: Used hardcoded analysis
- `"ai_analysis"`: Used AI analysis successfully
- `"ai_analysis_fallback"`: AI failed, used hardcoded fallback
