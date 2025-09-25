# backend/agents/funding_agent.py
import json
import re
from backend.utils.claude_client import claude_ask

def _safe_json_parse(s: str):
    if not s:
        return None
    try:
        return json.loads(s.strip())
    except Exception:
        m = re.search(r"\{.*\}", s, re.S)
        if m:
            try:
                return json.loads(m.group(0))
            except Exception:
                return None
    return None

def evaluate_funding(text):
    prompt = (
        "You are a SPRIND analyst evaluating FUNDING & EXIT ENVIRONMENT (10 points total):\n\n"
        
        "A. FUNDRAISING FIT (PUBLIC + PRIVATE) IN EU (5 points):\n"
        "- Is there an accessible funding path (Horizon, EIC, national grants, VC interest)?\n"
        "- Evidence: eligibility for Horizon/SPRIND/EIF funds; VC market size for the sector\n"
        "- Consider Horizon Europe calls, EIC Accelerator, national funding programs\n"
        "- Score 0-5 based on EU funding accessibility\n\n"
        
        "B. EXIT PROSPECTS/INVESTOR APPETITE IN EUROPE (5 points):\n"
        "- Are there acquirers or IPO capacity in this domain in Europe?\n"
        "- Evidence: M&A history, strategic acquirers, EU IPO market signals\n"
        "- Consider sector-specific exit trends in Europe\n"
        "- Score 0-5 based on European exit potential\n\n"
        
        "RETURN JSON: "
        '{"funding_fit_score": 4, "exit_prospects_score": 3, "recommended_calls": ["Horizon Europe", "EIC"], "rationale": "detailed analysis", "funding_timeline": "X months"}\n\n'
        f"Research text: {text[:12000]}\n\nAssistant:"
    )

    output_text = ""
    try:
        output_text = claude_ask(prompt, max_tokens=1000)
        result = _safe_json_parse(output_text)
        if not result:
            raise ValueError("Failed to parse JSON")
        # Ensure all required fields exist
        result.setdefault("funding_fit_score", 2)
        result.setdefault("exit_prospects_score", 2)
        result.setdefault("recommended_calls", [])
        result.setdefault("rationale", "")
        result.setdefault("funding_timeline", "Unknown")
        return result
    except Exception as e:
        return {
            "funding_fit_score": 2, 
            "exit_prospects_score": 2, 
            "recommended_calls": [], 
            "rationale": f"Analysis failed: {str(e)}",
            "funding_timeline": "Unknown"
        }
