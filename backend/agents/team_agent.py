from anthropic import Anthropic
from backend.config import ANTHROPIC_API_KEY
import json

claude = Anthropic(api_key=ANTHROPIC_API_KEY)

def evaluate_team(authors_text):
    prompt = (
        "You are a VC analyst. Given the authors of a research paper, assess team completeness "
        "and potential gaps for a startup. Return JSON: {team_score_0_5, missing_roles, rationale}\n\n"
        "Human: "
        f"{authors_text[:5000]}"
        "\n\nAssistant:"
    )
    resp = claude.completions.create(model="claude-2.1", prompt=prompt, max_tokens_to_sample=300)
    try:
        return json.loads(resp.completion.strip())
    except Exception as e:
        print(f"Error decoding JSON from Claude response: {e}\nRaw completion: {resp.completion}")
        return {
            "team_score_0_5": 2,
            "missing_roles": [],
            "rationale": resp.completion.strip()[:200]
        }
