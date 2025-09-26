// WebSocket service for real-time communication
import { geminiService } from './anthropic.js'
import { elevenlabsService } from './elevenlabs.js'
import { logicMillService } from './logicMill.js'
import fs from 'fs'
import path from 'path'

// Store active connections
const connections = new Map()

// Transcript saving functionality
function saveTranscriptEntry(type, input, output) {
  try {
    const transcriptDir = path.join(process.cwd(), 'transcripts')
    if (!fs.existsSync(transcriptDir)) {
      fs.mkdirSync(transcriptDir, { recursive: true })
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `transcript_${timestamp}.csv`
    const filepath = path.join(transcriptDir, filename)
    
    const csvContent = `Type,Timestamp,Input,Output\n"${type}","${new Date().toISOString()}","${JSON.stringify(input).replace(/"/g, '""')}","${JSON.stringify(output).replace(/"/g, '""')}"\n`
    
    fs.writeFileSync(filepath, csvContent)
    console.log(`Transcript saved: ${filepath}`)
  } catch (error) {
    console.error('Error saving transcript:', error)
  }
}

export function setupWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    const connectionId = Date.now().toString()
    connections.set(connectionId, ws)
    
    console.log(`New WebSocket connection: ${connectionId}`)
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message)
        await handleMessage(connectionId, data, ws)
      } catch (error) {
        console.error('Error handling message:', error)
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Failed to process message' 
        }))
      }
    })
    
    ws.on('close', () => {
      console.log(`WebSocket connection closed: ${connectionId}`)
      connections.delete(connectionId)
    })
    
    ws.on('error', (error) => {
      console.error(`WebSocket error for ${connectionId}:`, error)
      connections.delete(connectionId)
    })
  })
}

// Handle different message types
async function handleMessage(connectionId, data, ws) {
  switch (data.type) {
    case 'chat':
      await handleChatMessage(data, ws)
      break
    case 'speech_to_text':
      await handleSpeechToText(data, ws)
      break
    case 'text_to_speech':
      await handleTextToSpeech(data, ws)
      break
    case 'startup_analysis':
      await handleStartupAnalysis(data, ws)
      break
    case 'patent_search':
      await handlePatentSearch(data, ws)
      break
    case 'research_gap_analysis':
      await handleResearchGapAnalysis(data, ws)
      break
    case 'deep_analysis':
      await handleDeepAnalysis(data, ws)
      break
    default:
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Unknown message type' 
      }))
  }
}

// Handle chat messages with Gemini
async function handleChatMessage(data, ws) {
  try {
    const response = await geminiService.generateResponse(data.message)
    
    // Add conversation to context
    geminiService.addConversationMessage(data.message, response, 'chat')
    
    // Save transcript entry
    saveTranscriptEntry('chat', data.message, response)
    
    // Send text response
    ws.send(JSON.stringify({
      type: 'chat_response',
      message: response,
      timestamp: new Date().toISOString()
    }))
    
    // Generate speech if requested
    if (data.generateSpeech) {
      await generateAndSendSpeech(response, ws)
    }
    
  } catch (error) {
    console.error('Error in chat handling:', error)
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to generate response'
    }))
  }
}

// Handle speech-to-text with ElevenLabs
async function handleSpeechToText(data, ws) {
  try {
    const audioBuffer = Buffer.from(data.audio, 'base64')
    const mimeType = data.mimeType || 'audio/webm'
    const transcription = await elevenlabsService.speechToText(audioBuffer, mimeType)
    
    ws.send(JSON.stringify({
      type: 'speech_to_text_response',
      text: transcription.text || transcription.transcript,
      timestamp: new Date().toISOString()
    }))
    
    // Process the transcribed text as a chat message
    await handleChatMessage({
      message: transcription.text || transcription.transcript,
      generateSpeech: true
    }, ws)
    
  } catch (error) {
    console.error('Error in speech-to-text:', error)
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to process speech'
    }))
  }
}

// Generate and send speech using ElevenLabs
async function generateAndSendSpeech(text, ws) {
  try {
    const audioBuffer = await elevenlabsService.textToSpeech(text)
    const base64Audio = Buffer.from(audioBuffer).toString('base64')
    
    ws.send(JSON.stringify({
      type: 'text_to_speech_response',
      audio: base64Audio,
      text: text,
      timestamp: new Date().toISOString()
    }))
    
  } catch (error) {
    console.error('Error generating speech:', error)
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to generate speech'
    }))
  }
}

