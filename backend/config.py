import os
from dotenv import load_dotenv

# Load local .env
load_dotenv("/Users/karthikgudibanda/Desktop/tumHACK/.env")

# API keys
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
LOGICMILL_API_KEY = os.getenv("LOGICMILL_API_KEY")
LOGICMILL_URL = "https://api.logic-mill.net/api/v1/graphql/"

# CSV paths
SEARCHVENTURES_CSV = os.getenv("SEARCHVENTURES_CSV_PATH", "./data/searchventures.csv")
OPENVC_CSV = os.getenv("OPENVC_CSV_PATH", "./data/openvc_investors.csv")

# Claude max tokens
MAX_CLAUDE_TOKENS = 800

# Logging
RUN_LOG_DIR = os.getenv("RUN_LOG_DIR", "./logs")
os.makedirs(RUN_LOG_DIR, exist_ok=True)
