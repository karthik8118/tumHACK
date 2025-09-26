import React, { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'

// Initial state
const initialState = {
  // User data
  user: null,
  
  // Startup data
  startupData: {
    name: '',
    description: '',
    authors: '',
    technology: '',
    market: '',
    team: '',
    funding: '',
    impact: '',
    pdfFile: null,
  },
  
  // Analysis results
  analysisResults: null,
  isAnalyzing: false,
  analysisProgress: 0,
  
  // Chat data
  chatHistory: [],
  isChatting: false,
  
  // UI state
  currentStep: 1,
  totalSteps: 4,
  sidebarOpen: false,
  theme: 'light',
  
  // WebSocket connection
  wsConnected: false,
  wsError: null,
  
  // Real-time updates
  realTimeUpdates: {
    techAnalysis: null,
    marketAnalysis: null,
    teamAnalysis: null,
    scalingAnalysis: null,
    fundingAnalysis: null,
    impactAnalysis: null,
  }
}

// Action types
const ActionTypes = {
  SET_USER: 'SET_USER',
  UPDATE_STARTUP_DATA: 'UPDATE_STARTUP_DATA',
  SET_ANALYSIS_RESULTS: 'SET_ANALYSIS_RESULTS',
  SET_ANALYZING: 'SET_ANALYZING',
  UPDATE_ANALYSIS_PROGRESS: 'UPDATE_ANALYSIS_PROGRESS',
  ADD_CHAT_MESSAGE: 'ADD_CHAT_MESSAGE',
  SET_CHATTING: 'SET_CHATTING',
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
  SET_THEME: 'SET_THEME',
  SET_WS_CONNECTED: 'SET_WS_CONNECTED',
  SET_WS_ERROR: 'SET_WS_ERROR',
  UPDATE_REAL_TIME_ANALYSIS: 'UPDATE_REAL_TIME_ANALYSIS',
  RESET_ANALYSIS: 'RESET_ANALYSIS',
  RESET_ALL: 'RESET_ALL',
}

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return { ...state, user: action.payload }
    
    case ActionTypes.UPDATE_STARTUP_DATA:
      return {
        ...state,
        startupData: { ...state.startupData, ...action.payload }
      }
    
    case ActionTypes.SET_ANALYSIS_RESULTS:
      return { ...state, analysisResults: action.payload }
    
    case ActionTypes.SET_ANALYZING:
      return { ...state, isAnalyzing: action.payload }
    
    case ActionTypes.UPDATE_ANALYSIS_PROGRESS:
      return { ...state, analysisProgress: action.payload }
    
    case ActionTypes.ADD_CHAT_MESSAGE:
      return {
        ...state,
        chatHistory: [...state.chatHistory, action.payload]
      }
    
    case ActionTypes.SET_CHATTING:
      return { ...state, isChatting: action.payload }
    
    case ActionTypes.SET_CURRENT_STEP:
      return { ...state, currentStep: action.payload }
    
    case ActionTypes.SET_SIDEBAR_OPEN:
      return { ...state, sidebarOpen: action.payload }
    
    case ActionTypes.SET_THEME:
      return { ...state, theme: action.payload }
    
    case ActionTypes.SET_WS_CONNECTED:
      return { ...state, wsConnected: action.payload }
    
    case ActionTypes.SET_WS_ERROR:
      return { ...state, wsError: action.payload }
    
    case ActionTypes.UPDATE_REAL_TIME_ANALYSIS:
      return {
        ...state,
        realTimeUpdates: {
          ...state.realTimeUpdates,
          ...action.payload
        }
      }
    
    case ActionTypes.RESET_ANALYSIS:
      return {
        ...state,
        analysisResults: null,
        isAnalyzing: false,
        analysisProgress: 0,
        realTimeUpdates: {
          techAnalysis: null,
          marketAnalysis: null,
          teamAnalysis: null,
          scalingAnalysis: null,
          fundingAnalysis: null,
          impactAnalysis: null,
        }
      }
    
    case ActionTypes.RESET_ALL:
      return initialState
    
    default:
      return state
  }
}

