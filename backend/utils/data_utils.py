import pandas as pd
from backend.config import SEARCHVENTURES_CSV, OPENVC_CSV

def load_searchventures():
    try:
        df = pd.read_csv(SEARCHVENTURES_CSV)
        df.columns = [c.lower() for c in df.columns]
        return df
    except Exception as e:
        print("searchventures load error:", e)
        return pd.DataFrame()

def load_openvc():
    try:
        df = pd.read_csv(OPENVC_CSV)
        df.columns = [c.lower() for c in df.columns]
        return df
    except Exception as e:
        print("openvc load error:", e)
        return pd.DataFrame()
