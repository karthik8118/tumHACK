# backend/agents/team_agent.py
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

def evaluate_team(authors_text, paper_text=""):
    prompt = (
        "You are a SPRIND analyst evaluating TEAM & FOUNDING POTENTIAL (15 points total):\n\n"
        
        "A. RESEARCH TEAM'S TRANSLATIONAL TRACK RECORD (10 points):\n"
        "- Have authors spun out startups, licensed tech, or commercialized before?\n"
        "- Evidence: author bios, ORCID, LinkedIn, prior startups, industry experience\n"
        "- SPRIND emphasizes expert leadership and translational experience\n"
        "- Score 0-5 based on commercialization track record\n\n"
        
        "B. COMPLEMENTARY SKILLS & HIRING FEASIBILITY IN EU (5 points):\n"
        "- Are required skills (hardware, software, clinical trials) available in target region?\n"
        "- Evidence: job market/skills shortage reports (EURES/Eurostat)\n"
        "- Consider EU talent availability and hiring challenges\n"
        "- Score 0-5 based on EU skills availability\n\n"
        
        "RETURN JSON: "
        '{"translational_score": 4, "eu_skills_score": 3, "missing_roles": ["CEO", "CTO"], "rationale": "detailed analysis", "founding_potential": "high/medium/low"}\n\n'
        f"Authors: {authors_text[:5000]}\n"
        f"Research context: {paper_text[:5000]}\n\nAssistant:"
    )

    output_text = ""
    try:
        output_text = claude_ask(prompt, max_tokens=800)
        result = _safe_json_parse(output_text)
        if not result:
            raise ValueError("Failed to parse JSON")
        # Ensure all required fields exist
        result.setdefault("translational_score", 2)
        result.setdefault("eu_skills_score", 2)
        result.setdefault("missing_roles", [])
        result.setdefault("rationale", "")
        result.setdefault("founding_potential", "medium")
        return result
    except Exception as e:
        # fallback: return default
        return {
            "translational_score": 2, 
            "eu_skills_score": 2, 
            "missing_roles": [], 
            "rationale": f"Analysis failed: {str(e)}",
            "founding_potential": "medium"
        }
