# backend/utils/logicmill_client.py
import logging
from requests import Session
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
from backend.config import LOGICMILL_TOKEN, LOGICMILL_URL

# Create a robust session with retries
_session = Session()
_retries = Retry(total=5, backoff_factor=0.2, status_forcelist=[500, 502, 503, 504])
_adapter = HTTPAdapter(max_retries=_retries)
_session.mount("https://", _adapter)

def logicmill_patent_search(text: str, top_k: int = 5):
    """
    Query LogicMill GraphQL endpoint for similarity (patspecter model).
    Returns parsed JSON or {"error": "..."} on failure.
    """
    if not LOGICMILL_TOKEN:
        return {"error": "LogicMill token not configured (LOGICMILL_TOKEN missing)."}

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {LOGICMILL_TOKEN}",
    }

    query = """
    query encodeDocumentAndSimilarityCalculation($data: [EncodeObject], $similarityMetric: similarityMetric, $model: String!) {
      encodeDocumentAndSimilarityCalculation(
        data: $data
        similarityMetric: $similarityMetric
        model: $model
      ) {
        similarities
        xs { id }
        ys { id }
      }
    }
    """

    # We send the input as a single 'input' id; LogicMill computes similarities
    variables = {
        "model": "patspecter",
        "similarityMetric": "cosine",
        "data": [
            {
                "id": "input",
                "parts": [
                    {"key": "abstract", "value": text[:5000]}
                ]
            }
        ],
    }

    try:
        resp = _session.post(LOGICMILL_URL, headers=headers, json={"query": query, "variables": variables}, timeout=30)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logging.exception("LogicMill request failed")
        return {"error": f"LogicMill request failed: {str(e)}"}
