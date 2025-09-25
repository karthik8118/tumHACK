import os
import json
import datetime
import logging

LOG_DIR = os.getenv("RUN_LOG_DIR", "./logs")
os.makedirs(LOG_DIR, exist_ok=True)

def setup_file_logging():
    """
    Call once at startup to add a file handler for runtime logs.
    """
    logger = logging.getLogger()
    if not any(isinstance(h, logging.FileHandler) and LOG_DIR in getattr(h, "baseFilename", "") for h in logger.handlers):
        fh = logging.FileHandler(os.path.join(LOG_DIR, "latest.log"))
        fh.setLevel(logging.INFO)
        formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
        fh.setFormatter(formatter)
        logger.addHandler(fh)

def save_run_log(results: dict, prefix="run"):
    """
    Save a timestamped JSON of the pipeline/agent result for auditing.
    Returns the path to the saved JSON.
    """
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{prefix}_{ts}.json"
    path = os.path.join(LOG_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    logging.getLogger().info(f"Saved run log to {path}")
    return path
