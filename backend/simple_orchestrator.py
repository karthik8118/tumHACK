"""
Simple Orchestrator for Research Paper Analysis
Fallback orchestrator that doesn't require CrewAI but provides similar functionality.
"""

import logging
from typing import Dict, List, Any, Optional
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor, as_completed

# Import existing agent functions
from backend.agents.tech_ip_agent import analyze_tech_ip, claude_summarize_novelty
from backend.agents.market_agent import analyze_market_business, find_competitors_semantic
from backend.agents.team_agent import evaluate_team
from backend.agents.scaling_agent import evaluate_scaling
from backend.agents.funding_agent import evaluate_funding
from backend.agents.impact_agent import evaluate_impact

# Import comprehensive scoring system
from backend.comprehensive_scorer import calculate_comprehensive_score

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleOrchestrator:
    """Simple orchestrator that runs agents in parallel without CrewAI"""
    
    def __init__(self):
        """Initialize the orchestrator"""
        self.agents = {
            'tech_ip': claude_summarize_novelty,
            'market': analyze_market_business,
            'team': evaluate_team,
            'scaling': evaluate_scaling,
            'funding': evaluate_funding,
            'impact': evaluate_impact
        }
    
    def run_agent(self, agent_name: str, paper_text: str, authors_text: str = "") -> Dict[str, Any]:
        """Run a single agent"""
        try:
            logger.info(f"Running {agent_name} agent")
            
            if agent_name == 'team':
                result = self.agents[agent_name](authors_text or paper_text, paper_text)
            else:
                result = self.agents[agent_name](paper_text)
            
            logger.info(f"{agent_name} agent completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"{agent_name} agent failed: {e}")
            return {"error": str(e)}
    
    def run_analysis(self, paper_text: str, authors_text: str = "", agents_to_run: Optional[List[str]] = None) -> Dict[str, Any]:
        """Run analysis using parallel execution"""
        try:
            logger.info("Starting simple orchestrated analysis")
            
            if agents_to_run is None:
                agents_to_run = list(self.agents.keys())
            
            # Validate agents
            valid_agents = [agent for agent in agents_to_run if agent in self.agents]
            if not valid_agents:
                return {"error": "No valid agents specified"}
            
            results = {}
            
            # Run agents in parallel using ThreadPoolExecutor
            with ThreadPoolExecutor(max_workers=min(len(valid_agents), 6)) as executor:
                # Submit all tasks
                future_to_agent = {}
                for agent_name in valid_agents:
                    future = executor.submit(self.run_agent, agent_name, paper_text, authors_text)
                    future_to_agent[future] = agent_name
                
                # Collect results as they complete
                for future in as_completed(future_to_agent):
                    agent_name = future_to_agent[future]
                    try:
                        result = future.result()
                        results[agent_name] = result
                    except Exception as e:
                        logger.error(f"Agent {agent_name} failed with exception: {e}")
                        results[agent_name] = {"error": str(e)}
            
            # Calculate comprehensive 100-point score using the new scoring system
            try:
                comprehensive_results = calculate_comprehensive_score(paper_text, authors_text, results)
                results.update(comprehensive_results)
                logger.info(f"Comprehensive scoring completed: {comprehensive_results['comprehensive_score']}/100")
            except Exception as e:
                logger.error(f"Comprehensive scoring failed: {e}")
                # Fallback to simple scoring
                score_keys = ['tech_ip', 'market', 'team', 'scaling', 'funding', 'impact']
                scores = []
                
                for k in score_keys:
                    if k not in results or results[k].get("error"):
                        continue
                        
                    val = None
                    if k == 'tech_ip':
                        val = results[k].get('summary', {}).get('trl', 1)
                    elif k == 'market':
                        val = len(results[k].get('matches', [])) if results[k].get('matches') else 0
                    else:
                        val = results[k].get(f"{k}_score_0_5", 2)
                    
                    if isinstance(val, (int, float)):
                        scores.append(val)
                    else:
                        scores.append(2)  # Default score
                
                if scores:
                    final_score = sum(scores) / len(scores) * 20
                    results['unicorn_potential_score'] = round(final_score, 1)
                else:
                    results['unicorn_potential_score'] = 0
            
            logger.info(f"Analysis completed with unicorn potential score: {results.get('unicorn_potential_score', 0)}")
            return results
            
        except Exception as e:
            logger.error(f"Simple orchestration failed: {e}")
            return {"error": f"Orchestration failed: {str(e)}"}

# Global orchestrator instance
orchestrator = SimpleOrchestrator()

def run_simple_analysis(paper_text: str, authors_text: str = "", agents_to_run: Optional[List[str]] = None) -> Dict[str, Any]:
    """Convenience function to run simple analysis"""
    return orchestrator.run_analysis(paper_text, authors_text, agents_to_run)
