import pandas as pd
import logging
from backend.config import SEARCHVENTURES_CSV, OPENVC_CSV

def load_searchventures():
    try:
        df = pd.read_csv(SEARCHVENTURES_CSV)
        df.columns = [c.lower() for c in df.columns]
        return df
    except Exception as e:
        logging.error("searchventures load error: %s", e)
        return pd.DataFrame()
        return pd.DataFrame()
def load_openvc():
    try:
        df = pd.read_csv(OPENVC_CSV)
        df.columns = [c.lower() for c in df.columns]
        return df
    except Exception as e:
        logging.error("openvc load error: %s", e)
        return pd.DataFrame()
        return df
        logging.error("openvc load error: %s", e)
        return pd.DataFrame()
        return pd.DataFrame()
