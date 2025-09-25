import json, re, requests
from backend.config import LOGICMILL_API_KEY
from backend.utils.claude_client import claude_ask
from backend.utils.faiss_utils import create_faiss_index, search_faiss
from backend.utils.data_utils import load_searchventures

# Prepare FAISS index
SV_DF = load_searchventures()
FAISS_INDEX, FAISS_EMB = create_faiss_index(SV_DF) if not SV_DF.empty else (None, None)

def claude_summarize_novelty(text: str):
    prompt = (
        "You are a VC analyst. Given research text, produce a short novelty summary (3-4 bullets) "
        "and estimate TRL (1-9). Return JSON: {novelty_bullets, trl, rationale}.\n\n"
        f"{text[:15000]}"
    )
    output_text = ""
    try:
        output_text = claude_ask(prompt)
        return json.loads(output_text.strip())
    except Exception:
        try:
            m = re.search(r"\{.*\}", output_text, re.S)
            return json.loads(m.group(0)) if m else {"novelty_bullets": [], "trl": 1, "rationale": output_text[:500]}
        except Exception:
            return {"novelty_bullets": [], "trl": 1, "rationale": "Failed to parse Claude output."}

def logicmill_patent_search(text: str, top_k: int = 5):
    url = "https://api.logicmill.mpg.de/v1/search"
    headers = {
        "Authorization": f"Bearer {LOGICMILL_API_KEY}",
        "Content-Type": "application/json"
    }
    body = {"text": text[:10000], "top_k": top_k}

    try:
        r = requests.post(url, headers=headers, json=body, timeout=30)
        if r.status_code == 200:
            return r.json()
        return {"error": f"LogicMill failed: {r.status_code}"}
    except Exception as e:
        return {"error": f"LogicMill request failed: {str(e)}"}

def analyze_tech_ip(text: str):
    summary = claude_summarize_novelty(text)
    patents = logicmill_patent_search(text)

    faiss_results = []
    if FAISS_INDEX is not None and not SV_DF.empty:
        try:
            faiss_results = search_faiss(FAISS_INDEX, SV_DF, text, top_k=5)
        except Exception:
            faiss_results = []

    return {"summary": summary, "patent_matches": patents, "faiss_matches": faiss_results}
