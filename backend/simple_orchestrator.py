"""
Simple Orchestrator for Research Paper Analysis
Fallback orchestrator that doesn't require CrewAI but provides similar functionality.
"""

import logging
from typing import Dict, List, Any, Optional
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configure logging first
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import Claude client for real AI analysis
try:
    from backend.utils.claude_client import claude_ask
    CLAUDE_AVAILABLE = True
except Exception as e:
    logger.warning(f"Claude client not available: {e}")
    CLAUDE_AVAILABLE = False

# Import existing agent functions with error handling
try:
    from backend.agents.tech_ip_agent import analyze_tech_ip, claude_summarize_novelty
    TECH_IP_AVAILABLE = True
except Exception as e:
    logger.warning(f"Tech IP agent not available: {e}")
    TECH_IP_AVAILABLE = False

try:
    from backend.agents.market_agent import analyze_market_business, find_competitors_semantic
    MARKET_AVAILABLE = True
except Exception as e:
    logger.warning(f"Market agent not available: {e}")
    MARKET_AVAILABLE = False

try:
    from backend.agents.team_agent import evaluate_team
    TEAM_AVAILABLE = True
except Exception as e:
    logger.warning(f"Team agent not available: {e}")
    TEAM_AVAILABLE = False

try:
    from backend.agents.scaling_agent import evaluate_scaling
    SCALING_AVAILABLE = True
except Exception as e:
    logger.warning(f"Scaling agent not available: {e}")
    SCALING_AVAILABLE = False

try:
    from backend.agents.funding_agent import evaluate_funding
    FUNDING_AVAILABLE = True
except Exception as e:
    logger.warning(f"Funding agent not available: {e}")
    FUNDING_AVAILABLE = False

try:
    from backend.agents.impact_agent import evaluate_impact
    IMPACT_AVAILABLE = True
except Exception as e:
    logger.warning(f"Impact agent not available: {e}")
    IMPACT_AVAILABLE = False

# Import comprehensive scoring system
try:
    from backend.comprehensive_scorer import calculate_comprehensive_score
    SCORER_AVAILABLE = True
except Exception as e:
    logger.warning(f"Comprehensive scorer not available: {e}")
    SCORER_AVAILABLE = False


