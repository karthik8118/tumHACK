import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
LOGICMILL_API_KEY = os.getenv("LOGICMILL_API_KEY")
SEARCHVENTURES_CSV = os.getenv("SEARCHVENTURES_CSV_PATH", "./data/searchventures.csv")
OPENVC_CSV = os.getenv("OPENVC_CSV_PATH", "./data/openvc_investors.csv")
