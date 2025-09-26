import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Bot,
  User,
  Sparkles,
  Brain,
  MessageCircle,
  Phone,
  PhoneOff,
  Settings,
  Minimize2,
  Maximize2
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useWebSocket } from '../hooks/useWebSocket'
import { elevenlabsService } from '../services/elevenlabs'
import toast from 'react-hot-toast'

const AIChat = () => {
  const { state, actions } = useApp()
  const { sendChatMessage, sendSpeechToText, sendTextToSpeech } = useWebSocket()
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [avatarSettings, setAvatarSettings] = useState({
    voiceEnabled: true,
    autoSpeak: false,
    avatarVisible: true
  })
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [state.chatHistory])

  // Beyond Presence integration
  useEffect(() => {
    const initializeBeyondPresence = () => {
      const iframe = document.getElementById('beyond-presence-iframe')
      if (iframe) {
        iframe.onload = () => {
          console.log('Beyond Presence iframe loaded')
          // Send initial context to avatar
          iframe.contentWindow?.postMessage({
            type: 'analysis_context',
            context: {
              currentAnalysis: state.analysisResults,
              conversationHistory: state.chatHistory,
              userPreferences: avatarSettings
            }
          }, 'https://bey.chat')
        }
        
        iframe.onerror = () => {
          console.log('Beyond Presence iframe failed to load, showing fallback')
          const fallback = iframe.parentElement?.querySelector('.absolute')
          if (fallback) {
            fallback.style.display = 'flex'
            iframe.style.display = 'none'
          }
        }
      }
    }

    // Initialize when component mounts
    initializeBeyondPresence()
    
    // Listen for messages from Beyond Presence
    const handleMessage = (event) => {
      if (event.origin !== 'https://bey.chat') return
      
      switch (event.data.type) {
        case 'avatar_ready':
          console.log('Beyond Presence avatar is ready')
          break
        case 'avatar_speaking':
          setIsSpeaking(true)
          break
        case 'avatar_idle':
          setIsSpeaking(false)
          break
        case 'avatar_message':
          // Handle message from avatar
          if (event.data.message) {
            actions.addChatMessage({
              id: Date.now(),
              type: 'ai',
              content: event.data.message,
              timestamp: new Date().toISOString()
            })
          }
          break
      }
    }

    window.addEventListener('message', handleMessage)
    
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [state.analysisResults, state.chatHistory, avatarSettings, actions])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    }

    actions.addChatMessage(userMessage)
    setMessage('')

    // Send to WebSocket
    const success = sendChatMessage(message.trim(), avatarSettings.autoSpeak)
    
    if (!success) {
      // Fallback to context action
      await actions.sendChatMessage(message.trim())
    }
  }

  // Text-to-Speech function
  const speakText = async (text) => {
    try {
      setIsSpeaking(true)
      const audioBuffer = await elevenlabsService.textToSpeech(text)
      
      // Convert ArrayBuffer to Blob and play
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      audio.onended = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
      }
      
      audio.onerror = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
        toast.error('Failed to play audio')
      }
      
      await audio.play()
    } catch (error) {
      console.error('TTS error:', error)
      setIsSpeaking(false)
      toast.error('Text-to-speech failed')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onload = () => {
          const base64Audio = reader.result.split(',')[1]
          sendSpeechToText(base64Audio, 'audio/webm')
        }
        reader.readAsDataURL(audioBlob)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      toast.success('Recording started...')
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Failed to start recording')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      toast.success('Recording stopped')
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const speakMessage = (text) => {
    if (!avatarSettings.voiceEnabled) return

    setIsSpeaking(true)
    sendTextToSpeech(text)
    
    // Simulate speaking duration
    setTimeout(() => {
      setIsSpeaking(false)
    }, text.length * 50) // Rough estimate
  }

  const formatMessage = (content) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-secondary-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br>')
  }

  const suggestedQuestions = [
    "What makes a startup successful?",
    "How do I evaluate market potential?",
    "What are the key metrics for startup valuation?",
    "How important is the team for startup success?",
    "What funding options are available for research startups?"
  ]

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">
            AI Startup Advisor
          </h1>
          <p className="text-xl text-secondary-600">
            Chat with our AI expert about your startup ideas and get real-time insights
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">AI Startup Advisor</h3>
                      <p className="text-primary-100 text-sm">
                        {state.wsConnected ? 'Online' : 'Connecting...'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Settings Panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-secondary-50 border-b border-secondary-200 p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={avatarSettings.voiceEnabled}
                          onChange={(e) => setAvatarSettings(prev => ({ ...prev, voiceEnabled: e.target.checked }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Voice Enabled</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={avatarSettings.autoSpeak}
                          onChange={(e) => setAvatarSettings(prev => ({ ...prev, autoSpeak: e.target.checked }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Auto Speak</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={avatarSettings.avatarVisible}
                          onChange={(e) => setAvatarSettings(prev => ({ ...prev, avatarVisible: e.target.checked }))}
                          className="mr-2"
                        />
                        <span className="text-sm">Show Avatar</span>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4">
                {state.chatHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-secondary-600 mb-2">
                      Start a conversation
                    </h3>
                    <p className="text-secondary-500 mb-6">
                      Ask me anything about startups, funding, market analysis, or business strategy
                    </p>
                    
                    <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
                      {suggestedQuestions.map((question, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setMessage(question)}
                          className="p-3 text-left bg-secondary-50 hover:bg-secondary-100 rounded-lg text-sm text-secondary-700 transition-colors"
                        >
                          {question}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : (
                  state.chatHistory.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-xs lg:max-w-md ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          msg.type === 'user' 
                            ? 'bg-primary-600 text-white ml-3' 
                            : 'bg-secondary-200 text-secondary-600 mr-3'
                        }`}>
                          {msg.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        
                        <div className={`px-4 py-2 rounded-lg ${
                          msg.type === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-secondary-100 text-secondary-800'
                        }`}>
                          <div 
                            className="text-sm"
                            dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                          />
                          <div className={`text-xs mt-1 ${
                            msg.type === 'user' ? 'text-primary-100' : 'text-secondary-500'
                          }`}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
                
                {state.isChatting && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex max-w-xs lg:max-w-md">
                      <div className="w-8 h-8 rounded-full bg-secondary-200 text-secondary-600 mr-3 flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-secondary-100 text-secondary-800 px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-1">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-2 h-2 bg-secondary-400 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 bg-secondary-400 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                            className="w-2 h-2 bg-secondary-400 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-secondary-200 p-4">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <textarea
                      ref={inputRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about your startup..."
                      className="w-full px-4 py-3 border border-secondary-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={1}
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleRecording}
                      className={`p-3 rounded-lg transition-colors ${
                        isRecording 
                          ? 'bg-danger-600 text-white' 
                          : 'bg-secondary-200 text-secondary-600 hover:bg-secondary-300'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => speakText(message)}
                      disabled={!message.trim()}
                      className="p-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mr-2"
                      title="Speak message"
                    >
                      <Volume2 className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSendMessage}
                      disabled={!message.trim() || state.isChatting}
                      className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Avatar Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Avatar Header */}
              <div className="bg-gradient-to-r from-accent-600 to-purple-600 text-white p-6">
                <h3 className="text-xl font-semibold mb-2">AI Avatar</h3>
                <p className="text-accent-100 text-sm">Interactive startup advisor</p>
              </div>

              {/* Avatar Container */}
              <div className="p-6">
                {avatarSettings.avatarVisible ? (
                  <div className="aspect-square bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center mb-6 relative overflow-hidden">
                    {/* Beyond Presence iframe */}
                    <iframe
                      id="beyond-presence-iframe"
                      src="https://bey.chat"
                      className="w-full h-full rounded-xl border-0"
                      title="Beyond Presence AI Avatar"
                      allow="microphone; camera; autoplay"
                      style={{ minHeight: '300px' }}
                    />
                    
                    {/* Fallback avatar when iframe fails */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl" style={{ display: 'none' }}>
                      <div className="text-center">
                        <motion.div
                          animate={{ 
                            scale: isSpeaking ? [1, 1.1, 1] : 1,
                            rotate: isSpeaking ? [-5, 5, -5] : 0
                          }}
                          transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
                          className="w-24 h-24 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                          <Brain className="w-12 h-12 text-white" />
                        </motion.div>
                        <p className="text-secondary-600 text-sm">
                          {isSpeaking ? 'Speaking...' : 'Ready to help'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square bg-secondary-100 rounded-xl flex items-center justify-center mb-6">
                    <p className="text-secondary-500">Avatar hidden</p>
                  </div>
                )}

                {/* Status Indicators */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                    <span className="text-sm font-medium text-secondary-700">Connection</span>
                    <div className={`w-3 h-3 rounded-full ${state.wsConnected ? 'bg-success-500' : 'bg-danger-500'}`} />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                    <span className="text-sm font-medium text-secondary-700">Voice</span>
                    <div className={`w-3 h-3 rounded-full ${avatarSettings.voiceEnabled ? 'bg-success-500' : 'bg-secondary-400'}`} />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                    <span className="text-sm font-medium text-secondary-700">Auto Speak</span>
                    <div className={`w-3 h-3 rounded-full ${avatarSettings.autoSpeak ? 'bg-success-500' : 'bg-secondary-400'}`} />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => speakMessage("Hello! I'm your AI startup advisor. How can I help you today?")}
                    className="w-full p-3 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm font-medium"
                  >
                    <Volume2 className="w-4 h-4 inline mr-2" />
                    Test Voice
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      actions.resetAll()
                      setMessage('')
                    }}
                    className="w-full p-3 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors text-sm font-medium"
                  >
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Clear Chat
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIChat
