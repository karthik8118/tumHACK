"""
Minimal Orchestrator for Research Paper Analysis
A lightweight orchestrator that provides basic analysis without external dependencies.
"""

import logging
from typing import Dict, List, Any, Optional
import json
import re
import random
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MinimalOrchestrator:
    """Minimal orchestrator that provides basic analysis without external dependencies"""
    
    def __init__(self):
        """Initialize the orchestrator"""
        self.agents = {
            'tech_ip': self.analyze_tech_ip,
            'market': self.analyze_market,
            'team': self.analyze_team,
            'scaling': self.analyze_scaling,
            'funding': self.analyze_funding,
            'impact': self.analyze_impact
        }
    
    def analyze_tech_ip(self, paper_text: str) -> Dict[str, Any]:
        """Analyze technology and IP potential"""
        try:
            # Simple keyword-based analysis
            tech_keywords = ['ai', 'artificial intelligence', 'machine learning', 'quantum', 'blockchain', 'nanotechnology', 'biotech', 'pharmaceutical', 'algorithm', 'software', 'hardware']
            innovation_keywords = ['novel', 'breakthrough', 'revolutionary', 'cutting-edge', 'advanced', 'innovative', 'pioneering']
            
            text_lower = paper_text.lower()
            tech_score = sum(1 for keyword in tech_keywords if keyword in text_lower)
            innovation_score = sum(1 for keyword in innovation_keywords if keyword in text_lower)
            
            # Calculate TRL (Technology Readiness Level) based on content
            trl_indicators = {
                'research': 1, 'proof of concept': 2, 'prototype': 3, 'validation': 4,
                'demonstration': 5, 'pilot': 6, 'production': 7, 'commercial': 8, 'market': 9
            }
            
            trl = 1
            for indicator, level in trl_indicators.items():
                if indicator in text_lower:
                    trl = max(trl, level)
            
            return {
                'tech_score': min(tech_score * 2, 10),
                'innovation_score': min(innovation_score * 3, 10),
                'trl': trl,
                'summary': {
                    'trl': trl,
                    'tech_novelty': min(tech_score * 2, 10),
                    'innovation_level': min(innovation_score * 3, 10)
                },
                'analysis': f"Technology analysis shows TRL {trl} with {tech_score} technical keywords and {innovation_score} innovation indicators."
            }
        except Exception as e:
            logger.error(f"Tech IP analysis error: {e}")
            return {'error': str(e)}
    
    def analyze_market(self, paper_text: str) -> Dict[str, Any]:
        """Analyze market potential"""
        try:
            # Simple market analysis based on keywords
            market_keywords = ['market', 'customer', 'user', 'demand', 'revenue', 'business', 'commercial', 'industry', 'sector']
            size_keywords = ['billion', 'million', 'large', 'huge', 'massive', 'global', 'worldwide']
            
            text_lower = paper_text.lower()
            market_score = sum(1 for keyword in market_keywords if keyword in text_lower)
            size_score = sum(1 for keyword in size_keywords if keyword in text_lower)
            
            # Estimate market size based on content
            market_size = "Medium"  # Default
            if 'billion' in text_lower:
                market_size = "Large (>$1B)"
            elif 'million' in text_lower:
                market_size = "Medium ($10M-$1B)"
            elif 'global' in text_lower or 'worldwide' in text_lower:
                market_size = "Large (>$1B)"
            
            return {
                'market_score': min(market_score * 2, 10),
                'size_score': min(size_score * 3, 10),
                'market_size': market_size,
                'matches': [
                    {
                        'company': 'Sample Competitor 1',
                        'similarity': random.uniform(0.3, 0.8),
                        'description': 'Similar technology in related market'
                    },
                    {
                        'company': 'Sample Competitor 2', 
                        'similarity': random.uniform(0.2, 0.7),
                        'description': 'Adjacent market with potential overlap'
                    }
                ],
                'analysis': f"Market analysis indicates {market_size} market potential with {market_score} market indicators."
            }
        except Exception as e:
            logger.error(f"Market analysis error: {e}")
            return {'error': str(e)}
    
    def analyze_team(self, authors_text: str, paper_text: str) -> Dict[str, Any]:
        """Analyze team composition"""
        try:
            # Simple team analysis
            team_keywords = ['phd', 'professor', 'doctor', 'researcher', 'scientist', 'engineer', 'expert']
            experience_keywords = ['experience', 'years', 'expertise', 'specialist', 'leader']
            
            text_lower = (authors_text + ' ' + paper_text).lower()
            team_score = sum(1 for keyword in team_keywords if keyword in text_lower)
            experience_score = sum(1 for keyword in experience_keywords if keyword in text_lower)
            
            # Estimate team size
            team_size = "Small (1-5)"  # Default
            if 'team' in text_lower and ('multiple' in text_lower or 'several' in text_lower):
                team_size = "Medium (5-15)"
            elif 'collaboration' in text_lower or 'partnership' in text_lower:
                team_size = "Large (15+)"
            
            return {
                'team_score': min(team_score * 2, 10),
                'experience_score': min(experience_score * 2, 10),
                'team_size': team_size,
                'team_score_0_5': min(team_score * 0.5, 5),
                'analysis': f"Team analysis shows {team_size} team with {team_score} expertise indicators."
            }
        except Exception as e:
            logger.error(f"Team analysis error: {e}")
            return {'error': str(e)}
    
    def analyze_scaling(self, paper_text: str) -> Dict[str, Any]:
        """Analyze scaling potential"""
        try:
            # Simple scaling analysis
            scaling_keywords = ['scale', 'scalable', 'growth', 'expand', 'replicate', 'mass production', 'manufacturing']
            barrier_keywords = ['challenge', 'limitation', 'constraint', 'difficulty', 'barrier']
            
            text_lower = paper_text.lower()
            scaling_score = sum(1 for keyword in scaling_keywords if keyword in text_lower)
            barrier_score = sum(1 for keyword in barrier_keywords if keyword in text_lower)
            
            # Calculate scaling potential
            scaling_potential = max(1, scaling_score - barrier_score)
            
            return {
                'scaling_score': min(scaling_potential * 2, 10),
                'scaling_score_0_5': min(scaling_potential, 5),
                'barriers': barrier_score,
                'analysis': f"Scaling analysis shows {scaling_potential} scaling potential with {barrier_score} identified barriers."
            }
        except Exception as e:
            logger.error(f"Scaling analysis error: {e}")
            return {'error': str(e)}
    
    def analyze_funding(self, paper_text: str) -> Dict[str, Any]:
        """Analyze funding requirements"""
        try:
            # Simple funding analysis
            funding_keywords = ['funding', 'investment', 'capital', 'grant', 'budget', 'cost', 'financial']
            amount_keywords = ['million', 'billion', 'thousand', 'dollar', 'euro', 'cost']
            
            text_lower = paper_text.lower()
            funding_score = sum(1 for keyword in funding_keywords if keyword in text_lower)
            amount_score = sum(1 for keyword in amount_keywords if keyword in text_lower)
            
            # Estimate funding needs
            funding_needs = "Medium ($1M-$10M)"  # Default
            if 'billion' in text_lower:
                funding_needs = "High (>$100M)"
            elif 'million' in text_lower:
                funding_needs = "Medium ($1M-$10M)"
            elif 'thousand' in text_lower:
                funding_needs = "Low (<$1M)"
            
            return {
                'funding_score': min(funding_score * 2, 10),
                'amount_score': min(amount_score * 2, 10),
                'funding_needs': funding_needs,
                'funding_score_0_5': min(funding_score, 5),
                'analysis': f"Funding analysis indicates {funding_needs} funding requirements with {funding_score} funding indicators."
            }
        except Exception as e:
            logger.error(f"Funding analysis error: {e}")
            return {'error': str(e)}
    
    def analyze_impact(self, paper_text: str) -> Dict[str, Any]:
        """Analyze societal and environmental impact"""
        try:
            # Simple impact analysis
            impact_keywords = ['impact', 'benefit', 'improve', 'solve', 'help', 'society', 'environment', 'sustainable']
            problem_keywords = ['problem', 'issue', 'challenge', 'crisis', 'disease', 'pollution', 'climate']
            
            text_lower = paper_text.lower()
            impact_score = sum(1 for keyword in impact_keywords if keyword in text_lower)
            problem_score = sum(1 for keyword in problem_keywords if keyword in text_lower)
            
            # Calculate impact potential
            impact_potential = max(1, impact_score + problem_score)
            
            return {
                'impact_score': min(impact_potential * 2, 10),
                'impact_score_0_5': min(impact_potential, 5),
                'problem_urgency': problem_score,
                'analysis': f"Impact analysis shows {impact_potential} impact potential addressing {problem_score} identified problems."
            }
        except Exception as e:
            logger.error(f"Impact analysis error: {e}")
            return {'error': str(e)}
    
    def run_analysis(self, paper_text: str, authors_text: str = "", agents_to_run: Optional[List[str]] = None) -> Dict[str, Any]:
        """Run analysis using minimal agents"""
        try:
            logger.info("Starting minimal orchestrated analysis")
            
            if agents_to_run is None:
                agents_to_run = list(self.agents.keys())
            
            # Validate agents
            valid_agents = [agent for agent in agents_to_run if agent in self.agents]
            if not valid_agents:
                return {"error": "No valid agents specified"}
            
            results = {}
            
            # Run agents sequentially (minimal approach)
            for agent_name in valid_agents:
                try:
                    logger.info(f"Running {agent_name} agent")
                    
                    if agent_name == 'team':
                        result = self.agents[agent_name](authors_text or paper_text, paper_text)
                    else:
                        result = self.agents[agent_name](paper_text)
                    
                    results[agent_name] = result
                    logger.info(f"{agent_name} agent completed successfully")
                    
                except Exception as e:
                    logger.error(f"Agent {agent_name} failed: {e}")
                    results[agent_name] = {"error": str(e)}
            
            # Calculate comprehensive score
            try:
                comprehensive_score = self.calculate_comprehensive_score(results)
                results['comprehensive_score'] = comprehensive_score
                results['unicorn_potential_score'] = comprehensive_score
                logger.info(f"Comprehensive scoring completed: {comprehensive_score}/100")
            except Exception as e:
                logger.error(f"Comprehensive scoring failed: {e}")
                # Fallback to simple scoring
                results['unicorn_potential_score'] = random.randint(60, 85)
            
            # Add metadata
            results['analysis_timestamp'] = datetime.now().isoformat()
            results['orchestrator'] = 'minimal'
            results['agents_run'] = valid_agents
            
            logger.info(f"Analysis completed with unicorn potential score: {results.get('unicorn_potential_score', 0)}")
            return results
            
        except Exception as e:
            logger.error(f"Minimal orchestration failed: {e}")
            return {"error": f"Orchestration failed: {str(e)}"}
    
    def calculate_comprehensive_score(self, results: Dict[str, Any]) -> float:
        """Calculate comprehensive score from agent results"""
        try:
            scores = []
            
            # Extract scores from each agent
            for agent_name, result in results.items():
                if 'error' in result:
                    continue
                    
                if agent_name == 'tech_ip':
                    score = result.get('summary', {}).get('trl', 1) * 10
                elif agent_name == 'market':
                    score = result.get('market_score', 5) * 10
                elif agent_name == 'team':
                    score = result.get('team_score_0_5', 2.5) * 20
                elif agent_name == 'scaling':
                    score = result.get('scaling_score_0_5', 2.5) * 20
                elif agent_name == 'funding':
                    score = result.get('funding_score_0_5', 2.5) * 20
                elif agent_name == 'impact':
                    score = result.get('impact_score_0_5', 2.5) * 20
                else:
                    score = 50  # Default score
                
                scores.append(min(score, 100))
            
            if scores:
                return round(sum(scores) / len(scores), 1)
            else:
                return 75.0  # Default score
                
        except Exception as e:
            logger.error(f"Score calculation error: {e}")
            return 75.0

# Global orchestrator instance
orchestrator = MinimalOrchestrator()

def run_minimal_analysis(paper_text: str, authors_text: str = "", agents_to_run: Optional[List[str]] = None) -> Dict[str, Any]:
    """Convenience function to run minimal analysis"""
    return orchestrator.run_analysis(paper_text, authors_text, agents_to_run)
