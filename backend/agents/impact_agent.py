# backend/agents/impact_agent.py
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

def evaluate_impact(text):
    prompt = (
        "You are a SPRIND analyst evaluating IMPACT & EUROPEAN STRATEGIC ALIGNMENT (10 points total):\n\n"
        
        "A. SOCIETAL/SUSTAINABILITY IMPACT (GREEN DEAL ALIGNMENT) (5 points):\n"
        "- Does the technology contribute to EU Green Deal, public health, resilience?\n"
        "- Evidence: mapping to Green Deal priorities, UN SDGs, sustainability metrics\n"
        "- Important for public funding and political support in Europe\n"
        "- Score 0-5 based on Green Deal alignment and societal impact\n\n"
        
        "B. ETHICS, DATA PROTECTION & SOCIAL ACCEPTANCE (GDPR RISK) (5 points):\n"
        "- Privacy, bioethics, public acceptance risks assessment\n"
        "- Evidence: data usage patterns, GDPR compliance requirements, bioethical considerations\n"
        "- Crucial for AI/health/biotech in EU regulatory environment\n"
        "- Score 0-5 based on ethical compliance and social acceptance\n\n"
        
        "RETURN JSON: "
        '{"sustainability_score": 4, "ethics_gdpr_score": 3, "positive_impact_points": ["impact1", "impact2"], "rationale": "detailed analysis", "green_deal_alignment": "high/medium/low"}\n\n'
        f"Research text: {text[:12000]}\n\nAssistant:"
    )

    output_text = ""
    try:
        output_text = claude_ask(prompt, max_tokens=1000)
        result = _safe_json_parse(output_text)
        if not result:
            raise ValueError("Failed to parse JSON")
        # Ensure all required fields exist
        result.setdefault("sustainability_score", 2)
        result.setdefault("ethics_gdpr_score", 2)
        result.setdefault("positive_impact_points", [])
        result.setdefault("rationale", "")
        result.setdefault("green_deal_alignment", "medium")
        return result
    except Exception as e:
        return {
            "sustainability_score": 2, 
            "ethics_gdpr_score": 2, 
            "positive_impact_points": [], 
            "rationale": f"Analysis failed: {str(e)}",
            "green_deal_alignment": "medium"
        }
