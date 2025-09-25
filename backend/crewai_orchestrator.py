"""
CrewAI Orchestrator for Research Paper Analysis
This module provides proper agent orchestration using CrewAI framework.
"""

import logging
from typing import Dict, List, Any, Optional, Union
import json
import logging

# Import CrewAI components with error handling
try:
    from crewai import Agent, Task, Crew, Process
    from crewai.tools import BaseTool
    from pydantic import BaseModel, Field
    CREWAI_AVAILABLE = True
except ImportError as e:
    print(f"CrewAI import failed: {e}")
    CREWAI_AVAILABLE = False
    # Create dummy classes for fallback
    class BaseTool:
        def __init__(self, **kwargs):
            pass
    class BaseModel:
        def __init__(self, **kwargs):
            pass
    class Field:
        def __init__(self, **kwargs):
            pass

# Import existing agent functions
from backend.agents.tech_ip_agent import analyze_tech_ip
from backend.agents.market_agent import find_competitors_semantic
from backend.agents.team_agent import evaluate_team
from backend.agents.scaling_agent import evaluate_scaling
from backend.agents.funding_agent import evaluate_funding
from backend.agents.impact_agent import evaluate_impact

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ResearchAnalysisInput(BaseModel):
    """Input model for research analysis"""
    paper_text: str = Field(..., description="The research paper text to analyze")
    authors_text: str = Field(default="", description="Authors information")
    agents_to_run: Union[List[str], None] = Field(default=None, description="Specific agents to run")

class TechIPTool(BaseTool):
    """Tool for Technology/IP analysis"""
    name: str = "tech_ip_analyzer"
    description: str = "Analyzes technology and intellectual property aspects of research papers"
    
    def _run(self, paper_text: str) -> str:
        """Run tech IP analysis"""
        try:
            result = analyze_tech_ip(paper_text)
            return json.dumps(result, indent=2)
        except Exception as e:
            logger.error(f"Tech IP analysis failed: {e}")
            return json.dumps({"error": str(e)})

class MarketAnalysisTool(BaseTool):
    """Tool for Market analysis"""
    name: str = "market_analyzer"
    description: str = "Analyzes market potential and finds competitors"
    
    def _run(self, paper_text: str) -> str:
        """Run market analysis"""
        try:
            result = find_competitors_semantic(paper_text)
            return json.dumps(result, indent=2)
        except Exception as e:
            logger.error(f"Market analysis failed: {e}")
            return json.dumps({"error": str(e)})

class TeamAnalysisTool(BaseTool):
    """Tool for Team analysis"""
    name: str = "team_analyzer"
    description: str = "Evaluates team composition and capabilities"
    
    def _run(self, authors_text: str) -> str:
        """Run team analysis"""
        try:
            result = evaluate_team(authors_text)
            return json.dumps(result, indent=2)
        except Exception as e:
            logger.error(f"Team analysis failed: {e}")
            return json.dumps({"error": str(e)})

class ScalingAnalysisTool(BaseTool):
    """Tool for Scaling analysis"""
    name: str = "scaling_analyzer"
    description: str = "Evaluates scaling potential and risks"
    
    def _run(self, paper_text: str) -> str:
        """Run scaling analysis"""
        try:
            result = evaluate_scaling(paper_text)
            return json.dumps(result, indent=2)
        except Exception as e:
            logger.error(f"Scaling analysis failed: {e}")
            return json.dumps({"error": str(e)})

class FundingAnalysisTool(BaseTool):
    """Tool for Funding analysis"""
    name: str = "funding_analyzer"
    description: str = "Evaluates funding opportunities and recommendations"
    
    def _run(self, paper_text: str) -> str:
        """Run funding analysis"""
        try:
            result = evaluate_funding(paper_text)
            return json.dumps(result, indent=2)
        except Exception as e:
            logger.error(f"Funding analysis failed: {e}")
            return json.dumps({"error": str(e)})

class ImpactAnalysisTool(BaseTool):
    """Tool for Impact analysis"""
    name: str = "impact_analyzer"
    description: str = "Evaluates societal and environmental impact"
    
    def _run(self, paper_text: str) -> str:
        """Run impact analysis"""
        try:
            result = evaluate_impact(paper_text)
            return json.dumps(result, indent=2)
        except Exception as e:
            logger.error(f"Impact analysis failed: {e}")
            return json.dumps({"error": str(e)})

