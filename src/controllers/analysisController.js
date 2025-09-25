// Analysis controller for handling startup evaluations
import { geminiService } from '../services/anthropic.js';
import { helpers } from '../utils/helpers.js';

export const analysisController = {
  // Analyze startup potential
  async analyzeStartup(req, res) {
    try {
      const {
        name,
        problem,
        solution,
        customers,
        team,
        researchGap,
        futurePotential,
        competitors,
        teamStrength,
        techNovelty,
        marketDemand,
        marketPotential,
        revenue
      } = req.body;

      // Validate required fields
      if (!name || !problem || !solution) {
        return res.status(400).json({
          error: 'Missing required fields: name, problem, solution'
        });
      }

      // Calculate composite score
      const scores = {
        researchGap: parseInt(researchGap) || 5,
        futurePotential: parseInt(futurePotential) || 5,
        competitors: parseInt(competitors) || 5,
        teamStrength: parseInt(teamStrength) || 5,
        techNovelty: parseInt(techNovelty) || 5,
        marketDemand: parseInt(marketDemand) || 5,
        marketPotential: parseInt(marketPotential) || 5,
        revenue: parseInt(revenue) || 5
      };

      const compositeScore = helpers.calculateCompositeScore(scores);

      // Get AI analysis
      const aiAnalysis = await geminiService.analyzeStartup({
        name,
        problem,
        solution,
        customers,
        team,
        ...scores
      });

      res.json({
        success: true,
        data: {
          compositeScore,
          scores,
          aiAnalysis,
          timestamp: helpers.formatTimestamp()
        }
      });

    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({
        error: 'Failed to analyze startup',
        message: error.message
      });
    }
  },

  // Get analysis history (placeholder for future implementation)
  async getAnalysisHistory(req, res) {
    try {
      // In a real application, this would fetch from a database
      res.json({
        success: true,
        data: {
          analyses: [],
          message: 'Analysis history feature coming soon'
        }
      });
    } catch (error) {
      console.error('History error:', error);
      res.status(500).json({
        error: 'Failed to fetch analysis history'
      });
    }
  }
};

