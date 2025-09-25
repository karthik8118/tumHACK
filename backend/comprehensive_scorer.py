"""
Comprehensive Scoring System for Research Paper Unicorn Potential Analysis
Implements the detailed 100-point scoring system with European market focus.
"""

import logging
from typing import Dict, List, Any, Optional, Tuple
import json
import requests
from datetime import datetime
import pandas as pd

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ComprehensiveScorer:
    """Comprehensive scorer implementing the 100-point European-focused system"""
    
    def __init__(self):
        """Initialize the scorer with weights and criteria"""
        # Scoring weights (total = 100)
        self.weights = {
            'technology_ip': 25,      # A. Technology & IP (SPRIND core)
            'market_business': 25,    # B. Market & Business (SPRIND exploitation)
            'team_founding': 15,      # C. Team & Founding Potential
            'scaling_gtm': 15,        # D. Scaling & Go-to-Market
            'funding_exit': 10,       # E. Funding & Exit Environment
            'impact_alignment': 10    # F. Impact & European strategic alignment
        }
        
        # Sub-criteria weights within each category
        self.sub_weights = {
            'technology_ip': {
                'novelty_breakthrough': 0.6,  # 15 points
                'trl_feasibility': 0.2,       # 5 points  
                'ip_patentability': 0.2       # 5 points
            },
            'market_business': {
                'customer_value_prop': 0.3,   # 7.5 points
                'tam_eu_fragmentation': 0.4,  # 10 points
                'competitive_landscape': 0.3  # 7.5 points
            },
            'team_founding': {
                'translational_track_record': 0.6,  # 9 points
                'complementary_skills_eu': 0.4      # 6 points
            },
            'scaling_gtm': {
                'manufacturing_scale': 0.4,   # 6 points
                'regulatory_pathway_eu': 0.6  # 9 points
            },
            'funding_exit': {
                'fundraising_fit_eu': 0.5,    # 5 points
                'exit_prospects_eu': 0.5      # 5 points
            },
            'impact_alignment': {
                'sustainability_green_deal': 0.5,  # 5 points
                'ethics_gdpr_acceptance': 0.5      # 5 points
            }
        }
    
    def score_technology_ip(self, paper_text: str, agent_results: Dict) -> Dict[str, Any]:
        """Score Technology & IP criteria (25 points total)"""
        logger.info("Scoring Technology & IP criteria")
        
        # Extract relevant information from agent results
        tech_result = agent_results.get('tech_ip', {})
        
        # 1. Novelty / Scientific Breakthrough (15 points)
        novelty_score = self._score_novelty_breakthrough(paper_text, tech_result)
        
        # 2. TRL / Engineering Feasibility (5 points)
        trl_score = self._score_trl_feasibility(paper_text, tech_result)
        
        # 3. IP & Patentability (5 points)
        ip_score = self._score_ip_patentability(paper_text, tech_result)
        
        # Calculate weighted score (scale 0-5 to 0-1, then multiply by weight)
        total_score = (
            (novelty_score / 5) * self.sub_weights['technology_ip']['novelty_breakthrough'] +
            (trl_score / 5) * self.sub_weights['technology_ip']['trl_feasibility'] +
            (ip_score / 5) * self.sub_weights['technology_ip']['ip_patentability']
        ) * self.weights['technology_ip']
        
        return {
            'category': 'Technology & IP',
            'total_score': round(total_score, 1),
            'max_score': self.weights['technology_ip'],
            'sub_scores': {
                'novelty_breakthrough': {
                    'score': novelty_score,
                    'max_score': 5,
                    'weight': self.sub_weights['technology_ip']['novelty_breakthrough'],
                    'evidence': self._extract_novelty_evidence(paper_text, tech_result)
                },
                'trl_feasibility': {
                    'score': trl_score,
                    'max_score': 5,
                    'weight': self.sub_weights['technology_ip']['trl_feasibility'],
                    'evidence': self._extract_trl_evidence(paper_text, tech_result)
                },
                'ip_patentability': {
                    'score': ip_score,
                    'max_score': 5,
                    'weight': self.sub_weights['technology_ip']['ip_patentability'],
                    'evidence': self._extract_ip_evidence(paper_text, tech_result)
                }
            }
        }
    
    def score_market_business(self, paper_text: str, agent_results: Dict) -> Dict[str, Any]:
        """Score Market & Business criteria (25 points total)"""
        logger.info("Scoring Market & Business criteria")
        
        market_result = agent_results.get('market', {})
        
        # 1. Customer & Value Proposition clarity (7.5 points)
        customer_score = self._score_customer_value_prop(paper_text, market_result)
        
        # 2. TAM + European Market Fragmentation (10 points)
        tam_score = self._score_tam_eu_fragmentation(paper_text, market_result)
        
        # 3. Competitive Landscape / Differentiation (7.5 points)
        competitive_score = self._score_competitive_landscape(paper_text, market_result)
        
        # Calculate weighted score (scale 0-5 to 0-1, then multiply by weight)
        total_score = (
            (customer_score / 5) * self.sub_weights['market_business']['customer_value_prop'] +
            (tam_score / 5) * self.sub_weights['market_business']['tam_eu_fragmentation'] +
            (competitive_score / 5) * self.sub_weights['market_business']['competitive_landscape']
        ) * self.weights['market_business']
        
        return {
            'category': 'Market & Business',
            'total_score': round(total_score, 1),
            'max_score': self.weights['market_business'],
            'sub_scores': {
                'customer_value_prop': {
                    'score': customer_score,
                    'max_score': 5,
                    'weight': self.sub_weights['market_business']['customer_value_prop'],
                    'evidence': self._extract_customer_evidence(paper_text, market_result)
                },
                'tam_eu_fragmentation': {
                    'score': tam_score,
                    'max_score': 5,
                    'weight': self.sub_weights['market_business']['tam_eu_fragmentation'],
                    'evidence': self._extract_tam_evidence(paper_text, market_result)
                },
                'competitive_landscape': {
                    'score': competitive_score,
                    'max_score': 5,
                    'weight': self.sub_weights['market_business']['competitive_landscape'],
                    'evidence': self._extract_competitive_evidence(paper_text, market_result)
                }
            }
        }
    
    def score_team_founding(self, paper_text: str, authors_text: str, agent_results: Dict) -> Dict[str, Any]:
        """Score Team & Founding Potential criteria (15 points total)"""
        logger.info("Scoring Team & Founding Potential criteria")
        
        team_result = agent_results.get('team', {})
        
        # 1. Research team's translational track record (9 points)
        track_record_score = self._score_translational_track_record(authors_text, team_result)
        
        # 2. Complementary skills & hiring feasibility in EU (6 points)
        skills_score = self._score_complementary_skills_eu(authors_text, team_result)
        
        # Calculate weighted score (scale 0-5 to 0-1, then multiply by weight)
        total_score = (
            (track_record_score / 5) * self.sub_weights['team_founding']['translational_track_record'] +
            (skills_score / 5) * self.sub_weights['team_founding']['complementary_skills_eu']
        ) * self.weights['team_founding']
        
        return {
            'category': 'Team & Founding Potential',
            'total_score': round(total_score, 1),
            'max_score': self.weights['team_founding'],
            'sub_scores': {
                'translational_track_record': {
                    'score': track_record_score,
                    'max_score': 5,
                    'weight': self.sub_weights['team_founding']['translational_track_record'],
                    'evidence': self._extract_track_record_evidence(authors_text, team_result)
                },
                'complementary_skills_eu': {
                    'score': skills_score,
                    'max_score': 5,
                    'weight': self.sub_weights['team_founding']['complementary_skills_eu'],
                    'evidence': self._extract_skills_evidence(authors_text, team_result)
                }
            }
        }
    
    def score_scaling_gtm(self, paper_text: str, agent_results: Dict) -> Dict[str, Any]:
        """Score Scaling & Go-to-Market criteria (15 points total)"""
        logger.info("Scoring Scaling & Go-to-Market criteria")
        
        scaling_result = agent_results.get('scaling', {})
        
        # 1. Manufacturing / Scale feasibility (6 points)
        manufacturing_score = self._score_manufacturing_scale(paper_text, scaling_result)
        
        # 2. Regulatory pathway (EU) (9 points)
        regulatory_score = self._score_regulatory_pathway_eu(paper_text, scaling_result)
        
        # Calculate weighted score (scale 0-5 to 0-1, then multiply by weight)
        total_score = (
            (manufacturing_score / 5) * self.sub_weights['scaling_gtm']['manufacturing_scale'] +
            (regulatory_score / 5) * self.sub_weights['scaling_gtm']['regulatory_pathway_eu']
        ) * self.weights['scaling_gtm']
        
        return {
            'category': 'Scaling & Go-to-Market',
            'total_score': round(total_score, 1),
            'max_score': self.weights['scaling_gtm'],
            'sub_scores': {
                'manufacturing_scale': {
                    'score': manufacturing_score,
                    'max_score': 5,
                    'weight': self.sub_weights['scaling_gtm']['manufacturing_scale'],
                    'evidence': self._extract_manufacturing_evidence(paper_text, scaling_result)
                },
                'regulatory_pathway_eu': {
                    'score': regulatory_score,
                    'max_score': 5,
                    'weight': self.sub_weights['scaling_gtm']['regulatory_pathway_eu'],
                    'evidence': self._extract_regulatory_evidence(paper_text, scaling_result)
                }
            }
        }
    
    def score_funding_exit(self, paper_text: str, agent_results: Dict) -> Dict[str, Any]:
        """Score Funding & Exit Environment criteria (10 points total)"""
        logger.info("Scoring Funding & Exit Environment criteria")
        
        funding_result = agent_results.get('funding', {})
        
        # 1. Fundraising fit (public + private) in EU (5 points)
        fundraising_score = self._score_fundraising_fit_eu(paper_text, funding_result)
        
        # 2. Exit prospects / investor appetite in Europe (5 points)
        exit_score = self._score_exit_prospects_eu(paper_text, funding_result)
        
        # Calculate weighted score (scale 0-5 to 0-1, then multiply by weight)
        total_score = (
            (fundraising_score / 5) * self.sub_weights['funding_exit']['fundraising_fit_eu'] +
            (exit_score / 5) * self.sub_weights['funding_exit']['exit_prospects_eu']
        ) * self.weights['funding_exit']
        
        return {
            'category': 'Funding & Exit Environment',
            'total_score': round(total_score, 1),
            'max_score': self.weights['funding_exit'],
            'sub_scores': {
                'fundraising_fit_eu': {
                    'score': fundraising_score,
                    'max_score': 5,
                    'weight': self.sub_weights['funding_exit']['fundraising_fit_eu'],
                    'evidence': self._extract_fundraising_evidence(paper_text, funding_result)
                },
                'exit_prospects_eu': {
                    'score': exit_score,
                    'max_score': 5,
                    'weight': self.sub_weights['funding_exit']['exit_prospects_eu'],
                    'evidence': self._extract_exit_evidence(paper_text, funding_result)
                }
            }
        }
    
    def score_impact_alignment(self, paper_text: str, agent_results: Dict) -> Dict[str, Any]:
        """Score Impact & European strategic alignment criteria (10 points total)"""
        logger.info("Scoring Impact & European strategic alignment criteria")
        
        impact_result = agent_results.get('impact', {})
        
        # 1. Societal / sustainability impact (Green Deal alignment) (5 points)
        sustainability_score = self._score_sustainability_green_deal(paper_text, impact_result)
        
        # 2. Ethics, Data Protection & Social Acceptance (GDPR risk) (5 points)
        ethics_score = self._score_ethics_gdpr_acceptance(paper_text, impact_result)
        
        # Calculate weighted score (scale 0-5 to 0-1, then multiply by weight)
        total_score = (
            (sustainability_score / 5) * self.sub_weights['impact_alignment']['sustainability_green_deal'] +
            (ethics_score / 5) * self.sub_weights['impact_alignment']['ethics_gdpr_acceptance']
        ) * self.weights['impact_alignment']
        
        return {
            'category': 'Impact & European Strategic Alignment',
            'total_score': round(total_score, 1),
            'max_score': self.weights['impact_alignment'],
            'sub_scores': {
                'sustainability_green_deal': {
                    'score': sustainability_score,
                    'max_score': 5,
                    'weight': self.sub_weights['impact_alignment']['sustainability_green_deal'],
                    'evidence': self._extract_sustainability_evidence(paper_text, impact_result)
                },
                'ethics_gdpr_acceptance': {
                    'score': ethics_score,
                    'max_score': 5,
                    'weight': self.sub_weights['impact_alignment']['ethics_gdpr_acceptance'],
                    'evidence': self._extract_ethics_evidence(paper_text, impact_result)
                }
            }
        }
    
    def calculate_comprehensive_score(self, paper_text: str, authors_text: str, agent_results: Dict) -> Dict[str, Any]:
        """Calculate the comprehensive 100-point score"""
        logger.info("Calculating comprehensive 100-point score")
        
        # Score each category
        scores = {
            'technology_ip': self.score_technology_ip(paper_text, agent_results),
            'market_business': self.score_market_business(paper_text, agent_results),
            'team_founding': self.score_team_founding(paper_text, authors_text, agent_results),
            'scaling_gtm': self.score_scaling_gtm(paper_text, agent_results),
            'funding_exit': self.score_funding_exit(paper_text, agent_results),
            'impact_alignment': self.score_impact_alignment(paper_text, agent_results)
        }
        
        # Calculate total score
        total_score = sum(score['total_score'] for score in scores.values())
        
        # Determine grade and recommendation
        grade, recommendation = self._determine_grade_and_recommendation(total_score)
        
        return {
            'comprehensive_score': round(total_score, 1),
            'max_score': 100,
            'grade': grade,
            'recommendation': recommendation,
            'category_scores': scores,
            'timestamp': datetime.now().isoformat(),
            'methodology': 'European-focused 100-point SPRIND-inspired scoring system'
        }
    
    def _determine_grade_and_recommendation(self, score: float) -> Tuple[str, str]:
        """Determine grade and recommendation based on score"""
        if score >= 85:
            return "A+", "High unicorn potential - Strong recommendation for immediate commercialization"
        elif score >= 75:
            return "A", "High unicorn potential - Recommended for commercialization with strong support"
        elif score >= 65:
            return "B+", "Good unicorn potential - Recommended with targeted improvements"
        elif score >= 55:
            return "B", "Moderate unicorn potential - Requires significant development"
        elif score >= 45:
            return "C+", "Limited unicorn potential - Major challenges to address"
        elif score >= 35:
            return "C", "Low unicorn potential - Substantial barriers exist"
        else:
            return "D", "Very low unicorn potential - Not recommended for commercialization"
    
    # Scoring helper methods (implementations would be detailed based on specific criteria)
    def _score_novelty_breakthrough(self, paper_text: str, tech_result: Dict) -> float:
        """Score novelty and scientific breakthrough (0-5)"""
        # Implementation would analyze paper for novel claims, citation gaps, etc.
        return tech_result.get('summary', {}).get('novelty_score', 2.5)
    
    def _score_trl_feasibility(self, paper_text: str, tech_result: Dict) -> float:
        """Score TRL and engineering feasibility (0-5)"""
        trl = tech_result.get('summary', {}).get('trl', 3)
        return min(5, max(0, trl / 2))  # Convert TRL 1-9 to 0-5 scale
    
    def _score_ip_patentability(self, paper_text: str, tech_result: Dict) -> float:
        """Score IP and patentability (0-5)"""
        # Implementation would check patent landscape, prior art, etc.
        return 2.5  # Placeholder
    
    def _score_customer_value_prop(self, paper_text: str, market_result: Dict) -> float:
        """Score customer and value proposition clarity (0-5)"""
        market_analysis = market_result.get('market_analysis', {})
        return float(market_analysis.get('customer_clarity_score', 2.5))
    
    def _score_tam_eu_fragmentation(self, paper_text: str, market_result: Dict) -> float:
        """Score TAM and EU market fragmentation (0-5)"""
        market_analysis = market_result.get('market_analysis', {})
        return float(market_analysis.get('tam_eu_score', 2.5))
    
    def _score_competitive_landscape(self, paper_text: str, market_result: Dict) -> float:
        """Score competitive landscape (0-5)"""
        market_analysis = market_result.get('market_analysis', {})
        return float(market_analysis.get('competition_score', 2.5))
    
    def _score_translational_track_record(self, authors_text: str, team_result: Dict) -> float:
        """Score translational track record (0-5)"""
        return float(team_result.get('translational_score', 2.5))
    
    def _score_complementary_skills_eu(self, authors_text: str, team_result: Dict) -> float:
        """Score complementary skills in EU (0-5)"""
        return float(team_result.get('eu_skills_score', 2.5))
    
    def _score_manufacturing_scale(self, paper_text: str, scaling_result: Dict) -> float:
        """Score manufacturing and scale feasibility (0-5)"""
        return float(scaling_result.get('manufacturing_score', 2.5))
    
    def _score_regulatory_pathway_eu(self, paper_text: str, scaling_result: Dict) -> float:
        """Score regulatory pathway in EU (0-5)"""
        return float(scaling_result.get('regulatory_score', 2.5))
    
    def _score_fundraising_fit_eu(self, paper_text: str, funding_result: Dict) -> float:
        """Score fundraising fit in EU (0-5)"""
        return float(funding_result.get('funding_fit_score', 2.5))
    
    def _score_exit_prospects_eu(self, paper_text: str, funding_result: Dict) -> float:
        """Score exit prospects in EU (0-5)"""
        return float(funding_result.get('exit_prospects_score', 2.5))
    
    def _score_sustainability_green_deal(self, paper_text: str, impact_result: Dict) -> float:
        """Score sustainability and Green Deal alignment (0-5)"""
        return float(impact_result.get('sustainability_score', 2.5))
    
    def _score_ethics_gdpr_acceptance(self, paper_text: str, impact_result: Dict) -> float:
        """Score ethics and GDPR acceptance (0-5)"""
        return float(impact_result.get('ethics_gdpr_score', 2.5))
    
    def _extract_novelty_evidence(self, paper_text: str, tech_result: Dict) -> List[str]:
        """Extract evidence for novelty assessment"""
        return tech_result.get('summary', {}).get('novelty_bullets', [])
    
    def _extract_trl_evidence(self, paper_text: str, tech_result: Dict) -> List[str]:
        """Extract evidence for TRL assessment"""
        return [f"TRL Level: {tech_result.get('summary', {}).get('trl', 'Unknown')}"]
    
    def _extract_ip_evidence(self, paper_text: str, tech_result: Dict) -> List[str]:
        """Extract evidence for IP assessment"""
        return ["Patent analysis pending"]  # Placeholder
    
    def _extract_customer_evidence(self, paper_text: str, market_result: Dict) -> List[str]:
        """Extract evidence for customer assessment"""
        return ["Customer analysis pending"]  # Placeholder
    
    def _extract_tam_evidence(self, paper_text: str, market_result: Dict) -> List[str]:
        """Extract evidence for TAM assessment"""
        return ["Market size analysis pending"]  # Placeholder
    
    def _extract_competitive_evidence(self, paper_text: str, market_result: Dict) -> List[str]:
        """Extract evidence for competitive assessment"""
        matches = market_result.get('matches', [])
        return [f"Found {len(matches)} competitors"] if matches else ["No competitors found"]
    
    def _extract_track_record_evidence(self, authors_text: str, team_result: Dict) -> List[str]:
        """Extract evidence for track record assessment"""
        return ["Track record analysis pending"]  # Placeholder
    
    def _extract_skills_evidence(self, authors_text: str, team_result: Dict) -> List[str]:
        """Extract evidence for skills assessment"""
        return ["Skills analysis pending"]  # Placeholder
    
    def _extract_manufacturing_evidence(self, paper_text: str, scaling_result: Dict) -> List[str]:
        """Extract evidence for manufacturing assessment"""
        return ["Manufacturing analysis pending"]  # Placeholder
    
    def _extract_regulatory_evidence(self, paper_text: str, scaling_result: Dict) -> List[str]:
        """Extract evidence for regulatory assessment"""
        return ["Regulatory analysis pending"]  # Placeholder
    
    def _extract_fundraising_evidence(self, paper_text: str, funding_result: Dict) -> List[str]:
        """Extract evidence for fundraising assessment"""
        return ["Fundraising analysis pending"]  # Placeholder
    
    def _extract_exit_evidence(self, paper_text: str, funding_result: Dict) -> List[str]:
        """Extract evidence for exit assessment"""
        return ["Exit analysis pending"]  # Placeholder
    
    def _extract_sustainability_evidence(self, paper_text: str, impact_result: Dict) -> List[str]:
        """Extract evidence for sustainability assessment"""
        return ["Sustainability analysis pending"]  # Placeholder
    
    def _extract_ethics_evidence(self, paper_text: str, impact_result: Dict) -> List[str]:
        """Extract evidence for ethics assessment"""
        return ["Ethics analysis pending"]  # Placeholder

# Global scorer instance
comprehensive_scorer = ComprehensiveScorer()

def calculate_comprehensive_score(paper_text: str, authors_text: str, agent_results: Dict) -> Dict[str, Any]:
    """Convenience function to calculate comprehensive score"""
    return comprehensive_scorer.calculate_comprehensive_score(paper_text, authors_text, agent_results)
