from anthropic import Anthropic
from backend.config import ANTHROPIC_API_KEY
import json

claude = Anthropic(api_key=ANTHROPIC_API_KEY)

# Truncation lengths for prompt and fallback rationale
PROMPT_TRUNCATION_LENGTH = 12000
RATIONALE_TRUNCATION_LENGTH = 200

def evaluate_scaling(text):
    """
    Evaluates scaling feasibility and risks for a startup idea.
    Truncates input text to PROMPT_TRUNCATION_LENGTH for prompt,
    and rationale to RATIONALE_TRUNCATION_LENGTH for fallback.
    """
    prompt = (
        "\n\nHuman: Assess feasibility and scaling risks for a potential startup based on research. "
        "Return JSON: {scaling_score_0_5, risks, rationale}\n\n"
        f"{text[:PROMPT_TRUNCATION_LENGTH]}"
        "\n\nAssistant:"
    )
    resp = claude.completions.create(model="claude-2.1", prompt=prompt, max_tokens_to_sample=300)
    try:
        return json.loads(resp.completion.strip())
    except Exception:
        return {
            "scaling_score_0_5": 2,
            "risks": [],
            "rationale": resp.completion[:RATIONALE_TRUNCATION_LENGTH]
        }
