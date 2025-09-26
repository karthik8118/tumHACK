import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

export function useWebSocket(url = 'ws://localhost:8000/ws') {
  const { actions } = useApp()
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 3
  const isConnectingRef = useRef(false)

  const connect = useCallback(() => {
    // Prevent multiple connection attempts
    if (isConnectingRef.current || (socket && socket.readyState === WebSocket.CONNECTING)) {
      return
    }
    
    // Close existing connection if any
    if (socket && socket.readyState !== WebSocket.CLOSED) {
      socket.close()
    }
    
    isConnectingRef.current = true
    
    try {
      const ws = new WebSocket(url)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setError(null)
        actions.setWsConnected(true)
        actions.setWsError(null)
        reconnectAttempts.current = 0
        isConnectingRef.current = false
        
        // Send initial connection message
        ws.send(JSON.stringify({
          type: 'connection',
          message: 'Client connected'
        }))
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleMessage(data)
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }
      
      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        actions.setWsConnected(false)
        isConnectingRef.current = false
        
        // Only attempt to reconnect if not a clean close and not manually disconnected
        if (event.code !== 1000 && event.code !== 1001 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(2000 * Math.pow(2, reconnectAttempts.current), 10000)
          console.log(`Attempting to reconnect in ${delay}ms...`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setError('Failed to reconnect after multiple attempts')
          actions.setWsError('Connection lost')
          toast.error('Connection lost. Please refresh the page.')
        }
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setError('WebSocket connection error')
        actions.setWsError('Connection error')
        isConnectingRef.current = false
      }
      
      setSocket(ws)
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err)
      setError('Failed to connect to server')
      actions.setWsError('Connection failed')
      isConnectingRef.current = false
    }
  }, [url, actions])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (socket) {
      socket.close(1000, 'Client disconnecting')
      setSocket(null)
    }
    
    setIsConnected(false)
    actions.setWsConnected(false)
  }, [socket, actions])

  const sendMessage = useCallback((message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify(message))
        return true
      } catch (error) {
        console.error('Error sending WebSocket message:', error)
        toast.error('Failed to send message')
        return false
      }
    } else {
      console.warn('WebSocket not connected, cannot send message. State:', socket?.readyState)
      // Don't show toast for every failed message, just log it
      return false
    }
  }, [socket])

  const handleMessage = useCallback((data) => {
    switch (data.type) {
      case 'connection_response':
        // Handle connection acknowledgment
        console.log('Connection acknowledged by server')
        break
        
      case 'chat_response':
        actions.addChatMessage({
          id: Date.now(),
          type: 'ai',
          content: data.message,
          timestamp: data.timestamp
        })
        actions.setChatting(false)
        break
        
      case 'startup_analysis_response':
        actions.setAnalysisResults(data.analysis)
        actions.setAnalyzing(false)
        actions.updateAnalysisProgress(100)
        toast.success('Analysis completed!')
        break
        
      case 'analysis_progress':
        actions.updateAnalysisProgress(data.progress)
        break
        
      case 'real_time_update':
        actions.updateRealTimeAnalysis(data.analysis)
        break
        
      case 'error':
        console.error('Server error:', data.message)
        toast.error(data.message)
        break
        
      case 'speech_to_text_response':
        // Handle speech-to-text response
        console.log('Speech transcription:', data.text)
        break
        
      case 'text_to_speech_response':
        // Handle text-to-speech response
        if (data.audio) {
          playAudio(data.audio)
        }
        break
        
      default:
        console.log('Unknown message type:', data.type, data)
    }
  }, [actions])

  const playAudio = useCallback((base64Audio) => {
    try {
      const audioData = atob(base64Audio)
      const audioArray = new Uint8Array(audioData.length)
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i)
      }
      
      const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      audio.play().catch(err => {
        console.error('Failed to play audio:', err)
      })
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
      }
    } catch (err) {
      console.error('Failed to process audio:', err)
    }
  }, [])

  // Chat functions
  const sendChatMessage = useCallback((message, generateSpeech = false) => {
    return sendMessage({
      type: 'chat',
      message,
      generateSpeech
    })
  }, [sendMessage])

  const sendStartupAnalysis = useCallback((startupData) => {
    return sendMessage({
      type: 'startup_analysis',
      ...startupData
    })
  }, [sendMessage])

  const sendPatentSearch = useCallback((query, limit = 10) => {
    return sendMessage({
      type: 'patent_search',
      query,
      limit
    })
  }, [sendMessage])

  const sendResearchGapAnalysis = useCallback((description) => {
    return sendMessage({
      type: 'research_gap_analysis',
      description
    })
  }, [sendMessage])

  const sendDeepAnalysis = useCallback((text) => {
    return sendMessage({
      type: 'deep_analysis',
      text
    })
  }, [sendMessage])

  const sendSpeechToText = useCallback((audio, mimeType = 'audio/webm') => {
    return sendMessage({
      type: 'speech_to_text',
      audio,
      mimeType
    })
  }, [sendMessage])

  const sendTextToSpeech = useCallback((text) => {
    return sendMessage({
      type: 'text_to_speech',
      text
    })
  }, [sendMessage])

  // Connect on mount - only once
  useEffect(() => {
    // Only connect if not already connected or connecting
    if (!isConnected && !isConnectingRef.current) {
      connect()
    }
    
    return () => {
      disconnect()
    }
  }, []) // Empty dependency array to run only once

  return {
    isConnected,
    error,
    sendMessage,
    sendChatMessage,
    sendStartupAnalysis,
    sendPatentSearch,
    sendResearchGapAnalysis,
    sendDeepAnalysis,
    sendSpeechToText,
    sendTextToSpeech,
    connect,
    disconnect
  }
}
