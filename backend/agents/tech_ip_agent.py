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
    default = {"novelty_bullets": [], "trl": 1, "rationale": ""}
    if not text:
        return default

    prompt = (
        "You are a VC analyst. Given research text, produce a short novelty summary (3-4 bullets) "
        "and estimate TRL (1-9). RETURN JSON exactly in this shape: "
        '{"novelty_bullets": ["..."], "trl": 5, "rationale": "..." }.\n\n'
        f"Human: {text[:15000]}\n\nAssistant:"
    )

    try:
        output_text = claude_ask(prompt, max_tokens=800)
        parsed = _safe_json_parse(output_text)
        if isinstance(parsed, dict):
            parsed["novelty_bullets"] = parsed.get("novelty_bullets", []) or []
            parsed["trl"] = int(parsed.get("trl", 1) or 1)
            parsed["rationale"] = parsed.get("rationale", "") or ""
            return parsed
        return {"novelty_bullets": [], "trl": 1, "rationale": (output_text or "")[:1000]}
    except Exception as e:
        logging.exception("Claude summarization failed")
        return {"novelty_bullets": [], "trl": 1, "rationale": f"Claude request failed: {str(e)}"}

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

