import os
from dotenv import load_dotenv

load_dotenv("/Users/karthikgudibanda/Desktop/tumHACK/.env")

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
LOGICMILL_API_KEY = os.getenv("LOGICMILL_API_KEY")
LOGICMILL_URL = "https://api.logic-mill.net/api/v1/graphql/"
SEARCHVENTURES_CSV = os.getenv("SEARCHVENTURES_CSV_PATH", "./data/searchventures.csv")
OPENVC_CSV = os.getenv("OPENVC_CSV_PATH", "./data/openvc_investors.csv")
MAX_CLAUDE_TOKENS = 800
