# backend/agents/run_agent.py
import argparse
import json
import logging
from backend.utils.logger import setup_file_logging, save_run_log

# import agent functions (adjust names if you renamed files)
from backend.agents.tech_ip_agent import analyze_tech_ip
from backend.agents.market_agent import find_competitors_semantic
from backend.agents.team_agent import evaluate_team
from backend.agents.scaling_agent import evaluate_scaling
from backend.agents.funding_agent import evaluate_funding
from backend.agents.impact_agent import evaluate_impact

AGENTS = {
    "tech_ip": analyze_tech_ip,
    "market": find_competitors_semantic,
    "team": evaluate_team,
    "scaling": evaluate_scaling,
    "funding": evaluate_funding,
    "impact": evaluate_impact,
}

def run_agent(agent_name: str, text: str, authors: str = ""):
    fn = AGENTS.get(agent_name)
    if fn is None:
        raise ValueError(f"Unknown agent: {agent_name}. Valid: {list(AGENTS.keys())}")
    # For team agent we pass authors if provided
    if agent_name == "team":
        out = fn(authors or text)
    else:
        out = fn(text)
    save_run_log({"agent": agent_name, "input_preview": text[:1000], "result": out}, prefix=f"agent_{agent_name}")
    return out

if __name__ == "__main__":
    setup_file_logging()
    logging.basicConfig(level=logging.INFO)
    p = argparse.ArgumentParser()
    p.add_argument("agent", help="Agent name (tech_ip | market | team | scaling | funding | impact)")
    p.add_argument("--text", help="Text to analyze (or path to txt file)", default="")
    p.add_argument("--authors", help="Authors text (for team agent)", default="")
    args = p.parse_args()

    text_in = args.text
    # if path to file:
    try:
        with open(text_in, "r", encoding="utf-8") as f:
            text_in = f.read()
    except Exception:
        # treat text_in as raw text if file open fails
        pass

    res = run_agent(args.agent, text_in, args.authors)
    print(json.dumps(res, indent=2, default=str))
