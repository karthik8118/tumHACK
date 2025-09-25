# backend/crew_pipeline.py
import logging
from backend.agents.tech_ip_agent import analyze_tech_ip
from backend.agents.market_agent import find_competitors_semantic
from backend.agents.team_agent import evaluate_team
from backend.agents.scaling_agent import evaluate_scaling
from backend.agents.funding_agent import evaluate_funding
from backend.agents.impact_agent import evaluate_impact

def run_pipeline(paper_text, authors_text, agents_to_run=None):
    """
    Run selected agents or all if agents_to_run is None.
    Returns a dict of results with a final 'unicorn_potential_score'.
    """
    if agents_to_run is None:
        agents_to_run = ['tech_ip', 'market', 'team', 'scaling', 'funding', 'impact']

    results = {}

    # Tech/IP Agent
    if 'tech_ip' in agents_to_run:
        logging.info("Running Tech/IP Agent")
        try:
            results['tech_ip'] = analyze_tech_ip(paper_text)
        except Exception as e:
            logging.error("Tech/IP agent failed: %s", e)
            results['tech_ip'] = {"error": str(e)}

    # Market Agent
    if 'market' in agents_to_run:
        logging.info("Running Market Agent")
        try:
            results['market'] = find_competitors_semantic(paper_text)
        except Exception as e:
            logging.error("Market agent failed: %s", e)
            results['market'] = {"error": str(e)}

    # Team Agent
    if 'team' in agents_to_run:
        logging.info("Running Team Agent")
        try:
            results['team'] = evaluate_team(authors_text)
        except Exception as e:
            logging.error("Team agent failed: %s", e)
            results['team'] = {"error": str(e)}

    # Scaling Agent
    if 'scaling' in agents_to_run:
        logging.info("Running Scaling Agent")
        try:
            results['scaling'] = evaluate_scaling(paper_text)
        except Exception as e:
            logging.error("Scaling agent failed: %s", e)
            results['scaling'] = {"error": str(e)}

    # Funding Agent
    if 'funding' in agents_to_run:
        logging.info("Running Funding Agent")
        try:
            results['funding'] = evaluate_funding(paper_text)
        except Exception as e:
            logging.error("Funding agent failed: %s", e)
            results['funding'] = {"error": str(e)}

    # Impact Agent
    if 'impact' in agents_to_run:
        logging.info("Running Impact Agent")
        try:
            results['impact'] = evaluate_impact(paper_text)
        except Exception as e:
            logging.error("Impact agent failed: %s", e)
            results['impact'] = {"error": str(e)}

    # Aggregate Unicorn Potential Score (simplified)
    score_keys = ['tech_ip', 'market', 'team', 'scaling', 'funding', 'impact']
    scores = []
    for k in score_keys:
        if k not in results:
            continue
        val = None
        if k == 'tech_ip':
            val = results[k].get('summary', {}).get('trl', 1)
        elif k == 'market':
            val = len(results[k].get('matches', [])) if results[k].get('matches') else 0
        else:
            val = results[k].get(f"{k}_score_0_5", 2)
        scores.append(val if isinstance(val, (int, float)) else 2)

    if scores:
        final_score = sum(scores) / len(scores) * 20
        results['unicorn_potential_score'] = round(final_score, 1)

    return results
