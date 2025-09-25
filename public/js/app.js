// Navigation
const views = document.querySelectorAll('.view');
const sidebar = document.getElementById('sidebar');
const hamburger = document.getElementById('hamburger');

// Main navigation
document.querySelectorAll('.nav-btn, .feature-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.querySelector(btn.dataset.target);
    if (!target) return;
    views.forEach(v => v.classList.remove('active'));
    target.classList.add('active');
    sidebar.classList.remove('active');
    hamburger.classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// Hamburger menu toggle
hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('active');
  hamburger.classList.toggle('active');
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
  if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
    sidebar.classList.remove('active');
    hamburger.classList.remove('active');
  }
});

// Modal handling
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

loginBtn.addEventListener('click', () => loginModal.style.display = 'block');
registerBtn.addEventListener('click', () => registerModal.style.display = 'block');

document.querySelectorAll('.close').forEach(closeBtn => {
  closeBtn.addEventListener('click', (e) => {
    e.target.closest('.modal').style.display = 'none';
  });
});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
});

// Auth form handling
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Login functionality would be implemented here');
  loginModal.style.display = 'none';
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Registration functionality would be implemented here');
  registerModal.style.display = 'none';
});

// Subtle background particle animation
(function backgroundStars() {
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d');
  let w, h, stars;
  function resize() {
    w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight;
    stars = Array.from({ length: Math.min(180, Math.floor((w*h)/20000)) }, () => ({
      x: Math.random()*w, y: Math.random()*h, z: Math.random()*0.8 + 0.2, s: Math.random()*1.5+0.3
    }));
  }
  window.addEventListener('resize', resize); resize();
  function tick() {
    ctx.clearRect(0,0,w,h);
    for (const p of stars) {
      ctx.fillStyle = `rgba(255,255,255,${0.35*p.z})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI*2); ctx.fill();
      p.y += 0.08*p.s + 0.05; if (p.y > h) { p.y = -2; p.x = Math.random()*w; }
    }
    requestAnimationFrame(tick);
  }
  tick();
})();

// Evaluation logic
const form = document.getElementById('evalForm');
const resultsEl = document.getElementById('results');
const sliders = {
  researchGap: { span: document.getElementById('rgVal') },
  futurePotential: { span: document.getElementById('fpVal') },
  competitors: { span: document.getElementById('ciVal') },
  teamStrength: { span: document.getElementById('tsVal') },
  techNovelty: { span: document.getElementById('tnVal') },
  marketDemand: { span: document.getElementById('mdVal') },
  marketPotential: { span: document.getElementById('mpVal') },
  revenue: { span: document.getElementById('rg2Val') },
};
Object.keys(sliders).forEach(name => {
  const input = form.elements[name];
  input.addEventListener('input', () => { sliders[name].span.textContent = input.value; });
});

// Stub agents (scoring based on simple heuristics)
function evaluateAgents(inputs) {
  const competitorPressure = Number(inputs.competitors);
  const invertedCompetition = 11 - competitorPressure; // less competition → higher score
  const weights = {
    researchGap: 0.12,
    futurePotential: 0.16,
    competitors: 0.10,
    teamStrength: 0.16,
    techNovelty: 0.16,
    marketDemand: 0.12,
    marketPotential: 0.10,
    revenue: 0.08,
  };
  const factors = {
    ResearchGap: Number(inputs.researchGap),
    FuturePotential: Number(inputs.futurePotential),
    Competition: invertedCompetition,
    TeamStrength: Number(inputs.teamStrength),
    TechNovelty: Number(inputs.techNovelty),
    MarketDemand: Number(inputs.marketDemand),
    MarketPotential: Number(inputs.marketPotential),
    Revenue: Number(inputs.revenue),
  };
  const composite = (
    factors.ResearchGap * weights.researchGap +
    factors.FuturePotential * weights.futurePotential +
    (11 - inputs.competitors) * weights.competitors +
    factors.TeamStrength * weights.teamStrength +
    factors.TechNovelty * weights.techNovelty +
    factors.MarketDemand * weights.marketDemand +
    factors.MarketPotential * weights.marketPotential +
    factors.Revenue * weights.revenue
  ) / (
    Object.values(weights).reduce((a,b)=>a+b,0)
  );
  return { factors, composite: Number(composite.toFixed(2)) };
}

// Charts
let radarChart, barChart;
function renderCharts(factors) {
  const labels = Object.keys(factors);
  const values = Object.values(factors);
  const radarEl = document.getElementById('radarChart');
  const barEl = document.getElementById('barChart');
  radarChart?.destroy();
  barChart?.destroy();
  radarChart = new Chart(radarEl, {
    type: 'radar',
    data: { labels, datasets: [{ label: 'Scores', data: values, borderColor: '#22d3ee', backgroundColor: 'rgba(34,211,238,0.25)' }] },
    options: { scales: { r: { angleLines: { color: 'rgba(255,255,255,0.15)' }, grid: { color: 'rgba(255,255,255,0.12)' }, pointLabels: { color: '#e5e7eb' }, suggestedMin: 0, suggestedMax: 10 } }, plugins: { legend: { labels: { color: '#e5e7eb' } } } }
  });
  barChart = new Chart(barEl, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Scores', data: values, backgroundColor: '#7c3aed' }] },
    options: { scales: { x: { ticks: { color: '#e5e7eb' } }, y: { ticks: { color: '#e5e7eb' }, suggestedMax: 10 } }, plugins: { legend: { labels: { color: '#e5e7eb' } } } }
  });
}

// Dashboard summary
function updateDashboardSummary(factors) {
  const entries = Object.entries(factors);
  const avg = (entries.reduce((a, [,v]) => a+v, 0) / entries.length).toFixed(2);
  const strongest = entries.reduce((a,b)=> a[1] > b[1] ? a : b);
  const weakest = entries.reduce((a,b)=> a[1] < b[1] ? a : b);
  document.getElementById('avgPotential').textContent = avg;
  document.getElementById('strongestFactor').textContent = `${strongest[0]} (${strongest[1]})`;
  document.getElementById('weakestFactor').textContent = `${weakest[0]} (${weakest[1]})`;
}

// File upload basic handling
document.getElementById('pdfInput').addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (file) {
    resultsEl.insertAdjacentHTML('afterbegin', `<div>Uploaded: ${file.name} (${Math.round(file.size/1024)} KB)</div>`);
  }
});

// Handle Run Analysis button click
function initRunAnalysis() {
  const runAnalysisBtn = document.getElementById('runAnalysisBtn');
  const form = document.getElementById('evalForm');
  const resultsEl = document.getElementById('results');
  
  if (!runAnalysisBtn || !form || !resultsEl) {
    console.warn('Run Analysis button, form, or results element not found');
    return;
  }

  runAnalysisBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get form data
    const data = Object.fromEntries(new FormData(form).entries());
    
    // Validate required fields
    if (!data.name || !data.problem || !data.solution) {
      resultsEl.innerHTML = `
        <div class="card">
          <div class="card-title">Validation Error</div>
          <div class="card-value">❌ Missing required fields</div>
        </div>
        <div class="analysis-result">
          <p>Please fill in: Startup Name, Problem Statement, and Solution Overview</p>
        </div>`;
      return;
    }
    
    // Collect additional features
    const additionalFeatures = [];
    document.querySelectorAll('.feature-input').forEach(input => {
      const name = input.querySelector('.feature-name').value.trim();
      const desc = input.querySelector('.feature-desc').value.trim();
      if (name && desc) {
        additionalFeatures.push({ name, description: desc });
      }
    });
    
    // Show loading state
    resultsEl.innerHTML = `
      <div class="card">
        <div class="card-title">Analyzing with AI...</div>
        <div class="card-value">🤖 Processing</div>
      </div>`;
    
    try {
      // Send to server for AI analysis
      if (isConnected && ws) {
        ws.send(JSON.stringify({
          type: 'startup_analysis',
          ...data,
          additionalFeatures
        }));
      } else {
        // Fallback to local analysis
        const { factors, composite } = evaluateAgents(data);
        resultsEl.innerHTML = `
          <div class="card">
            <div class="card-title">Composite Potential (1-10)</div>
            <div class="card-value">${composite}</div>
          </div>`;
        renderCharts(factors);
        updateDashboardSummary(factors);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      resultsEl.innerHTML = `
        <div class="card">
          <div class="card-title">Analysis Error</div>
          <div class="card-value">❌ Failed</div>
        </div>
        <div class="analysis-result">
          <p>Error: ${error.message}</p>
        </div>`;
    }
  });
}

// Handle AI analysis response
function handleAnalysisResponse(analysis) {
  try {
    // Check if analysis is JSON or text
    let analysisData;
    if (typeof analysis === 'string') {
      try {
        analysisData = JSON.parse(analysis);
      } catch (e) {
        // If not JSON, treat as text
        const cleanAnalysis = analysis
          .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove ** bold formatting
          .replace(/\*(.*?)\*/g, '$1');     // Remove * italic formatting
        
        // Update context with text analysis
        updateAnalysisContext({ type: 'text', content: cleanAnalysis });
        
        resultsEl.innerHTML = `
          <div class="card">
            <div class="card-title">AI Analysis Complete</div>
            <div class="card-value">✅ Ready</div>
          </div>
          <div class="analysis-result">
            <h4>🧠 AI-Generated Analysis</h4>
            <div class="analysis-content">${cleanAnalysis.replace(/\n/g, '<br>')}</div>
          </div>`;
        return;
      }
    } else {
      analysisData = analysis;
    }

    // Update context with structured analysis data
    updateAnalysisContext(analysisData);

    // Display structured analysis results
    let scoresHtml = '';
    if (analysisData.scores) {
      scoresHtml = Object.entries(analysisData.scores).map(([key, value]) => `
        <div class="score-item">
          <span class="score-label">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
          <span class="score-value">${value}/10</span>
        </div>
      `).join('');
    }

    let detailedHtml = '';
    if (analysisData.detailedAnalysis) {
      detailedHtml = Object.entries(analysisData.detailedAnalysis).map(([key, value]) => `
        <div class="detail-item">
          <h5>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h5>
          <p>${value}</p>
        </div>
      `).join('');
    }

    let recommendationsHtml = '';
    if (analysisData.recommendations) {
      recommendationsHtml = analysisData.recommendations.map(rec => `<li>${rec}</li>`).join('');
    }

    let nextStepsHtml = '';
    if (analysisData.nextSteps) {
      nextStepsHtml = analysisData.nextSteps.map(step => `<li>${step}</li>`).join('');
    }

    resultsEl.innerHTML = `
      <div class="card">
        <div class="card-title">Breakthrough Potential Score</div>
        <div class="card-value">${analysisData.compositeScore || 'N/A'}/10</div>
      </div>
      
      <div class="analysis-scores">
        <h4>📊 Evaluation Scores</h4>
        <div class="scores-grid">${scoresHtml}</div>
      </div>
      
      <div class="analysis-details">
        <h4>🔍 Detailed Analysis</h4>
        <div class="details-content">${detailedHtml}</div>
      </div>
      
      ${analysisData.breakthroughPotential ? `
        <div class="breakthrough-assessment">
          <h4>🚀 Breakthrough Potential</h4>
          <p>${analysisData.breakthroughPotential}</p>
        </div>
      ` : ''}
      
      ${recommendationsHtml ? `
        <div class="recommendations">
          <h4>💡 Recommendations</h4>
          <ul>${recommendationsHtml}</ul>
        </div>
      ` : ''}
      
      ${nextStepsHtml ? `
        <div class="next-steps">
          <h4>📋 Next Steps</h4>
          <ul>${nextStepsHtml}</ul>
        </div>
      ` : ''}
    `;

    // Update dashboard with the analysis data
    updateDashboardWithAnalysis(analysisData);
    
  } catch (error) {
    console.error('Error handling analysis response:', error);
    resultsEl.innerHTML = `
      <div class="card">
        <div class="card-title">Analysis Error</div>
        <div class="card-value">❌ Failed</div>
      </div>
      <div class="analysis-result">
        <h4>Error Processing Analysis</h4>
        <div class="analysis-content">${error.message}</div>
      </div>`;
  }
}

// Update dashboard with analysis data
function updateDashboardWithAnalysis(analysisData) {
  // Update dashboard charts with real data
  if (analysisData.scores) {
    updateDashboardCharts(analysisData.scores);
  }
}

// Update dashboard charts with analysis scores
function updateDashboardCharts(scores) {
  // Update breakthrough potential chart
  const breakthroughCtx = document.getElementById('breakthroughChart');
  if (breakthroughCtx) {
    const chart = Chart.getChart(breakthroughCtx);
    if (chart) {
      chart.data.datasets[0].data = Object.values(scores);
      chart.data.labels = Object.keys(scores).map(key => 
        key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      );
      chart.update();
    }
  }
}

// Real-time AI Chat with WebSocket
let ws = null;
let isConnected = false;
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];

// DOM elements
const chatLog = document.getElementById('chatLog');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');
const speakBtn = document.getElementById('speakBtn');
const audioToggleBtn = document.getElementById('audioToggleBtn');
const clearBtn = document.getElementById('clearBtn');
const connectionStatus = document.getElementById('connectionStatus');

// Initialize WebSocket connection
function initWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;
  
  ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    isConnected = true;
    updateConnectionStatus('connected', 'Connected');
    console.log('WebSocket connected');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleWebSocketMessage(data);
  };
  
  ws.onclose = () => {
    isConnected = false;
    updateConnectionStatus('error', 'Disconnected');
    console.log('WebSocket disconnected');
    // Attempt to reconnect after 3 seconds
    setTimeout(initWebSocket, 3000);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    updateConnectionStatus('error', 'Connection Error');
  };
}

// Update connection status UI
function updateConnectionStatus(status, text) {
  const statusDot = connectionStatus.querySelector('.status-dot');
  const statusText = connectionStatus.querySelector('.status-text');
  
  statusDot.className = `status-dot ${status}`;
  statusText.textContent = text;
}

// Handle incoming WebSocket messages
function handleWebSocketMessage(data) {
  switch (data.type) {
    case 'chat_response':
      addMessage(data.message, 'bot');
      break;
    case 'text_to_speech_response':
      playAudio(data.audio);
      break;
    case 'speech_to_text_response':
      addMessage(data.text, 'user');
      break;
    case 'startup_analysis_response':
      handleAnalysisResponse(data.analysis);
      break;
    case 'patent_search_response':
      handlePatentSearchResponse(data.results);
      break;
    case 'research_gap_analysis_response':
      handleResearchGapResponse(data.analysis);
      break;
    case 'deep_analysis_response':
      handleDeepAnalysisResponse(data.analysis);
      break;
    case 'error':
      addMessage(`Error: ${data.message}`, 'bot');
      break;
    default:
      console.log('Unknown message type:', data.type);
  }
}

// Add message to chat log
function addMessage(text, role) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.textContent = text;
  
  const timeDiv = document.createElement('div');
  timeDiv.className = 'message-time';
  timeDiv.textContent = new Date().toLocaleTimeString();
  
  messageDiv.appendChild(contentDiv);
  messageDiv.appendChild(timeDiv);
  
  // Remove welcome message if it exists
  const welcomeMessage = chatLog.querySelector('.welcome-message');
  if (welcomeMessage) {
    welcomeMessage.remove();
  }
  
  chatLog.appendChild(messageDiv);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Send message via WebSocket
function sendMessage(message, generateSpeech = false) {
  if (!isConnected || !ws) {
    addMessage('Not connected to server. Please wait...', 'bot');
    return;
  }
  
  ws.send(JSON.stringify({
    type: 'chat',
    message: message,
    generateSpeech: generateSpeech
  }));
}

// Play audio from base64
function base64ToBlob(base64, mimeType) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

function playAudio(base64Audio) {
  try {
    // Send audio to Beyond Presence for lip-sync
    sendAudioToBeyondPresence(base64Audio, 'audio/mpeg');
    
    // Only play browser audio if avatar audio is disabled
    if (!audioSettings.useAvatarAudio) {
      const audioBlob = base64ToBlob(base64Audio, 'audio/mpeg');
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.play();

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } else {
      console.log('Using avatar audio - browser audio disabled to prevent overlap');
    }
  } catch (error) {
    console.error('Error playing audio:', error);
  }
}

// Start audio recording
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
    mediaRecorder = new MediaRecorder(stream, { mimeType });
    audioChunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };
    
    mediaRecorder.onstop = () => {
      const type = mediaRecorder.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunks, { type });
      const reader = new FileReader();
      reader.onload = () => {
        const base64Audio = reader.result.split(',')[1];
        sendAudioToServer(base64Audio);
      };
      reader.readAsDataURL(audioBlob);
    };
    
    mediaRecorder.start();
    isRecording = true;
    micBtn.classList.add('active');
    micBtn.querySelector('.btn-text').textContent = 'Stop';
    
  } catch (error) {
    console.error('Error starting recording:', error);
    addMessage('Microphone access denied. Please allow microphone access.', 'bot');
  }
}

// Stop audio recording
function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    isRecording = false;
    micBtn.classList.remove('active');
    micBtn.querySelector('.btn-text').textContent = 'Voice';
  }
}

// Send audio to server for speech-to-text
function sendAudioToServer(base64Audio) {
  if (!isConnected || !ws) {
    addMessage('Not connected to server. Please wait...', 'bot');
    return;
  }
  
  ws.send(JSON.stringify({
    type: 'speech_to_text',
    audio: base64Audio,
    mimeType: mediaRecorder?.mimeType || 'audio/webm'
  }));
}

// Event listeners
sendBtn.addEventListener('click', () => {
  const text = chatInput.value.trim();
  if (!text) return;
  
  addMessage(text, 'user');
  sendMessage(text, true); // Generate speech for AI response
  chatInput.value = '';
});

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendBtn.click();
  }
});

micBtn.addEventListener('click', () => {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
});

speakBtn.addEventListener('click', () => {
  const lastBotMessage = Array.from(chatLog.querySelectorAll('.message.bot')).pop();
  if (lastBotMessage) {
    const text = lastBotMessage.querySelector('.message-content').textContent;
    sendMessage(`Please speak this text: ${text}`, true);
  }
});

clearBtn.addEventListener('click', () => {
  chatLog.innerHTML = `
    <div class="welcome-message">
      <div class="message bot">
        <div class="message-content">
          👋 Chat cleared! How can I help you with your startup analysis today?
        </div>
        <div class="message-time">Just now</div>
      </div>
    </div>
  `;
});

// Audio toggle button
audioToggleBtn.addEventListener('click', () => {
  audioSettings.useAvatarAudio = !audioSettings.useAvatarAudio;
  
  if (audioSettings.useAvatarAudio) {
    audioToggleBtn.querySelector('.btn-text').textContent = 'Avatar';
    audioToggleBtn.querySelector('.audio-icon').textContent = '🎭';
    audioToggleBtn.title = 'Using Avatar Audio (click to use Browser Audio)';
    console.log('Switched to Avatar Audio');
  } else {
    audioToggleBtn.querySelector('.btn-text').textContent = 'Browser';
    audioToggleBtn.querySelector('.audio-icon').textContent = '🔊';
    audioToggleBtn.title = 'Using Browser Audio (click to use Avatar Audio)';
    console.log('Switched to Browser Audio');
  }
});

// Initialize Beyond Presence iframe communication
function initBeyondPresence() {
  // Listen for messages from Beyond Presence iframe
  window.addEventListener('message', (event) => {
    if (event.origin !== 'https://bey.chat') return;
    
    switch (event.data.type) {
      case 'avatar_ready':
        console.log('Beyond Presence avatar is ready');
        updateConnectionStatus('connected', 'Avatar Ready');
        // Send current analysis context to avatar
        sendContextToAvatar();
        break;
      case 'avatar_speaking':
        console.log('Avatar is speaking');
        break;
      case 'avatar_idle':
        console.log('Avatar is idle');
        break;
      case 'context_request':
        // Avatar is requesting current context
        sendContextToAvatar();
        break;
      default:
        console.log('Beyond Presence message:', event.data);
    }
  });
}

// Send analysis context to Beyond Presence avatar
function sendContextToAvatar() {
  const iframe = document.getElementById('beyond-presence-iframe');
  if (iframe && iframe.contentWindow) {
    const context = {
      currentAnalysis: window.currentAnalysisData || null,
      conversationHistory: window.conversationHistory || [],
      timestamp: new Date().toISOString()
    };
    
    iframe.contentWindow.postMessage({
      type: 'analysis_context',
      context: context
    }, 'https://bey.chat');
    
    console.log('Analysis context sent to Beyond Presence avatar');
  }
}

// Update analysis context when new analysis is received
function updateAnalysisContext(analysisData) {
  window.currentAnalysisData = analysisData;
  // Send updated context to avatar
  sendContextToAvatar();
}

// Audio control settings
let audioSettings = {
  useAvatarAudio: true,  // Use avatar's built-in audio instead of browser audio
  enableLipSync: true    // Enable lip-sync with avatar
};

// Send audio to Beyond Presence for lip-sync
function sendAudioToBeyondPresence(base64Audio, mimeType = 'audio/mpeg') {
  try {
    const iframe = document.getElementById('beyond-presence-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'audio_stream',
        audio: base64Audio,
        mimeType: mimeType,
        timestamp: Date.now(),
        useAvatarAudio: audioSettings.useAvatarAudio
      }, 'https://bey.chat');
      
      console.log('Audio sent to Beyond Presence for lip-sync');
      return true;
    } else {
      console.warn('Beyond Presence iframe not found');
      return false;
    }
  } catch (error) {
    console.error('Failed to send audio to Beyond Presence:', error);
    return false;
  }
}

// Additional Features Management
function initAdditionalFeatures() {
  const addFeatureBtn = document.getElementById('addFeature');
  const featureInputs = document.getElementById('featureInputs');
  
  if (!addFeatureBtn || !featureInputs) {
    console.warn('Add Feature button or feature inputs container not found');
    return;
  }

  // Add feature button functionality
  addFeatureBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const featureInput = document.createElement('div');
    featureInput.className = 'feature-input';
    featureInput.innerHTML = `
      <input type="text" placeholder="Feature name (e.g., Scalability)" class="feature-name" />
      <textarea placeholder="Description of this feature" class="feature-desc"></textarea>
      <button type="button" class="remove-feature">Remove</button>
    `;
    featureInputs.appendChild(featureInput);
    
    // Add remove functionality to the new feature
    const removeBtn = featureInput.querySelector('.remove-feature');
    removeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      featureInput.remove();
    });
  });
  
  // Add remove functionality to existing features
  document.querySelectorAll('.remove-feature').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const featureInput = e.target.closest('.feature-input');
      if (featureInput) {
        featureInput.remove();
      }
    });
  });
}

// Patent Search Functionality
function initPatentSearch() {
  const searchBtn = document.getElementById('searchPatents');
  const searchInput = document.getElementById('patentSearch');
  const searchType = document.getElementById('searchType');
  const searchLimit = document.getElementById('searchLimit');
  const resultsContainer = document.getElementById('resultsContainer');
  const loadingMessage = document.querySelector('.loading-message');

  if (!searchBtn || !searchInput || !resultsContainer) {
    console.warn('Patent search elements not found');
    return;
  }

  searchBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const query = searchInput.value.trim();
    if (!query) {
      resultsContainer.innerHTML = '<p>Please enter search keywords.</p>';
      return;
    }

    // Show loading
    if (loadingMessage) loadingMessage.style.display = 'block';
    resultsContainer.innerHTML = '';

    try {
      // Send search request
      if (isConnected && ws) {
        ws.send(JSON.stringify({
          type: 'patent_search',
          query: query,
          searchType: searchType ? searchType.value : 'patent',
          limit: parseInt(searchLimit ? searchLimit.value : 10)
        }));
      } else {
        // Fallback
        if (loadingMessage) loadingMessage.style.display = 'none';
        resultsContainer.innerHTML = '<p>WebSocket not connected. Please refresh the page.</p>';
      }
    } catch (error) {
      console.error('Patent search error:', error);
      if (loadingMessage) loadingMessage.style.display = 'none';
      resultsContainer.innerHTML = '<p>Error searching patents. Please try again.</p>';
    }
  });
}

// Handle patent search response
function handlePatentSearchResponse(results) {
  const resultsContainer = document.getElementById('resultsContainer');
  const loadingMessage = document.querySelector('.loading-message');
  
  loadingMessage.style.display = 'none';
  
  if (!results || results.length === 0) {
    resultsContainer.innerHTML = '<p>No results found. Try different keywords.</p>';
    return;
  }

  const resultsHtml = results.map(result => `
    <div class="patent-card">
      <h4>${result.title || 'Untitled'}</h4>
      <div class="similarity-score">Similarity: ${Math.round((result.similarityScore || 0) * 100)}%</div>
      <p><strong>${result.patentNumber || result.doi || 'N/A'}</strong></p>
      <p class="abstract">${result.abstract || 'No abstract available'}</p>
      ${result.inventors ? `<p><strong>Inventors:</strong> ${result.inventors.join(', ')}</p>` : ''}
      ${result.authors ? `<p><strong>Authors:</strong> ${result.authors.join(', ')}</p>` : ''}
      ${result.assignee ? `<p><strong>Assignee:</strong> ${result.assignee}</p>` : ''}
      ${result.journal ? `<p><strong>Journal:</strong> ${result.journal}</p>` : ''}
      ${result.publicationDate ? `<p><strong>Date:</strong> ${result.publicationDate}</p>` : ''}
    </div>
  `).join('');

  resultsContainer.innerHTML = resultsHtml;
}

// Handle research gap analysis response
function handleResearchGapResponse(analysis) {
  // This would be used in the research gap section
  console.log('Research gap analysis:', analysis);
}

// Handle deep analysis response
function handleDeepAnalysisResponse(analysis) {
  const resultsContent = document.getElementById('deepAnalysisContent');
  const loadingMessage = document.querySelector('#deepAnalysisResults .loading-message');
  
  loadingMessage.style.display = 'none';
  
  if (!analysis) {
    resultsContent.innerHTML = '<p>No analysis results available.</p>';
    return;
  }

  // Format the analysis text with proper styling (remove markdown formatting)
  const formattedAnalysis = analysis
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove ** bold formatting
    .replace(/\*(.*?)\*/g, '$1')      // Remove * italic formatting
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  resultsContent.innerHTML = `
    <div class="deep-analysis-result">
      <h4>🧠 Comprehensive Analysis Results</h4>
      <div class="analysis-content">
        <p>${formattedAnalysis}</p>
      </div>
    </div>
  `;
}

// Deep Analysis Functionality
function initDeepAnalysis() {
  const runBtn = document.getElementById('runDeepAnalysis');
  const input = document.getElementById('deepAnalysisInput');
  const resultsContent = document.getElementById('deepAnalysisContent');
  const loadingMessage = document.querySelector('#deepAnalysisResults .loading-message');

  if (!runBtn || !input || !resultsContent) {
    console.warn('Deep analysis elements not found');
    return;
  }

  runBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const text = input.value.trim();
    if (!text) {
      resultsContent.innerHTML = '<p>Please enter startup description for analysis.</p>';
      return;
    }

    // Show loading
    if (loadingMessage) loadingMessage.style.display = 'block';
    resultsContent.innerHTML = '';

    try {
      // Send deep analysis request
      if (isConnected && ws) {
        ws.send(JSON.stringify({
          type: 'deep_analysis',
          text: text
        }));
      } else {
        // Fallback
        if (loadingMessage) loadingMessage.style.display = 'none';
        resultsContent.innerHTML = '<p>WebSocket not connected. Please refresh the page.</p>';
      }
    } catch (error) {
      console.error('Deep analysis error:', error);
      if (loadingMessage) loadingMessage.style.display = 'none';
      resultsContent.innerHTML = '<p>Error running deep analysis. Please try again.</p>';
    }
  });
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
  initWebSocket();
  initBeyondPresence();
  initAdditionalFeatures();
  initPatentSearch();
  initDeepAnalysis();
  initRunAnalysis();
  // Initialize charts after a short delay to ensure DOM is ready
  setTimeout(initializeCharts, 500);
});

// Enhanced visualizations for new sections
let innovationChart, competitorChart, marketSizeChart, adoptionChart, researchMatrix;

// Initialize additional charts when sections are viewed
function initializeCharts() {
  // Innovation Chart
  const innovationCtx = document.getElementById('innovationChart');
  if (innovationCtx && !innovationChart) {
    innovationChart = new Chart(innovationCtx, {
      type: 'doughnut',
      data: {
        labels: ['Novelty', 'Feasibility', 'Impact'],
        datasets: [{
          data: [8.2, 7.5, 8.8],
          backgroundColor: ['#7c3aed', '#22d3ee', '#10b981'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#e5e7eb' } }
        }
      }
    });
  }

  // Competitor Chart
  const competitorCtx = document.getElementById('competitorChart');
  if (competitorCtx && !competitorChart) {
    competitorChart = new Chart(competitorCtx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Competitors',
          data: [
            {x: 8, y: 6, label: 'TechCorp AI'},
            {x: 6, y: 8, label: 'InnovateLab'},
            {x: 7, y: 7, label: 'Your Startup'}
          ],
          backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
          borderColor: ['#ef4444', '#f59e0b', '#10b981'],
          pointRadius: 8
        }]
      },
      options: {
        scales: {
          x: { 
            title: { display: true, text: 'Technology Strength', color: '#e5e7eb' },
            ticks: { color: '#e5e7eb' }
          },
          y: { 
            title: { display: true, text: 'Market Position', color: '#e5e7eb' },
            ticks: { color: '#e5e7eb' }
          }
        },
        plugins: {
          legend: { labels: { color: '#e5e7eb' } }
        }
      }
    });
  }

  // Market Size Chart
  const marketCtx = document.getElementById('marketSizeChart');
  if (marketCtx && !marketSizeChart) {
    marketSizeChart = new Chart(marketCtx, {
      type: 'line',
      data: {
        labels: ['2023', '2024', '2025', '2026', '2027'],
        datasets: [{
          label: 'Market Size (B$)',
          data: [1.2, 1.5, 1.8, 2.0, 2.3],
          borderColor: '#22d3ee',
          backgroundColor: 'rgba(34,211,238,0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: { ticks: { color: '#e5e7eb' } },
          y: { ticks: { color: '#e5e7eb' } }
        },
        plugins: {
          legend: { labels: { color: '#e5e7eb' } }
        }
      }
    });
  }

  // Adoption Chart
  const adoptionCtx = document.getElementById('adoptionChart');
  if (adoptionCtx && !adoptionChart) {
    adoptionChart = new Chart(adoptionCtx, {
      type: 'line',
      data: {
        labels: ['Innovators', 'Early Adopters', 'Early Majority', 'Late Majority', 'Laggards'],
        datasets: [{
          label: 'Adoption %',
          data: [2.5, 13.5, 34, 34, 16],
          borderColor: '#7c3aed',
          backgroundColor: 'rgba(124,58,237,0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: { ticks: { color: '#e5e7eb' } },
          y: { ticks: { color: '#e5e7eb' } }
        },
        plugins: {
          legend: { labels: { color: '#e5e7eb' } }
        }
      }
    });
  }

  // Research Matrix
  const researchCtx = document.getElementById('researchMatrix');
  if (researchCtx && !researchMatrix) {
    researchMatrix = new Chart(researchCtx, {
      type: 'bubble',
      data: {
        datasets: [{
          label: 'Research Areas',
          data: [
            {x: 8, y: 6, r: 15, label: 'AI/ML'},
            {x: 6, y: 8, r: 12, label: 'Quantum'},
            {x: 7, y: 5, r: 10, label: 'Biotech'},
            {x: 5, y: 7, r: 8, label: 'Materials'}
          ],
          backgroundColor: 'rgba(124,58,237,0.6)',
          borderColor: '#7c3aed'
        }]
      },
      options: {
        scales: {
          x: { 
            title: { display: true, text: 'Innovation Level', color: '#e5e7eb' },
            ticks: { color: '#e5e7eb' }
          },
          y: { 
            title: { display: true, text: 'Market Readiness', color: '#e5e7eb' },
            ticks: { color: '#e5e7eb' }
          }
        },
        plugins: {
          legend: { labels: { color: '#e5e7eb' } }
        }
      }
    });
  }
}

// Patent search functionality
document.getElementById('searchPatents').addEventListener('click', () => {
  const query = document.getElementById('patentSearch').value;
  if (!query) return;
  
  // Simulate patent search results
  const results = document.getElementById('patentResults');
  results.innerHTML = `
    <div class="patent-card">
      <h4>${query} Optimization Method</h4>
      <div class="similarity-score">Similarity: 89%</div>
      <p>US Patent 11,234,567 - Advanced ${query} processing technique</p>
    </div>
    <div class="patent-card">
      <h4>${query} Neural Network</h4>
      <div class="similarity-score">Similarity: 76%</div>
      <p>US Patent 10,987,654 - Deep learning approach to ${query}</p>
    </div>
  `;
});

// Remove duplicate DOMContentLoaded listener - functionality moved above

// Re-initialize charts when switching to analysis sections
document.querySelectorAll('[data-target="#analysis"], [data-target="#patents"], [data-target="#insights"], [data-target="#research"]').forEach(btn => {
  btn.addEventListener('click', () => {
    setTimeout(initializeCharts, 300);
  });
});


