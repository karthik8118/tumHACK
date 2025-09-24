from backend.agents.tech_ip_agent import analyze_tech_ip
from backend.agents.market_agent import find_competitors_semantic
from backend.agents.team_agent import evaluate_team
from backend.agents.scaling_agent import evaluate_scaling
from backend.agents.funding_agent import evaluate_funding
from backend.agents.impact_agent import evaluate_impact

def run_pipeline(paper_text, authors_text):
    results = {}

    # Tech/IP
    results['tech_ip'] = analyze_tech_ip(paper_text)

    # Market
    results['market'] = find_competitors_semantic(paper_text)

    # Team
    results['team'] = evaluate_team(authors_text)

    # Scaling
    results['scaling'] = evaluate_scaling(paper_text)

    # Funding
    results['funding'] = evaluate_funding(paper_text)

    # Impact
    results['impact'] = evaluate_impact(paper_text)

    # Aggregate unicorn potential score
    scores = [
        results['tech_ip']['summary'].get('trl', 1),
        results['market'].get('matches', []),
        results['team'].get('team_score_0_5', 2),
        results['scaling'].get('scaling_score_0_5', 2),
        results['funding'].get('funding_score_0_5', 2),
        results['impact'].get('impact_score_0_5', 2)
    ]
    # simple weighted aggregation
    final_score = sum([s if isinstance(s, (int,float)) else 2 for s in scores]) / len(scores) * 20
    results['unicorn_potential_score'] = round(final_score, 1)

    return results
