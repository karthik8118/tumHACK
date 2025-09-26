// Backend API service for communicating with the FastAPI backend
import { config } from './config.js'

export const backendService = {
  // Base URL for API calls
  baseUrl: config.backend.baseUrl,
  
  // Analyze text using the backend API
  async analyzeText(text, authors = '', agentsToRun = null) {
    try {
      const response = await fetch(`${this.baseUrl}/analyze-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          authors: authors,
          agents_to_run: agentsToRun
        })
      })

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error analyzing text:', error)
      throw error
    }
  },

  // Analyze PDF using the backend API
  async analyzePDF(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${this.baseUrl}/analyze-paper`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error analyzing PDF:', error)
      throw error
    }
  },

  // Check backend health
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error checking backend health:', error)
      throw error
    }
  },

  // Get backend status
  async getStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/`)
      
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting backend status:', error)
      throw error
    }
  }
}
