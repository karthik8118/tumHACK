// Beyond Presence service for avatar lip-sync and context management
import { config } from './config.js'

export const beyondPresenceService = {
  // Send audio stream to avatar for lip-sync via iframe communication
  async sendAudioForLipSync(audioBuffer, mimeType = 'audio/mpeg') {
    try {
      // Convert ArrayBuffer to base64 for iframe communication
      const base64Audio = Buffer.from(audioBuffer).toString('base64')
      
      // Send message to Beyond Presence iframe
      // Note: This will be called from client-side context where document is available
      if (typeof document !== 'undefined') {
        const iframe = document.getElementById('beyond-presence-iframe')
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'audio_stream',
            audio: base64Audio,
            mimeType: mimeType,
            timestamp: Date.now(),
            context: this.getCurrentContext() // Include current analysis context
          }, 'https://bey.chat')
          
          console.log('Audio sent to Beyond Presence iframe for lip-sync with context')
          return true
        } else {
          console.warn('Beyond Presence iframe not found')
          return false
        }
      } else {
        // Server-side: return the data for client-side handling
        return {
          success: true,
          audio: base64Audio,
          mimeType: mimeType,
          timestamp: Date.now(),
          context: this.getCurrentContext()
        }
      }
    } catch (error) {
      console.error('Failed to send audio to Beyond Presence:', error)
      return false
    }
  },

  // Initialize Beyond Presence iframe communication
  initializeIframeCommunication() {
    if (typeof window !== 'undefined') {
      // Listen for messages from Beyond Presence iframe
      window.addEventListener('message', (event) => {
        if (event.origin !== 'https://bey.chat') return
        
        switch (event.data.type) {
          case 'avatar_ready':
            console.log('Beyond Presence avatar is ready')
            // Send current analysis context to avatar
            this.sendContextToAvatar()
            break
          case 'avatar_speaking':
            console.log('Avatar is speaking')
            break
          case 'avatar_idle':
            console.log('Avatar is idle')
            break
          case 'context_request':
            // Avatar is requesting current context
            this.sendContextToAvatar()
            break
          default:
            console.log('Beyond Presence message:', event.data)
        }
      })
    }
  },

  // Get current analysis context for avatar
  getCurrentContext() {
    // This will be populated with current analysis data
    return {
      currentAnalysis: global.analysisData || null,
      conversationHistory: global.conversationHistory || [],
      userPreferences: global.userPreferences || {},
      timestamp: new Date().toISOString()
    }
  },

  // Send context to Beyond Presence avatar
  sendContextToAvatar() {
    if (typeof document !== 'undefined') {
      const iframe = document.getElementById('beyond-presence-iframe')
      if (iframe && iframe.contentWindow) {
        const context = this.getCurrentContext()
        iframe.contentWindow.postMessage({
          type: 'analysis_context',
          context: context
        }, 'https://bey.chat')
        console.log('Analysis context sent to Beyond Presence avatar')
      }
    }
  },

  // Update analysis context (called when new analysis is generated)
  updateAnalysisContext(analysisData) {
    global.analysisData = analysisData
    // Also send to avatar if connected
    this.sendContextToAvatar()
  }
}


