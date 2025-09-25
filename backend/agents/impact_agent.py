# backend/agents/impact_agent.py
import json
from backend.utils.claude_client import claude_ask

def evaluate_impact(text):
    prompt = (
        "Assess societal and environmental impact (e.g., SDGs, Green Deal) of research. "
        'Return JSON: {"impact_score_0_5": int, "positive_impact_points": [str], "rationale": str}\n\n'
        f"{text[:12000]}"
    )

    output_text = ""
    try:
        output_text = claude_ask(prompt)
        return json.loads(output_text.strip())
    except Exception:
        return {"impact_score_0_5": 2, "positive_impact_points": [], "rationale": output_text[:200]}