class UnicornPotentialEvaluator(BaseTool):
    """Tool for calculating final unicorn potential score"""
    name: str = "unicorn_evaluator"
    description: str = "Calculates final unicorn potential score from all analysis results"
    
    def _run(self, analysis_results: str) -> str:
        """Calculate unicorn potential score"""
        try:
            results = json.loads(analysis_results)
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
            
            return json.dumps(results, indent=2)
        except Exception as e:
            logger.error(f"Unicorn evaluation failed: {e}")
            return json.dumps({"error": str(e), "unicorn_potential_score": 0})

class ResearchAnalysisOrchestrator:
    """Main orchestrator class for research analysis using CrewAI"""
    
    def __init__(self):
        """Initialize the orchestrator with agents and tools"""
        self.tools = [
            TechIPTool(),
            MarketAnalysisTool(),
            TeamAnalysisTool(),
            ScalingAnalysisTool(),
            FundingAnalysisTool(),
            ImpactAnalysisTool(),
            UnicornPotentialEvaluator()
        ]
        
        # Create specialized agents
        self.tech_ip_agent = Agent(
            role="Technology and IP Analyst",
            goal="Analyze the technological innovation and intellectual property potential of research papers",
            backstory="You are an expert in technology assessment and IP evaluation with deep knowledge of patent landscapes and technical readiness levels.",
            tools=[TechIPTool()],
            verbose=True,
            allow_delegation=False
        )
        
        self.market_agent = Agent(
            role="Market Research Analyst",
            goal="Identify market opportunities, competitors, and commercial potential",
            backstory="You are a seasoned market analyst with expertise in identifying market gaps, competitive landscapes, and commercial viability.",
            tools=[MarketAnalysisTool()],
            verbose=True,
            allow_delegation=False
        )
        
        self.team_agent = Agent(
            role="Team and Talent Evaluator",
            goal="Assess team composition, expertise, and entrepreneurial capabilities",
            backstory="You are an expert in team dynamics and talent assessment, specializing in evaluating research teams for startup potential.",
            tools=[TeamAnalysisTool()],
            verbose=True,
            allow_delegation=False
        )
        
        self.scaling_agent = Agent(
            role="Scaling and Growth Strategist",
            goal="Evaluate scaling potential, growth strategies, and operational risks",
            backstory="You are a growth strategist with experience in scaling startups and identifying operational challenges.",
            tools=[ScalingAnalysisTool()],
            verbose=True,
            allow_delegation=False
        )
        
        self.funding_agent = Agent(
            role="Funding and Investment Advisor",
            goal="Identify funding opportunities and investment readiness",
            backstory="You are an investment advisor with deep knowledge of funding landscapes, grant opportunities, and investor requirements.",
            tools=[FundingAnalysisTool()],
            verbose=True,
            allow_delegation=False
        )
        
        self.impact_agent = Agent(
            role="Impact and Sustainability Assessor",
            goal="Evaluate societal, environmental, and economic impact potential",
            backstory="You are an impact assessment expert with knowledge of SDGs, sustainability metrics, and societal benefit evaluation.",
            tools=[ImpactAnalysisTool()],
            verbose=True,
            allow_delegation=False
        )
        
        self.evaluator_agent = Agent(
            role="Unicorn Potential Evaluator",
            goal="Synthesize all analyses and calculate final unicorn potential score",
            backstory="You are a senior VC analyst who synthesizes multiple analyses to determine startup potential and unicorn likelihood.",
            tools=[UnicornPotentialEvaluator()],
            verbose=True,
            allow_delegation=False
        )
    
    def create_analysis_tasks(self, paper_text: str, authors_text: str = "", agents_to_run: Union[List[str], None] = None) -> List[Task]:
        """Create analysis tasks based on requested agents"""
        if agents_to_run is None:
            agents_to_run = ['tech_ip', 'market', 'team', 'scaling', 'funding', 'impact']
        
        tasks = []
        
        if 'tech_ip' in agents_to_run:
            tasks.append(Task(
                description=f"Analyze the technology and intellectual property aspects of this research paper: {paper_text[:1000]}...",
                expected_output="JSON with technology analysis including TRL, novelty assessment, and patent landscape",
                agent=self.tech_ip_agent,
                tools=[TechIPTool()]
            ))
        
        if 'market' in agents_to_run:
            tasks.append(Task(
                description=f"Analyze the market potential and find competitors for this research: {paper_text[:1000]}...",
                expected_output="JSON with market analysis including competitors, market size, and commercial potential",
                agent=self.market_agent,
                tools=[MarketAnalysisTool()]
            ))
        
        if 'team' in agents_to_run:
            tasks.append(Task(
                description=f"Evaluate the team composition and entrepreneurial capabilities: {authors_text or paper_text[:1000]}...",
                expected_output="JSON with team assessment including missing roles and entrepreneurial readiness",
                agent=self.team_agent,
                tools=[TeamAnalysisTool()]
            ))
        
        if 'scaling' in agents_to_run:
            tasks.append(Task(
                description=f"Evaluate the scaling potential and growth strategies: {paper_text[:1000]}...",
                expected_output="JSON with scaling analysis including growth potential and operational risks",
                agent=self.scaling_agent,
                tools=[ScalingAnalysisTool()]
            ))
        
        if 'funding' in agents_to_run:
            tasks.append(Task(
                description=f"Identify funding opportunities and investment readiness: {paper_text[:1000]}...",
                expected_output="JSON with funding analysis including recommended funding sources and investment readiness",
                agent=self.funding_agent,
                tools=[FundingAnalysisTool()]
            ))
        
        if 'impact' in agents_to_run:
            tasks.append(Task(
                description=f"Evaluate the societal and environmental impact: {paper_text[:1000]}...",
                expected_output="JSON with impact assessment including SDG alignment and sustainability metrics",
                agent=self.impact_agent,
                tools=[ImpactAnalysisTool()]
            ))
        
        return tasks
    
    def run_analysis(self, paper_text: str, authors_text: str = "", agents_to_run: Union[List[str], None] = None) -> Dict[str, Any]:
        """Run the complete analysis using CrewAI orchestration"""
        try:
            logger.info("Starting CrewAI orchestrated analysis")
            
            # Create tasks
            tasks = self.create_analysis_tasks(paper_text, authors_text, agents_to_run)
            
            if not tasks:
                return {"error": "No valid agents specified"}
            
            # Create crew
            crew = Crew(
                agents=[self.tech_ip_agent, self.market_agent, self.team_agent, 
                       self.scaling_agent, self.funding_agent, self.impact_agent, self.evaluator_agent],
                tasks=tasks,
                process=Process.sequential,
                verbose=True
            )
            
            # Execute the crew
            logger.info("Executing CrewAI analysis")
            result = crew.kickoff()
            
            # Parse and structure results
            results = {}
            for task in tasks:
                agent_name = task.agent.role.lower().replace(' ', '_').replace('and', '').replace('__', '_')
                if 'technology' in agent_name:
                    results['tech_ip'] = json.loads(task.output) if isinstance(task.output, str) else task.output
                elif 'market' in agent_name:
                    results['market'] = json.loads(task.output) if isinstance(task.output, str) else task.output
                elif 'team' in agent_name:
                    results['team'] = json.loads(task.output) if isinstance(task.output, str) else task.output
                elif 'scaling' in agent_name:
                    results['scaling'] = json.loads(task.output) if isinstance(task.output, str) else task.output
                elif 'funding' in agent_name:
                    results['funding'] = json.loads(task.output) if isinstance(task.output, str) else task.output
                elif 'impact' in agent_name:
                    results['impact'] = json.loads(task.output) if isinstance(task.output, str) else task.output
            
            # Calculate final score
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
            
            logger.info(f"Analysis completed with unicorn potential score: {results.get('unicorn_potential_score', 0)}")
            return results
            
        except Exception as e:
            logger.error(f"CrewAI orchestration failed: {e}")
            return {"error": f"Orchestration failed: {str(e)}"}

# Global orchestrator instance
orchestrator = ResearchAnalysisOrchestrator()

def run_crewai_analysis(paper_text: str, authors_text: str = "", agents_to_run: Union[List[str], None] = None) -> Dict[str, Any]:
    """Convenience function to run CrewAI analysis"""
    return orchestrator.run_analysis(paper_text, authors_text, agents_to_run)
