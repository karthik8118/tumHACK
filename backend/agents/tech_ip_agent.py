# backend/agents/tech_ip_agent.py
import json
import logging
import re
from typing import Any, Dict, List

from backend.utils.claude_client import claude_ask
from backend.utils.logicmill_client import logicmill_patent_search
from backend.utils.faiss_utils import create_faiss_index, search_faiss
from backend.utils.data_utils import load_searchventures

# Module-level: load CSVs and build FAISS index once (fast subsequent calls)
try:
    SV_DF = load_searchventures()
    if SV_DF is None:
        SV_DF = []
except Exception:
    SV_DF = []

FAISS_INDEX = None
try:
    if hasattr(SV_DF, "empty"):
        if not SV_DF.empty:
            FAISS_INDEX, _ = create_faiss_index(SV_DF, text_column='candidate_text')
except Exception:
    logging.exception("Failed to create FAISS index at import time")
    FAISS_INDEX = None


def _safe_json_parse(s: str) -> Any:
    """Try direct JSON parse, then curly-brace extraction, else None."""
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
    """
    Call Claude to produce novelty bullets and TRL. Always returns a dict with keys:
    novelty_bullets (list), trl (int 1-9), rationale (str)
    """
    default = {"novelty_bullets": [], "trl": 1, "rationale": ""}
    if not text:
        return default

    prompt = (
        "You are a VC analyst. Given research text, produce a short novelty summary (3-4 bullets) "
        "and estimate TRL (1-9). RETURN JSON exactly in this shape: "
        '{"novelty_bullets": ["..."], "trl": 5, "rationale": "..." }.\n\n'
        f"Human: {text[:15000]}\n\nAssistant:"
    )

    output_text = ""
    try:
        output_text = claude_ask(prompt, model="claude-opus-4-1-20250805", max_tokens=800)
        parsed = _safe_json_parse(output_text)
        if isinstance(parsed, dict):
            # validate keys
            parsed["novelty_bullets"] = parsed.get("novelty_bullets", []) or []
            parsed["trl"] = int(parsed.get("trl", 1) or 1)
            parsed["rationale"] = parsed.get("rationale", "") or ""
            return parsed
        # fallback: return best-effort text
        return {"novelty_bullets": [], "trl": 1, "rationale": (output_text or "")[:1000]}
    except Exception as e:
        logging.exception("Claude summarization failed")
        return {"novelty_bullets": [], "trl": 1, "rationale": f"Claude request failed: {str(e)}"}


def logicmill_search_wrapper(text: str) -> Dict[str, Any]:
    """
    Wrapper around the logicmill client returning the raw JSON or error dict.
    """
    try:
        return logicmill_patent_search(text)
    except Exception as e:
        logging.exception("LogicMill wrapper exception")
        return {"error": f"LogicMill call failed: {str(e)}"}


def faiss_similarities(text: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Run FAISS search against the SearchVentures (SV_DF) dataset if available.
    Returns list of result dicts (possibly empty).
    """
    if FAISS_INDEX is None or SV_DF is None or getattr(SV_DF, "empty", True):
        return []

    try:
        results = search_faiss(FAISS_INDEX, SV_DF, text, top_k=top_k)
        # Normalize results
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


def analyze_tech_ip(text: str) -> Dict[str, Any]:
    """
    High-level Tech/IP analysis pipeline:
      - Claude novelty/TRL
      - LogicMill patent similarity (GraphQL)
      - FAISS similarity from CSV snapshot
    Returns structured JSON with partial results even on failures.
    """
    # Keep function robust: always return a dict
    result: Dict[str, Any] = {
        "summary": {"novelty_bullets": [], "trl": 1, "rationale": ""},
        "patent_matches": {},
        "faiss_matches": []
    }

    # 1) Claude summary
    try:
        summary = claude_summarize_novelty(text)
        result["summary"] = summary
    except Exception:
        logging.exception("Error running Claude summary")
        result["summary"] = {"novelty_bullets": [], "trl": 1, "rationale": ""}

    # 2) LogicMill: GraphQL-based similarity
    try:
        lm = logicmill_search_wrapper(text)
        result["patent_matches"] = lm
    except Exception:
        logging.exception("Error calling LogicMill")
        result["patent_matches"] = {"error": "LogicMill call failed unexpectedly."}

    # 3) FAISS fallback/supplement
    try:
        faiss_matches = faiss_similarities(text, top_k=5)
        result["faiss_matches"] = faiss_matches
    except Exception:
        logging.exception("Error running FAISS")
        result["faiss_matches"] = []

    return result
