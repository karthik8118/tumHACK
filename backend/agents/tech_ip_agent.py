# backend/agents/tech_ip_agent.py
import json
import logging
import re
from typing import Any, Dict, List

from backend.utils.claude_client import claude_ask
from backend.utils.logicmill_client import logicmill_patent_search
from backend.utils.faiss_utils import create_faiss_index, search_faiss
from backend.utils.data_utils import load_searchventures

# Load SearchVentures CSV & build FAISS index
try:
    SV_DF = load_searchventures() or []
except Exception:
    SV_DF = []

FAISS_INDEX = None
try:
    if hasattr(SV_DF, "empty") and not SV_DF.empty:
        FAISS_INDEX, _ = create_faiss_index(SV_DF, text_column="candidate_text")
except Exception:
    logging.exception("Failed to create FAISS index at import")
    FAISS_INDEX = None

def _safe_json_parse(s: str) -> Any:
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

def claude_summarize_novelty(text: str) -> Dict[str, Any]:
    default = {"novelty_bullets": [], "trl": 1, "rationale": "", "novelty_score": 0, "ip_potential": 0}
    if not text:
        return default

    prompt = (
        "You are a SPRIND (German Federal Agency for Disruptive Innovation) analyst evaluating research for unicorn potential. "
        "Analyze this research paper for TECHNOLOGY & IP criteria (25 points total):\n\n"
        
        "A. NOVELTY/SCIENTIFIC ADVANCEMENT (15 points):\n"
        "- Does the research contain novel scientific/technical claims that materially outperform existing methods?\n"
        "- Look for: novel methods, benchmarks, citation gaps, advancement potential\n"
        "- Score 0-5 based on scientific advancement level\n\n"
        
        "B. TRL/ENGINEERING FEASIBILITY (5 points):\n"
        "- Estimate Technology Readiness Level (1-9)\n"
        "- Higher scores for: prototypes, reproducible code, replication shown\n"
        "- Evidence: methods, experiments, datasets, implementation details\n\n"
        
        "C. IP & PATENTABILITY (5 points):\n"
        "- Is it patentable/blocked by prior art?\n"
        "- Are there existing patents in this domain?\n"
        "- Consider EPO (European Patent Office) context\n\n"
        
        "RETURN JSON exactly: "
        '{"novelty_bullets": ["bullet1", "bullet2"], "trl": 5, "novelty_score": 4, "ip_potential": 3, "rationale": "detailed analysis"}\n\n'
        f"Research text: {text[:15000]}\n\nAssistant:"
    )

    try:
        output_text = claude_ask(prompt, max_tokens=800)
        parsed = _safe_json_parse(output_text)
        if isinstance(parsed, dict):
            parsed["novelty_bullets"] = parsed.get("novelty_bullets", []) or []
            parsed["trl"] = int(parsed.get("trl", 1) or 1)
            parsed["rationale"] = parsed.get("rationale", "") or ""
            return parsed
        # If Claude response is not valid JSON, use fallback analysis
        return _intelligent_fallback_analysis(text)
    except Exception as e:
        logging.exception("Claude summarization failed")
        # Use fallback analysis instead of hardcoded values
        return _intelligent_fallback_analysis(text)

def _intelligent_fallback_analysis(text: str) -> Dict[str, Any]:
    """Fallback analysis using FAISS and LogicMill data"""
    try:
        # Get FAISS similarities
        similar_companies = faiss_similarities(text, top_k=3)
        
        # Get LogicMill patent data
        patent_data = logicmill_search_wrapper(text)
        
        # Analyze text for keywords
        text_lower = text.lower()
        
        # Determine novelty based on keywords
        novelty_keywords = ['novel', 'first', 'innovative', 'new', 'advanced', 'improved', 'enhanced']
        novelty_score = min(5, sum(1 for keyword in novelty_keywords if keyword in text_lower))
        
        # Determine TRL based on implementation details
        trl_keywords = ['prototype', 'implementation', 'deployment', 'production', 'clinical trial', 'pilot study']
        trl = min(9, 3 + sum(1 for keyword in trl_keywords if keyword in text_lower))
        
        # Determine IP potential
        ip_keywords = ['patent', 'intellectual property', 'proprietary', 'algorithm', 'method', 'system']
        ip_potential = min(5, sum(1 for keyword in ip_keywords if keyword in text_lower))
        
        # Create rationale
        rationale = f"Fallback analysis based on text content. Found {len(similar_companies)} similar companies. "
        if patent_data and 'data' in patent_data:
            rationale += "Patent similarity analysis available. "
        rationale += f"Novelty indicators: {novelty_score}/5, TRL estimate: {trl}/9, IP potential: {ip_potential}/5."
        
        return {
            "novelty_bullets": [f"Text analysis suggests {novelty_score}/5 novelty level"],
            "trl": trl,
            "novelty_score": novelty_score,
            "ip_potential": ip_potential,
            "rationale": rationale
        }
    except Exception as e:
        return {"novelty_bullets": [], "trl": 3, "rationale": f"Fallback analysis failed: {str(e)}", "novelty_score": 2, "ip_potential": 2}

def logicmill_search_wrapper(text: str):
    """
    Wrapper around the LogicMill client returning the raw JSON or error dict.
    """
    try:
        return logicmill_patent_search(text)
    except Exception as e:
        return {"error": f"LogicMill call failed: {str(e)}"}


def faiss_similarities(text: str, top_k: int = 5) -> List[Dict[str, Any]]:
    if FAISS_INDEX is None or SV_DF is None or getattr(SV_DF, "empty", True):
        return []

    try:
        results = search_faiss(FAISS_INDEX, SV_DF, text, top_k=top_k)
        out = []
        for r in results:
            out.append({
                "company": r.get("company", ""),
                "description": r.get("description", ""),
                "country": r.get("country", ""),
                "distance": float(r.get("distance", 0.0))
            })
        return out
    except Exception:
        logging.exception("FAISS search failed")
        return []

def analyze_tech_ip(text: str):
    result = {
        "summary": {"novelty_bullets": [], "trl": 1, "rationale": ""},
        "patent_matches": {},
        "faiss_matches": []
    }

    # Claude
    try:
        result["summary"] = claude_ask(
            f"Summarize novelty and TRL (1-9) for this research: {text[:15000]}"
        )
    except Exception as e:
        result["summary"]["rationale"] = f"Claude request failed: {str(e)}"

    # LogicMill
    try:
        result["patent_matches"] = logicmill_patent_search(text)
    except Exception as e:
        result["patent_matches"] = {"error": f"LogicMill call failed: {str(e)}"}

    return result

