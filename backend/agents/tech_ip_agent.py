# backend/agents/tech_ip_agent.py
import json
import logging
import re
from typing import Dict, Any

import requests
from backend.config import LOGICMILL_API_KEY
from backend.utils.claude_client import claude_ask
from backend.utils.web_scraper import scrape_owler_company_page
from backend.utils.faiss_utils import create_faiss_index, search_faiss
from backend.utils.data_utils import load_searchventures, load_openvc

# Load CSV datasets once
SEARCHVENTURES_DF = load_searchventures()
OPENVC_DF = load_openvc()

def claude_summarize_novelty(text: str) -> Dict[str, Any]:
    """
    Calls Claude to summarize novelty and TRL.
    Returns JSON with keys: novelty_bullets, trl, rationale
    """
    prompt = (
        "You are a VC analyst. Given research text, produce a short novelty summary (3-4 bullets) "
        "and estimate TRL (1-9). Return JSON: {novelty_bullets, trl, rationale}.\n\n"
        f"Human: TEXT:\n{text[:15000]}\n\nAssistant:"
    )
    try:
        output_text = claude_ask(
            prompt,
            model="claude-opus-4-1-20250805",
            max_tokens=800
        )
        # Try parsing as JSON
        try:
            return json.loads(output_text.strip())
        except Exception:
            m = re.search(r"\{.*\}", output_text, re.S)
            return json.loads(m.group(0)) if m else {
                "novelty_bullets": [],
                "trl": 1,
                "rationale": output_text[:500]
            }
    except Exception as e:
        logging.error("Claude summarization failed: %s", e)
        return {"novelty_bullets": [], "trl": 1, "rationale": f"Claude request failed: {str(e)}"}


def logicmill_patent_search(text: str, top_k: int = 5) -> Dict[str, Any]:
    """
    Search LogicMill patents. Returns JSON results or error.
    """
    url = "https://api.logicmill.mpg.de/v1/search"
    headers = {
        "Authorization": f"Bearer {LOGICMILL_API_KEY}",
        "Content-Type": "application/json"
    }
    body = {"text": text[:10000], "top_k": top_k}

    try:
        r = requests.post(url, headers=headers, json=body, timeout=30)
        if r.status_code == 200:
            return r.json()
        return {"error": f"LogicMill failed: {r.status_code}"}
    except Exception as e:
        logging.error("LogicMill request failed: %s", e)
        return {"error": f"LogicMill request failed: {str(e)}"}


def faiss_patent_search(text: str, top_k: int = 5) -> Dict[str, Any]:
    """
    Example FAISS search using loaded CSV datasets.
    Returns top matches from both datasets.
    """
    results = {"searchventures": [], "openvc": []}
    try:
        results["searchventures"] = search_faiss(SEARCHVENTURES_DF, SEARCHVENTURES_DF, text, top_k)
        results["openvc"] = search_faiss(OPENVC_DF, OPENVC_DF, text, top_k)
    except Exception as e:
        logging.error("FAISS search failed: %s", e)
    return results


def web_scraper_search(company_name: str, max_results: int = 5) -> Dict[str, Any]:
    """
    Search Owler for competitor/company info.
    """
    try:
        return scrape_owler_company_page(company_name, max_results)
    except Exception as e:
        logging.error("Web scraper failed: %s", e)
        return {"search_results": []}


def analyze_tech_ip(text: str) -> Dict[str, Any]:
    """
    Full Tech/IP analysis pipeline:
      - Claude novelty summary
      - LogicMill patents
      - FAISS search for similar companies
      - Web scraping for company info
    """
    summary = claude_summarize_novelty(text)
    patents = logicmill_patent_search(text)
    faiss_results = faiss_patent_search(text)
    # Example: web scraping using first novelty bullet if available
    first_bullet = summary.get("novelty_bullets", [None])[0]
    web_results = web_scraper_search(first_bullet) if first_bullet else {"search_results": []}

    return {
        "summary": summary,
        "patent_matches": patents,
        "faiss_matches": faiss_results,
        "web_matches": web_results
    }
