import os

# API keys
ANTHROPIC_API_KEY = "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"
LOGICMILL_API_KEY = "your_logicmill_api_key_here"
LOGICMILL_URL = "https://api.logic-mill.net/api/v1/graphql/"

# CSV paths
SEARCHVENTURES_CSV = "./data/searchventures.csv"
OPENVC_CSV = "./data/openvc_investors.csv"

# Claude max tokens
MAX_CLAUDE_TOKENS = 800

# Backend-dependent configuration for funding analysis
FUNDING_CONFIG = {
    "default_funding_fit_score": int(os.getenv("DEFAULT_FUNDING_FIT_SCORE", "4")),
    "default_exit_prospects_score": int(os.getenv("DEFAULT_EXIT_PROSPECTS_SCORE", "3")),
    "enable_ai_analysis": os.getenv("ENABLE_AI_FUNDING_ANALYSIS", "false").lower() == "true",
    "fallback_recommended_calls": [
        "Horizon Europe",
        "EIC Accelerator", 
        "National Grants",
        "SPRIND Funding",
        "EU Innovation Fund"
    ],
    "fallback_timeline": os.getenv("DEFAULT_FUNDING_TIMELINE", "12-18 months"),
    "keyword_boost_sectors": {
        "ai": {"funding_boost": 1, "exit_boost": 1},
        "healthcare": {"funding_boost": 1, "exit_boost": 1},
        "sustainability": {"funding_boost": 1, "exit_boost": 0},
        "fintech": {"funding_boost": 0, "exit_boost": 1},
        "biotech": {"funding_boost": 1, "exit_boost": 1}
    }
}

# Backend fallback configuration
BACKEND_FALLBACK_CONFIG = {
    "use_hardcoded_analysis": os.getenv("USE_HARDCODED_ANALYSIS", "true").lower() == "true",
    "enable_external_apis": os.getenv("ENABLE_EXTERNAL_APIS", "false").lower() == "true",
    "timeout_seconds": int(os.getenv("API_TIMEOUT_SECONDS", "30")),
    "max_retries": int(os.getenv("MAX_API_RETRIES", "2"))
}

# Logging
RUN_LOG_DIR = "./logs"
os.makedirs(RUN_LOG_DIR, exist_ok=True)