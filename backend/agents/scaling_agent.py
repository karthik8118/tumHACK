# backend/agents/scaling_agent.py
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

def evaluate_scaling(text):
    prompt = (
        "You are a SPRIND analyst evaluating SCALING & GO-TO-MARKET potential (15 points total):\n\n"
        
        "A. MANUFACTURING/SCALE FEASIBILITY (8 points):\n"
        "- If physical product: EU supply chain readiness & cost analysis\n"
        "- Evidence: supply chain complexity, component sources, manufacturing requirements\n"
        "- Consider cleantech/healthcare specific challenges\n"
        "- Score 0-5 based on EU manufacturing feasibility\n\n"
        
        "B. REGULATORY PATHWAY (EU) (7 points):\n"
        "- Is there a clear path (CE mark, MDR, EMA, GDPR compliance)?\n"
        "- What is the expected time/cost for regulatory approval?\n"
        "- Evidence: regulatory class, known standards, compliance requirements\n"
        "- Major weight for medtech, energy, agri sectors\n"
        "- Score 0-5 based on EU regulatory clarity and feasibility\n\n"
        
        "RETURN JSON: "
        '{"manufacturing_score": 4, "regulatory_score": 3, "risks": ["risk1", "risk2"], "rationale": "detailed analysis", "time_to_market": "X years"}\n\n'
        f"Research text: {text[:12000]}\n\nAssistant:"
    )

    output_text = ""
    try:
        output_text = claude_ask(prompt, max_tokens=1000)
        result = _safe_json_parse(output_text)
        if not result:
            raise ValueError("Failed to parse JSON")
        # Ensure all required fields exist
        result.setdefault("manufacturing_score", 2)
        result.setdefault("regulatory_score", 2)
        result.setdefault("risks", [])
        result.setdefault("rationale", "")
        result.setdefault("time_to_market", "Unknown")
        return result
    except Exception as e:
        return {
            "manufacturing_score": 2, 
            "regulatory_score": 2, 
            "risks": [], 
            "rationale": f"Analysis failed: {str(e)}",
            "time_to_market": "Unknown"
        }
