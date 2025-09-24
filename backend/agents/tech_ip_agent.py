from anthropic import Anthropic
from backend.config import ANTHROPIC_API_KEY, LOGICMILL_API_KEY
import requests, json, re

claude = Anthropic(api_key=ANTHROPIC_API_KEY)

def claude_summarize_novelty(text):
    prompt = (
        "You are a VC analyst. Given research text, produce a short novelty summary (3-4 bullets) "
        "and estimate TRL (1-9). Return JSON: {novelty_bullets, trl, rationale}.\n\n"
        f"TEXT:\n{text[:15000]}"
    )
    resp = claude.completions.create(
        model="claude-2.1",
        prompt=prompt,
        max_tokens_to_sample=800
    )
    # Different Anthropic API versions or SDKs may return the output under 'completion' or 'response', so we check both for compatibility.
    output_text = getattr(resp, "completion", "") or getattr(resp, "response", "") or ""
    try:
        return json.loads(output_text.strip())
    except Exception:
        m = re.search(r"\{.*?\}", output_text, re.S)
        m = re.search(r"\{.*\}", output_text, re.S)
        return json.loads(m.group(0)) if m else {"novelty_bullets": [], "trl": 1, "rationale": output_text[:500]}

def logicmill_patent_search(text, top_k=5):
    url = "https://api.logicmill.mpg.de/v1/search"
    headers = {"Authorization": f"Bearer {LOGICMILL_API_KEY}", "Content-Type": "application/json"}
    body = {"text": text[:10000], "top_k": top_k}
    r = None
    try:
        r = requests.post(url, headers=headers, json=body, timeout=30)
        if r.status_code == 200:
            return r.json()
    except Exception:
        pass
    return {"error": f"LogicMill failed or returned {r.status_code if r is not None else 'N/A'}"}

def analyze_tech_ip(text):
    summary = claude_summarize_novelty(text)
    patents = logicmill_patent_search(text)
    return {"summary": summary, "patent_matches": patents}