// Context
const AppContext = createContext()

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Actions
  const actions = {
    setUser: (user) => dispatch({ type: ActionTypes.SET_USER, payload: user }),
    
    updateStartupData: (data) => {
      dispatch({ type: ActionTypes.UPDATE_STARTUP_DATA, payload: data })
    },
    
    setAnalysisResults: (results) => {
      dispatch({ type: ActionTypes.SET_ANALYSIS_RESULTS, payload: results })
    },
    
    setAnalyzing: (isAnalyzing) => {
      dispatch({ type: ActionTypes.SET_ANALYZING, payload: isAnalyzing })
    },
    
    updateAnalysisProgress: (progress) => {
      dispatch({ type: ActionTypes.UPDATE_ANALYSIS_PROGRESS, payload: progress })
    },
    
    addChatMessage: (message) => {
      dispatch({ type: ActionTypes.ADD_CHAT_MESSAGE, payload: message })
    },
    
    setChatting: (isChatting) => {
      dispatch({ type: ActionTypes.SET_CHATTING, payload: isChatting })
    },
    
    setCurrentStep: (step) => {
      dispatch({ type: ActionTypes.SET_CURRENT_STEP, payload: step })
    },
    
    setSidebarOpen: (open) => {
      dispatch({ type: ActionTypes.SET_SIDEBAR_OPEN, payload: open })
    },
    
    setTheme: (theme) => {
      dispatch({ type: ActionTypes.SET_THEME, payload: theme })
      localStorage.setItem('theme', theme)
    },
    
    setWsConnected: (connected) => {
      dispatch({ type: ActionTypes.SET_WS_CONNECTED, payload: connected })
    },
    
    setWsError: (error) => {
      dispatch({ type: ActionTypes.SET_WS_ERROR, payload: error })
    },
    
    updateRealTimeAnalysis: (analysis) => {
      dispatch({ type: ActionTypes.UPDATE_REAL_TIME_ANALYSIS, payload: analysis })
    },
    
    resetAnalysis: () => {
      dispatch({ type: ActionTypes.RESET_ANALYSIS })
    },
    
    resetAll: () => {
      dispatch({ type: ActionTypes.RESET_ALL })
    },
    
    // Complex actions
    startAnalysis: async (startupData) => {
      try {
        actions.setAnalyzing(true)
        actions.updateAnalysisProgress(0)
        actions.resetAnalysis()
        
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          const currentProgress = state.analysisProgress
          if (currentProgress < 90) {
            actions.updateAnalysisProgress(currentProgress + Math.random() * 10)
          }
        }, 1000)
        
        // Make API call
        const response = await fetch('/api/analyze-paper', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: startupData.description,
            authors: startupData.authors,
            agents_to_run: ['tech_ip', 'market', 'team', 'scaling', 'funding', 'impact']
          })
        })
        
        if (!response.ok) {
          throw new Error('Analysis failed')
        }
        
        const results = await response.json()
        
        clearInterval(progressInterval)
        actions.updateAnalysisProgress(100)
        actions.setAnalysisResults(results)
        actions.setAnalyzing(false)
        
        toast.success('Analysis completed successfully!')
        
      } catch (error) {
        actions.setAnalyzing(false)
        actions.updateAnalysisProgress(0)
        toast.error('Analysis failed. Please try again.')
        console.error('Analysis error:', error)
      }
    },
    
    sendChatMessage: async (message) => {
      try {
        const userMessage = {
          id: Date.now(),
          type: 'user',
          content: message,
          timestamp: new Date().toISOString()
        }
        
        actions.addChatMessage(userMessage)
        actions.setChatting(true)
        
        // Simulate AI response (replace with actual WebSocket call)
        setTimeout(() => {
          const aiMessage = {
            id: Date.now() + 1,
            type: 'ai',
            content: `I understand you're asking about "${message}". Let me help you with that. This is a simulated response - in the real implementation, this would come from your AI agent.`,
            timestamp: new Date().toISOString()
          }
          
          actions.addChatMessage(aiMessage)
          actions.setChatting(false)
        }, 2000)
        
      } catch (error) {
        actions.setChatting(false)
        toast.error('Failed to send message')
        console.error('Chat error:', error)
      }
    }
  }

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      actions.setTheme(savedTheme)
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark')
  }, [state.theme])

  const value = {
    state,
    actions
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export default AppContext


