import os
import json
import datetime
import logging
from backend.config import RUN_LOG_DIR

def setup_file_logging():
    logger = logging.getLogger()
    if not any(isinstance(h, logging.FileHandler) and RUN_LOG_DIR in getattr(h, "baseFilename", "")
               for h in logger.handlers):
        fh = logging.FileHandler(os.path.join(RUN_LOG_DIR, "latest.log"))
        fh.setLevel(logging.INFO)
        formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
        fh.setFormatter(formatter)
        logger.addHandler(fh)

def save_run_log(results: dict, prefix="run"):
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{prefix}_{ts}.json"
    path = os.path.join(RUN_LOG_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    logging.getLogger().info(f"Saved run log to {path}")
    return path
