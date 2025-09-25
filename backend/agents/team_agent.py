import json
from backend.utils.claude_client import claude_ask

def evaluate_team(authors_text):
    prompt = (
        "You are a VC analyst. Given the authors of a research paper, assess team completeness "
        "and potential gaps for a startup. Return JSON: {team_score_0_5, missing_roles, rationale}\n\n"
        f"{authors_text[:5000]}"
    )
    output_text = ""
    try:
        output_text = claude_ask(prompt)
        return json.loads(output_text.strip())
    except Exception:
        try:
            m = json.loads(output_text)
            return m
        except Exception:
            return {"team_score_0_5": 2, "missing_roles": [], "rationale": output_text[:200]}
