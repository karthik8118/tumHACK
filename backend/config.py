import os
from dotenv import load_dotenv

# Explicitly load your .env
load_dotenv(dotenv_path="/Users/karthikgudibanda/Desktop/tumHACK/.env")

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
LOGICMILL_TOKEN = os.getenv("LOGICMILL_TOKEN", "")
LOGICMILL_URL = "https://api.logic-mill.net/api/v1/graphql/"
SEARCHVENTURES_CSV = os.getenv("SEARCHVENTURES_CSV_PATH", "./data/searchventures.csv")
OPENVC_CSV = os.getenv("OPENVC_CSV_PATH", "./data/openvc_investors.csv")
