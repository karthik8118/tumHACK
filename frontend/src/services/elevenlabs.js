// ElevenLabs service for TTS and STT
import { config } from './config.js'

export const elevenlabsService = {
  // Convert text to speech
  async textToSpeech(text, voiceId = config.elevenlabs.voiceId) {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': config.elevenlabs.apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: config.elevenlabs.model,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8
          }
        })
      })
      
      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`)
      }
      
      return await response.arrayBuffer()
    } catch (error) {
      console.error('Text-to-speech error:', error)
      throw error
    }
  },

  // Convert speech to text
  async speechToText(audioBuffer, mimeType = 'audio/webm') {
    try {
      const formData = new FormData()
      formData.append('file', audioBuffer, { filename: 'audio.webm', contentType: mimeType })
      formData.append('model_id', 'scribe_v1')
      
      const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': config.elevenlabs.apiKey,
          ...formData.getHeaders()
        },
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`ElevenLabs STT error: ${response.status}`)
      }
      
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Speech-to-text error:', error)
      throw error
    }
  },

  // Get available voices
  async getVoices() {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': config.elevenlabs.apiKey
        }
      })
      
      if (!response.ok) {
        throw new Error(`ElevenLabs voices error: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Get voices error:', error)
      throw error
    }
  }
}


