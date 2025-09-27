# backend/agents/funding_agent.py
import json
import re
from typing import Dict, Any, Optional
from utils.claude_client import claude_ask
from config import FUNDING_CONFIG, BACKEND_FALLBACK_CONFIG

def _safe_json_parse(s: str) -> Optional[Dict[str, Any]]:
    """Safely parse JSON from string with fallback regex extraction"""
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

def _get_hardcoded_funding_analysis(text: str) -> Dict[str, Any]:
    """Generate hardcoded funding analysis based on backend configuration"""
    
    # Simple keyword-based scoring for backend dependency
    text_lower = text.lower()
    
    # Start with default scores from backend configuration
    funding_fit_score = FUNDING_CONFIG["default_funding_fit_score"]
    exit_prospects_score = FUNDING_CONFIG["default_exit_prospects_score"]
    
    # Apply sector-specific boosts from backend configuration
    keyword_boosts = FUNDING_CONFIG["keyword_boost_sectors"]
    
    for sector, boosts in keyword_boosts.items():
        if sector in text_lower:
            funding_fit_score = min(5, funding_fit_score + boosts["funding_boost"])
            exit_prospects_score = min(5, exit_prospects_score + boosts["exit_boost"])
    
    # Additional keyword matching for more specific terms
    if any(keyword in text_lower for keyword in ["artificial intelligence", "machine learning", "deep learning"]):
        funding_fit_score = min(5, funding_fit_score + 1)
        exit_prospects_score = min(5, exit_prospects_score + 1)
    
    if any(keyword in text_lower for keyword in ["medical", "pharmaceutical", "diagnostic"]):
        funding_fit_score = min(5, funding_fit_score + 1)
        exit_prospects_score = min(5, exit_prospects_score + 1)
    
    if any(keyword in text_lower for keyword in ["green", "climate", "renewable", "carbon"]):
        funding_fit_score = min(5, funding_fit_score + 1)
    
    if any(keyword in text_lower for keyword in ["blockchain", "cryptocurrency", "fintech"]):
        exit_prospects_score = min(5, exit_prospects_score + 1)
    
    # Generate rationale based on backend analysis
    rationale = f"Backend analysis indicates strong funding potential with {funding_fit_score}/5 funding fit and {exit_prospects_score}/5 exit prospects. "
    
    if funding_fit_score >= 4:
        rationale += "Excellent alignment with EU funding programs and strong market demand. High priority for Horizon Europe and EIC Accelerator programs."
    elif funding_fit_score >= 3:
        rationale += "Good funding potential with multiple available pathways including national grants and targeted EU programs."
    else:
        rationale += "Moderate funding potential requiring strategic positioning and targeted grant applications."
    
    # Add sector-specific insights
    if any(sector in text_lower for sector in ["ai", "artificial intelligence"]):
        rationale += " AI sector shows strong investor appetite and EU funding support."
    elif any(sector in text_lower for sector in ["healthcare", "medical"]):
        rationale += " Healthcare sector benefits from EU health innovation initiatives."
    elif any(sector in text_lower for sector in ["sustainability", "green"]):
        rationale += " Green technology aligns with EU Green Deal funding priorities."
    
    return {
        "funding_fit_score": funding_fit_score,
        "exit_prospects_score": exit_prospects_score,
        "recommended_calls": FUNDING_CONFIG["fallback_recommended_calls"],
        "rationale": rationale,
        "funding_timeline": FUNDING_CONFIG["fallback_timeline"],
        "analysis_type": "backend_hardcoded",
        "backend_config_used": {
            "default_scores": {
                "funding_fit": FUNDING_CONFIG["default_funding_fit_score"],
                "exit_prospects": FUNDING_CONFIG["default_exit_prospects_score"]
            },
            "ai_analysis_enabled": FUNDING_CONFIG["enable_ai_analysis"]
        }
    }

def evaluate_funding(text: str) -> Dict[str, Any]:
    """
    Evaluate funding potential with backend-dependent hardcoded fallback
    
    Args:
        text: Research text to analyze
        
    Returns:
        Dict containing funding analysis results
    """
    
    # Use hardcoded analysis as primary method (backend-dependent)
    if BACKEND_FALLBACK_CONFIG["use_hardcoded_analysis"] or not FUNDING_CONFIG["enable_ai_analysis"]:
        return _get_hardcoded_funding_analysis(text)
    
    # Fallback to AI analysis only if explicitly enabled and external APIs are allowed
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

    try:
        output_text = claude_ask(prompt, max_tokens=1000)
        result = _safe_json_parse(output_text)
        if not result:
            raise ValueError("Failed to parse JSON from AI response")
        
        # Ensure all required fields exist with backend defaults
        result.setdefault("funding_fit_score", FUNDING_CONFIG["default_funding_fit_score"])
        result.setdefault("exit_prospects_score", FUNDING_CONFIG["default_exit_prospects_score"])
        result.setdefault("recommended_calls", FUNDING_CONFIG["fallback_recommended_calls"])
        result.setdefault("rationale", "AI analysis completed")
        result.setdefault("funding_timeline", FUNDING_CONFIG["fallback_timeline"])
        result["analysis_type"] = "ai_analysis"
        
        return result
        
    except Exception as e:
        # Fallback to hardcoded analysis on any error
        fallback_result = _get_hardcoded_funding_analysis(text)
        fallback_result["rationale"] += f" (AI analysis failed: {str(e)})"
        return fallback_result
