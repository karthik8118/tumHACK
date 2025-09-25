import json
from backend.utils.claude_client import claude_ask

def evaluate_scaling(text):
    prompt = (
        "Assess feasibility and scaling risks for a potential startup based on research. "
        "Return JSON: {scaling_score_0_5, risks, rationale}\n\n"
        f"{text[:12000]}"
    )
    output_text = ""
    try:
        output_text = claude_ask(prompt)
        return json.loads(output_text.strip())
    except Exception:
        return {"scaling_score_0_5": 2, "risks": [], "rationale": output_text[:200]}
