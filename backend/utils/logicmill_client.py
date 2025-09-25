import requests
from backend.config import LOGICMILL_API_KEY, LOGICMILL_URL

def logicmill_patent_search(text: str):
    if not LOGICMILL_API_KEY:
        raise ValueError("LogicMill token not set in environment")

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

    variables = {
        "model": "patspecter",
        "similarityMetric": "cosine",
        "data": [{"id": "input", "parts": [{"key": "abstract", "value": text}]}]
    }

    resp = requests.post(
        LOGICMILL_URL,
        headers={
            "Authorization": f"Bearer {LOGICMILL_API_KEY}",
            "Content-Type": "application/json"
        },
        json={"query": query, "variables": variables},
        timeout=10
    )
    resp.raise_for_status()
    return resp.json()
