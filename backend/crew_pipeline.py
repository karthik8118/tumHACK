from backend.agents.tech_ip_agent import analyze_tech_ip
from backend.agents.market_agent import find_competitors_semantic
from backend.agents.team_agent import evaluate_team
from backend.agents.scaling_agent import evaluate_scaling
from backend.agents.funding_agent import evaluate_funding
from backend.agents.impact_agent import evaluate_impact
import logging

def run_pipeline(paper_text, authors_text):
    logging.info("Starting pipeline")

    results = {}

    logging.info("Running Tech/IP Agent")
    results['tech_ip'] = analyze_tech_ip(paper_text)
    logging.info(f"Tech/IP result: {results['tech_ip']}")

    logging.info("Running Market Agent")
    results['market'] = find_competitors_semantic(paper_text)
    logging.info(f"Market result: {results['market']}")

    logging.info("Running Team Agent")
    results['team'] = evaluate_team(authors_text)
    logging.info(f"Team result: {results['team']}")

    logging.info("Running Scaling Agent")
    results['scaling'] = evaluate_scaling(paper_text)
    logging.info(f"Scaling result: {results['scaling']}")

    logging.info("Running Funding Agent")
    results['funding'] = evaluate_funding(paper_text)
    logging.info(f"Funding result: {results['funding']}")

    logging.info("Running Impact Agent")
    results['impact'] = evaluate_impact(paper_text)
    logging.info(f"Impact result: {results['impact']}")

    # Aggregate Unicorn Potential Score
    scores = [
        results['tech_ip']['summary'].get('trl', 1),
        len(results['market'].get('matches', [])),
        results['team'].get('team_score_0_5', 2),
        results['scaling'].get('scaling_score_0_5', 2),
        results['funding'].get('funding_score_0_5', 2),
        results['impact'].get('impact_score_0_5', 2)
    ]
    final_score = sum([s if isinstance(s, (int,float)) else 2 for s in scores]) / len(scores) * 20
    results['unicorn_potential_score'] = round(final_score, 1)
    
    logging.info(f"Final Unicorn Potential Score: {results['unicorn_potential_score']}")
    return results
