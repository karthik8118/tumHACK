// Google Gemini service
import fetch from 'node-fetch';
import { config } from '../config.js';

export const geminiService = {
  // Generate chat response with context awareness
  async generateResponse(message) {
    try {
      // Get current analysis context for more informed responses
      const context = this.getAnalysisContext();
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.gemini.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert startup analyst and advisor specializing in Max Planck research commercialization. 
              You help evaluate breakthrough potential, identify market opportunities, and provide strategic guidance for 
              science-to-market transitions. Be conversational, insightful, and focus on practical advice for researchers 
              and entrepreneurs.
              
              ${context ? `
              CURRENT ANALYSIS CONTEXT:
              ${JSON.stringify(context, null, 2)}
              
              Use this context to provide more relevant and personalized advice.
              ` : ''}
              
              User message: ${message}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  },

  // Analyze startup for breakthrough potential
  async analyzeStartup(data) {
    try {
      // Build additional features section
      let additionalFeaturesText = '';
      if (data.additionalFeatures && data.additionalFeatures.length > 0) {
        additionalFeaturesText = '\n\nAdditional Custom Features to Evaluate:\n';
        data.additionalFeatures.forEach(feature => {
          additionalFeaturesText += `- ${feature.name}: ${feature.description}\n`;
        });
      }

      const analysisPrompt = `You are an expert startup analyst for Max Planck research commercialization. Analyze this startup for breakthrough potential:

STARTUP INFORMATION:
- Name: ${data.startupName || data.name || 'N/A'}
- Description: ${data.description || 'N/A'}
- Problem: ${data.problem || 'N/A'}
- Solution: ${data.solution || 'N/A'}
- Target Market: ${data.targetMarket || data.customers || 'N/A'}
- Business Model: ${data.businessModel || 'N/A'}
- Competitive Advantage: ${data.competitiveAdvantage || 'N/A'}
- Team: ${data.team || 'N/A'}
- Funding: ${data.funding || 'N/A'}${additionalFeaturesText}

EVALUATION CRITERIA (Rate 1-10 for each):
1. Research Gap Analysis - How well does this address an unmet research need?
2. Future Potential/Scope - Long-term scalability and impact potential
3. Competitors Intensity - Level of competition in the market
4. Team Strength - Technical knowledge, marketing skills, execution capability
5. Tech Novelty - Innovation level and technological advancement
6. Market Demand - Current and projected market need
7. Market Potential - Size and growth potential of target market
8. Revenue Generation - Viability and scalability of revenue model${data.additionalFeatures ? '\n9. Custom Features - Evaluate each additional feature provided' : ''}

REQUIRED OUTPUT FORMAT:
Provide a JSON response with this exact structure:
{
  "scores": {
    "researchGap": [1-10],
    "futurePotential": [1-10],
    "competitorsIntensity": [1-10],
    "teamStrength": [1-10],
    "techNovelty": [1-10],
    "marketDemand": [1-10],
    "marketPotential": [1-10],
    "revenueGeneration": [1-10]${data.additionalFeatures ? ',\n    "customFeatures": [1-10]' : ''}
  },
  "compositeScore": [1-10],
  "detailedAnalysis": {
    "researchGap": "Detailed explanation...",
    "futurePotential": "Detailed explanation...",
    "competitorsIntensity": "Detailed explanation...",
    "teamStrength": "Detailed explanation...",
    "techNovelty": "Detailed explanation...",
    "marketDemand": "Detailed explanation...",
    "marketPotential": "Detailed explanation...",
    "revenueGeneration": "Detailed explanation..."${data.additionalFeatures ? ',\n    "customFeatures": "Detailed explanation..."' : ''}
  },
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "breakthroughPotential": "Overall assessment of breakthrough potential",
  "nextSteps": ["Step 1", "Step 2", "Step 3"]
}

Focus on Max Planck research context and scientific breakthrough potential.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.gemini.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert startup analyst specializing in evaluating breakthrough potential from scientific research. 
              Provide detailed, actionable insights with specific recommendations.
              
              ${analysisPrompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2000,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const result = await response.json();
      const analysisText = result.candidates[0].content.parts[0].text;
      
      // Try to parse JSON from the response
      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Could not parse JSON from Gemini response, returning text');
      }
      
      return analysisText;
    } catch (error) {
      console.error('Startup analysis error:', error);
      throw error;
    }
  },

  // Get current analysis context
  getAnalysisContext() {
    return {
      currentAnalysis: global.analysisData || null,
      conversationHistory: global.conversationHistory || [],
      userPreferences: global.userPreferences || {},
      lastAnalysisTime: global.lastAnalysisTime || null
    };
  },

  // Update analysis context
  updateAnalysisContext(analysisData) {
    global.analysisData = analysisData;
    global.lastAnalysisTime = new Date().toISOString();
    
    // Add to conversation history
    if (!global.conversationHistory) {
      global.conversationHistory = [];
    }
    
    global.conversationHistory.push({
      type: 'analysis',
      data: analysisData,
      timestamp: new Date().toISOString()
    });

    // Keep only last 10 entries to prevent memory issues
    if (global.conversationHistory.length > 10) {
      global.conversationHistory = global.conversationHistory.slice(-10);
    }
  },

  // Add conversation message to context
  addConversationMessage(message, response, type = 'chat') {
    if (!global.conversationHistory) {
      global.conversationHistory = [];
    }
    
    global.conversationHistory.push({
      type: type,
      message: message,
      response: response,
      timestamp: new Date().toISOString()
    });

    // Keep only last 20 conversation entries
    if (global.conversationHistory.length > 20) {
      global.conversationHistory = global.conversationHistory.slice(-20);
    }
  }
};

