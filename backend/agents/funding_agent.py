# backend/agents/funding_agent.py
import json
from backend.utils.claude_client import claude_ask

def evaluate_funding(text):
    prompt = (
        "Given research paper, suggest suitable EU funding programs (Horizon/EIC). "
        "Return JSON: {funding_score_0_5, recommended_calls, rationale}\n\n"
        f"{text[:12000]}"
    )

    output_text = ""
    try:
        output_text = claude_ask(prompt)
        return json.loads(output_text.strip())
    except Exception:
        return {"funding_score_0_5": 2, "recommended_calls": [], "rationale": output_text[:200]}