class SimpleOrchestrator:
    """Simple orchestrator that runs agents in parallel without CrewAI"""
    
    def __init__(self):
        """Initialize the orchestrator"""
        self.agents = {}
        
        # Only add agents that are available, with Claude fallbacks
        if TECH_IP_AVAILABLE:
            self.agents['tech_ip'] = claude_summarize_novelty
        elif CLAUDE_AVAILABLE:
            self.agents['tech_ip'] = self._claude_tech_analysis
            
        if MARKET_AVAILABLE:
            self.agents['market'] = analyze_market_business
        elif CLAUDE_AVAILABLE:
            self.agents['market'] = self._claude_market_analysis
            
        if TEAM_AVAILABLE:
            self.agents['team'] = evaluate_team
        if SCALING_AVAILABLE:
            self.agents['scaling'] = evaluate_scaling
        if FUNDING_AVAILABLE:
            self.agents['funding'] = evaluate_funding
        if IMPACT_AVAILABLE:
            self.agents['impact'] = evaluate_impact
    
    def run_agent(self, agent_name: str, paper_text: str, authors_text: str = "") -> Dict[str, Any]:
        """Run a single agent"""
        try:
            if agent_name not in self.agents:
                logger.warning(f"Agent {agent_name} not available, skipping")
                return {
                    "error": f"Agent {agent_name} not available",
                    "agent": agent_name,
                    "status": "skipped"
                }
            
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
            if SCORER_AVAILABLE:
                try:
                    comprehensive_results = calculate_comprehensive_score(paper_text, authors_text, results)
                    results.update(comprehensive_results)
                    logger.info(f"Comprehensive scoring completed: {comprehensive_results['comprehensive_score']}/100")
                except Exception as e:
                    logger.error(f"Comprehensive scoring failed: {e}")
                    # Fallback to simple scoring
                    self._add_fallback_scoring(results)
            else:
                logger.warning("Comprehensive scorer not available, using fallback scoring")
                self._add_fallback_scoring(results)
            
            logger.info(f"Analysis completed with unicorn potential score: {results.get('unicorn_potential_score', 0)}")
            return results
            
        except Exception as e:
            logger.error(f"Simple orchestration failed: {e}")
            return {"error": f"Orchestration failed: {str(e)}"}
    
    def _add_fallback_scoring(self, results: Dict[str, Any]) -> None:
        """Add fallback scoring when comprehensive scorer is not available"""
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
    
    def _claude_tech_analysis(self, paper_text: str) -> Dict[str, Any]:
        """Claude-based technology analysis fallback"""
        if not CLAUDE_AVAILABLE:
            return {"error": "Claude not available"}
        
        try:
            prompt = f"""
            Analyze this research paper for technology and innovation potential:
            
            {paper_text[:3000]}...
            
            Provide a JSON response with:
            - tech_score: 0-10 (technology advancement level)
            - innovation_score: 0-10 (novelty and breakthrough potential)
            - trl: 1-9 (Technology Readiness Level)
            - analysis: brief analysis of the technology
            
            Return only valid JSON.
            """
            
            response = claude_ask(prompt)
            
            # Try to parse JSON response
            try:
                import json
                result = json.loads(response)
                return {
                    "tech_score": result.get("tech_score", 5),
                    "innovation_score": result.get("innovation_score", 5),
                    "trl": result.get("trl", 3),
                    "analysis": result.get("analysis", "Technology analysis completed"),
                    "summary": {
                        "trl": result.get("trl", 3),
                        "tech_novelty": result.get("tech_score", 5),
                        "innovation_level": result.get("innovation_score", 5)
                    }
                }
            except:
                # Fallback parsing
                return {
                    "tech_score": 5,
                    "innovation_score": 5,
                    "trl": 3,
                    "analysis": response[:200] + "..." if len(response) > 200 else response,
                    "summary": {
                        "trl": 3,
                        "tech_novelty": 5,
                        "innovation_level": 5
                    }
                }
        except Exception as e:
            logger.error(f"Claude tech analysis failed: {e}")
            return {"error": str(e)}
    
    def _claude_market_analysis(self, paper_text: str) -> Dict[str, Any]:
        """Claude-based market analysis fallback"""
        if not CLAUDE_AVAILABLE:
            return {"error": "Claude not available"}
        
        try:
            prompt = f"""
            Analyze this research paper for market potential and business viability:
            
            {paper_text[:3000]}...
            
            Provide a JSON response with:
            - market_score: 0-10 (market size and opportunity)
            - size_score: 0-10 (addressable market size)
            - market_size: "Small", "Medium", or "Large"
            - analysis: brief market analysis
            - matches: list of 2-3 potential competitors with similarity scores
            
            Return only valid JSON.
            """
            
            response = claude_ask(prompt)
            
            # Try to parse JSON response
            try:
                import json
                result = json.loads(response)
                return {
                    "market_score": result.get("market_score", 5),
                    "size_score": result.get("size_score", 5),
                    "market_size": result.get("market_size", "Medium"),
                    "analysis": result.get("analysis", "Market analysis completed"),
                    "matches": result.get("matches", [
                        {"company": "Sample Competitor 1", "similarity": 0.6, "description": "Similar technology in related market"},
                        {"company": "Sample Competitor 2", "similarity": 0.5, "description": "Adjacent market with potential overlap"}
                    ])
                }
            except:
                # Fallback parsing
                return {
                    "market_score": 5,
                    "size_score": 5,
                    "market_size": "Medium",
                    "analysis": response[:200] + "..." if len(response) > 200 else response,
                    "matches": [
                        {"company": "Sample Competitor 1", "similarity": 0.6, "description": "Similar technology in related market"},
                        {"company": "Sample Competitor 2", "similarity": 0.5, "description": "Adjacent market with potential overlap"}
                    ]
                }
        except Exception as e:
            logger.error(f"Claude market analysis failed: {e}")
            return {"error": str(e)}

# Global orchestrator instance
orchestrator = SimpleOrchestrator()

def run_simple_analysis(paper_text: str, authors_text: str = "", agents_to_run: Optional[List[str]] = None) -> Dict[str, Any]:
    """Convenience function to run simple analysis"""
    return orchestrator.run_analysis(paper_text, authors_text, agents_to_run)
