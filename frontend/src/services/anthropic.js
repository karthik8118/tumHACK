// Anthropic Claude API service
import { config } from './config.js'

export const geminiService = {
  // Generate response using Claude API
  async generateResponse(message) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.anthropic.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: message
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`)
      }

      const data = await response.json()
      return data.content[0].text
    } catch (error) {
      console.error('Error generating response:', error)
      throw error
    }
  },

  // Analyze startup data
  async analyzeStartup(startupData) {
    try {
      const prompt = `You are an expert startup analyst specializing in Max Planck research commercialization. Analyze the following startup information and provide a comprehensive evaluation:

Startup Name: ${startupData.name || 'Not provided'}
Description: ${startupData.description || 'Not provided'}
Technology: ${startupData.technology || 'Not provided'}
Market: ${startupData.market || 'Not provided'}
Team: ${startupData.team || 'Not provided'}
Funding: ${startupData.funding || 'Not provided'}
Impact: ${startupData.impact || 'Not provided'}

Please provide a detailed analysis covering:
1. Technology readiness and innovation level
2. Market potential and competitive landscape
3. Team composition and capabilities
4. Funding requirements and sources
5. Scaling potential and risks
6. Societal and environmental impact
7. Overall unicorn potential score (0-100)

Format your response as a structured JSON object with detailed insights and actionable recommendations.`

      const response = await this.generateResponse(prompt)
      
      // Try to parse as JSON, fallback to structured text
      try {
        return JSON.parse(response)
      } catch {
        return {
          analysis: response,
          unicorn_potential_score: this.extractScore(response),
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Error analyzing startup:', error)
      throw error
    }
  },

  // Extract score from text response
  extractScore(text) {
    const scoreMatch = text.match(/(\d+)\/100|score[:\s]*(\d+)/i)
    return scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2]) : 75
  },

  // Add conversation message to context
  addConversationMessage(userMessage, aiResponse, type) {
    // Store conversation context for better responses
    if (!this.conversationHistory) {
      this.conversationHistory = []
    }
    
    this.conversationHistory.push({
      type: type,
      user: userMessage,
      ai: aiResponse,
      timestamp: new Date().toISOString()
    })
    
    // Keep only last 10 messages to manage context
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10)
    }
  },

  // Update analysis context
  updateAnalysisContext(analysisData) {
    this.currentAnalysis = analysisData
  },

  // Get conversation context
  getConversationContext() {
    return this.conversationHistory || []
  },

  // Get current analysis context
  getCurrentAnalysis() {
    return this.currentAnalysis || null
  }
}