// Handle startup analysis
async function handleStartupAnalysis(data, ws) {
  try {
    const analysis = await geminiService.analyzeStartup(data)
    
    // Update analysis context
    geminiService.updateAnalysisContext(analysis)
    
    // Also update Beyond Presence context if available
    if (typeof beyondPresenceService !== 'undefined') {
      beyondPresenceService.updateAnalysisContext(analysis)
    }
    
    // Save transcript entry
    saveTranscriptEntry('startup_analysis', data, analysis)
    
    ws.send(JSON.stringify({
      type: 'startup_analysis_response',
      analysis: analysis,
      timestamp: new Date().toISOString()
    }))
    
  } catch (error) {
    console.error('Error in startup analysis:', error)
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to analyze startup'
    }))
  }
}

// Handle patent search requests
async function handlePatentSearch(data, ws) {
  try {
    const results = await logicMillService.searchPatents(data.query, data.limit || 10)
    
    // Save transcript entry
    saveTranscriptEntry('patent_search', data, results)
    
    ws.send(JSON.stringify({
      type: 'patent_search_response',
      results: results,
      timestamp: new Date().toISOString()
    }))
    
  } catch (error) {
    console.error('Error in patent search:', error)
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to search patents'
    }))
  }
}

// Handle research gap analysis requests
async function handleResearchGapAnalysis(data, ws) {
  try {
    const analysis = await logicMillService.analyzeResearchGap(data.description)
    
    // Save transcript entry
    saveTranscriptEntry('research_gap_analysis', data, analysis)
    
    ws.send(JSON.stringify({
      type: 'research_gap_analysis_response',
      analysis: analysis,
      timestamp: new Date().toISOString()
    }))
    
  } catch (error) {
    console.error('Error in research gap analysis:', error)
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to analyze research gap'
    }))
  }
}

// Handle deep analysis requests
async function handleDeepAnalysis(data, ws) {
  try {
    const deepAnalysisPrompt = `You are an expert startup analyst and business consultant specializing in Max Planck research commercialization. Conduct a comprehensive, in-depth analysis of the following startup information:

${data.text}

Please provide a detailed analysis covering:

1. **EXECUTIVE SUMMARY**
   - Key findings and overall assessment
   - Breakthrough potential score (1-10)
   - Critical success factors

2. **TECHNICAL ANALYSIS**
   - Technology maturity and feasibility
   - Innovation level and uniqueness
   - Technical risks and challenges
   - Development timeline estimates

3. **MARKET ANALYSIS**
   - Market size and growth potential
   - Target customer segments
   - Competitive landscape
   - Market entry barriers
   - Go-to-market strategy assessment

4. **BUSINESS MODEL EVALUATION**
   - Revenue model viability
   - Scalability potential
   - Unit economics
   - Funding requirements
   - Path to profitability

5. **TEAM & EXECUTION**
   - Team composition analysis
   - Skills gap assessment
   - Leadership evaluation
   - Execution capability

6. **RISK ASSESSMENT**
   - Technical risks
   - Market risks
   - Financial risks
   - Regulatory risks
   - Mitigation strategies

7. **OPPORTUNITY ANALYSIS**
   - Market timing
   - Competitive advantages
   - Partnership opportunities
   - Exit potential

8. **RECOMMENDATIONS**
   - Immediate next steps
   - Strategic priorities
   - Resource requirements
   - Success metrics

9. **INVESTMENT THESIS**
   - Why this could be a breakthrough
   - Key value drivers
   - Potential returns
   - Investment considerations

Format your response in a clear, structured manner with specific insights and actionable recommendations. Focus on scientific breakthrough potential and commercialization viability.`;

    const response = await geminiService.generateResponse(deepAnalysisPrompt)
    
    // Save transcript entry
    saveTranscriptEntry('deep_analysis', data, response)
    
    ws.send(JSON.stringify({
      type: 'deep_analysis_response',
      analysis: response,
      timestamp: new Date().toISOString()
    }))
    
  } catch (error) {
    console.error('Error in deep analysis:', error)
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Failed to conduct deep analysis'
    }))
  }
}


