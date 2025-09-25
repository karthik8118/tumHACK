# backend/agents/market_agent.py
import json
import re
from rapidfuzz import fuzz, process
from backend.utils.data_utils import load_searchventures, load_openvc
from backend.utils.web_scraper import scrape_owler_company_page
from backend.utils.faiss_utils import create_faiss_index, search_faiss

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

SV_DF = load_searchventures()
OV_DF = load_openvc()
if not OV_DF.empty and "name" in OV_DF.columns:
    OV_DF["company_lower"] = OV_DF["name"].str.lower()
elif not OV_DF.empty and "investor_name" in OV_DF.columns:
    OV_DF["company_lower"] = OV_DF["investor_name"].str.lower()

FAISS_INDEX, FAISS_EMB = create_faiss_index(SV_DF) if not SV_DF.empty else (None, None)

def analyze_market_business(text, top_n=5):
    """
    Analyze MARKET & BUSINESS criteria (25 points total) for European unicorn potential
    """
    from backend.utils.claude_client import claude_ask
    import json
    
    # Claude analysis for market criteria
    market_prompt = (
        "You are a SPRIND analyst evaluating MARKET & BUSINESS potential (25 points total):\n\n"
        
        "A. CUSTOMER & VALUE PROPOSITION CLARITY (8 points):\n"
        "- Is the problem-to-customer mapping clear?\n"
        "- Evidence: user segments, value metrics, customer pain points\n"
        "- Score 0-5 based on clarity and specificity\n\n"
        
        "B. TOTAL ADDRESSABLE MARKET + EUROPEAN FRAGMENTATION (10 points):\n"
        "- Is the market large enough and realistically addressable in Europe?\n"
        "- Consider EU market fragmentation (language, regulations, reimbursement)\n"
        "- Evidence: market reports, EU-specific data, addressable segments\n"
        "- Score 0-5 based on market size and EU accessibility\n\n"
        
        "C. COMPETITIVE LANDSCAPE/DIFFERENTIATION (7 points):\n"
        "- Existing startups/incumbents/substitutes analysis\n"
        "- Evidence: Crunchbase/Dealroom data, scholarly citations\n"
        "- Score 0-5 based on competitive advantage and differentiation\n\n"
        
        "RETURN JSON: "
        '{"customer_clarity_score": 4, "tam_eu_score": 3, "competition_score": 4, "rationale": "analysis", "market_size_estimate": "€X billion"}\n\n'
        f"Research text: {text[:15000]}\n\nAssistant:"
    )
    
    try:
        claude_output = claude_ask(market_prompt, max_tokens=1000)
        market_analysis = _safe_json_parse(claude_output)
        if not market_analysis:
            raise ValueError("Failed to parse JSON")
    except Exception as e:
        market_analysis = {
            "customer_clarity_score": 2, 
            "tam_eu_score": 2, 
            "competition_score": 2, 
            "rationale": f"Analysis failed: {str(e)}",
            "market_size_estimate": "Unknown"
        }

    # FAISS semantic search for competitors
    matches = []
    if FAISS_INDEX:
        matches = search_faiss(FAISS_INDEX, SV_DF, text, top_k=top_n)
        for m in matches:
            m["source"] = "faiss"

    # Fuzzy fallback
    if len(matches) < top_n and not SV_DF.empty:
        keywords = text.split()[:10]
        fuzzy_matches = []
        for kw in keywords:
            choices = SV_DF["candidate_text"].tolist()
            results = process.extract(kw, choices, scorer=fuzz.WRatio, limit=5)
            for match_text, score, idx in results:
                row = SV_DF.iloc[idx]
                fuzzy_matches.append({
                    "company": row.get("name"),
                    "description": row.get("short_description"),
                    "country": row.get("country"),
                    "score": int(score),
                    "source": "fuzzy"
                })
        seen = set([m["company"] for m in matches])
        for fm in fuzzy_matches:
            if fm["company"] not in seen:
                matches.append(fm)
                seen.add(fm["company"])

    investors = []
    fallback = {}
    if len(matches) == 0:
        fallback = scrape_owler_company_page(text.split()[0])

    matches_sorted = sorted(matches, key=lambda x: x.get("score", 0), reverse=True)
    
    return {
        "market_analysis": market_analysis,
        "competitors": matches_sorted[:top_n], 
        "investors": investors, 
        "fallback_owler": fallback
    }

def find_competitors_semantic(text, top_n=5):
    """Legacy function - redirects to new market analysis"""
    result = analyze_market_business(text, top_n)
    return {"matches": result["competitors"], "investors": result["investors"], "fallback_owler": result["fallback_owler"]}
