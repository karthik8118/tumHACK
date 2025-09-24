from anthropic import Anthropic
from backend.config import ANTHROPIC_API_KEY
import json

claude = Anthropic(api_key=ANTHROPIC_API_KEY)

def evaluate_impact(text):
    prompt = (
        "Assess societal and environmental impact (e.g., SDGs, Green Deal) of research. "
        'Return JSON in the following format: {"impact_score_0_5": int, "positive_impact_points": [str], "rationale": str}\n\n'
        f"{text[:12000]}"
    )
    resp = claude.completions.create(model="claude-2.1", prompt=prompt, max_tokens_to_sample=300)
    try:
        return json.loads(resp.completion.strip())
    except:
        return {"impact_score_0_5": 2, "positive_impact_points": [], "rationale": resp.completion[:200]}
