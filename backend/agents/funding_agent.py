from anthropic import Anthropic
from backend.config import ANTHROPIC_API_KEY
import json

claude = Anthropic(api_key=ANTHROPIC_API_KEY)

def evaluate_funding(text):
    prompt = (
        "Given research paper, suggest suitable EU funding programs (Horizon/EIC). "
        "Return JSON: {funding_score_0_5, recommended_calls, rationale}"
        "\n\nHuman:\n"
        f"{text[:12000]}"
        "\n\nAssistant:"
    )
    resp = claude.completions.create(model="claude-2.1", prompt=prompt, max_tokens_to_sample=300)
    try:
        return json.loads(resp.completion.strip())
    except Exception as e:
        print(f"Error parsing JSON response: {e}")
        return {"funding_score_0_5": 2, "recommended_calls": [], "rationale": resp.completion.strip()}
