# backend/main.py
from fastapi import FastAPI, Request, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO
import logging
import json
import asyncio
from typing import Dict, List
# Configure logging first
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Force use simple orchestrator with real AI
try:
    from backend.simple_orchestrator import run_simple_analysis as run_crewai_analysis
    ORCHESTRATOR_TYPE = "simple"
    logger.info("Using simple orchestrator with real AI")
except Exception as e:
    logger.warning(f"Simple orchestrator not available: {e}")
    try:
        from backend.minimal_orchestrator import run_minimal_analysis as run_crewai_analysis
        ORCHESTRATOR_TYPE = "minimal"
        logger.info("Using minimal orchestrator")
    except Exception as e2:
        logger.error(f"All orchestrators failed: {e2}")
        # Create a dummy function to prevent import errors
        def run_crewai_analysis(*args, **kwargs):
            return {"error": "No orchestrator available"}
        ORCHESTRATOR_TYPE = "none"

from backend.utils.pdf_utils import extract_text_from_pdf

app = FastAPI(
    title="Research Paper Unicorn Potential Analyzer",
    description="API for analyzing research papers to determine unicorn startup potential",
    version="1.0.0"
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            self.disconnect(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections.copy():
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting message: {e}")
                self.disconnect(connection)

manager = ConnectionManager()

# Add CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Research Paper Unicorn Potential Analyzer API", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "services": {
            "orchestrator": ORCHESTRATOR_TYPE,
            "pdf_parser": "available",
            "claude_client": "available"
        }
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication"""
    await manager.connect(websocket)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            logger.info(f"Received WebSocket message: {message.get('type', 'unknown')}")
            
            # Handle different message types
            if message.get("type") == "connection":
                await manager.send_personal_message(json.dumps({
                    "type": "connection_response",
                    "message": "Connected to Research Paper Analyzer",
                    "timestamp": asyncio.get_event_loop().time()
                }), websocket)
                
            elif message.get("type") == "chat":
                await handle_chat_message(message, websocket)
                
            elif message.get("type") == "startup_analysis":
                await handle_startup_analysis(message, websocket)
                
            elif message.get("type") == "patent_search":
                await handle_patent_search(message, websocket)
                
            elif message.get("type") == "research_gap_analysis":
                await handle_research_gap_analysis(message, websocket)
                
            elif message.get("type") == "deep_analysis":
                await handle_deep_analysis(message, websocket)
                
            else:
                await manager.send_personal_message(json.dumps({
                    "type": "error",
                    "message": f"Unknown message type: {message.get('type')}"
                }), websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

@app.post("/analyze-paper")
async def analyze_paper(file: UploadFile = File(None), request: Request = None):
    """
    Handles PDF uploads or raw JSON input.
    Uses CrewAI orchestration for better agent coordination.
    """
    try:
        logger.info("Starting paper analysis request")
        
        if file:
            # PDF upload
            logger.info(f"Processing uploaded file: {file.filename}")
            paper_bytes = await file.read()
            paper_text = extract_text_from_pdf(BytesIO(paper_bytes))
            authors_text = ""
            agents_to_run = None
            
            if not paper_text.strip():
                raise HTTPException(status_code=400, detail="Could not extract text from PDF")
                
        elif request:
            # JSON input
            data = await request.json()
            paper_text = data.get("text", "")
            authors_text = data.get("authors", "")
            agents_to_run = data.get("agents_to_run", None)
            
            if not paper_text.strip():
                raise HTTPException(status_code=400, detail="No text provided for analysis")
        else:
            raise HTTPException(status_code=400, detail="No input provided")

        logger.info(f"Running analysis with {len(paper_text)} characters of text")
        
        # Use CrewAI orchestrator instead of manual pipeline
        results = run_crewai_analysis(paper_text, authors_text, agents_to_run)
        
        if "error" in results:
            logger.error(f"Analysis failed: {results['error']}")
            raise HTTPException(status_code=500, detail=results["error"])
        
        logger.info(f"Analysis completed successfully with score: {results.get('unicorn_potential_score', 'N/A')}")
        return JSONResponse(content=results)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in analyze_paper: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Analysis failed: {str(e)}"}
        )

@app.post("/analyze-text")
async def analyze_text(request: Request):
    """
    Alternative endpoint for text-only analysis.
    """
    try:
        data = await request.json()
        paper_text = data.get("text", "")
        authors_text = data.get("authors", "")
        agents_to_run = data.get("agents_to_run", None)
        
        if not paper_text.strip():
            raise HTTPException(status_code=400, detail="No text provided")
        
        results = run_crewai_analysis(paper_text, authors_text, agents_to_run)
        
        if "error" in results:
            raise HTTPException(status_code=500, detail=results["error"])
        
        return JSONResponse(content=results)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in analyze_text: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Text analysis failed: {str(e)}"}
        )

# WebSocket message handlers
async def handle_chat_message(message: dict, websocket: WebSocket):
    """Handle chat messages from frontend"""
    try:
        user_message = message.get("message", "")
        generate_speech = message.get("generateSpeech", False)
        
        # Use Claude API for real responses
        from backend.utils.claude_client import claude_summarize_novelty
        response = claude_summarize_novelty(user_message)
        
        await manager.send_personal_message(json.dumps({
            "type": "chat_response",
            "message": response,
            "timestamp": asyncio.get_event_loop().time()
        }), websocket)
        
        # TODO: Add text-to-speech if generate_speech is True
        
    except Exception as e:
        logger.error(f"Error handling chat message: {e}")
        await manager.send_personal_message(json.dumps({
            "type": "error",
            "message": f"Chat error: {str(e)}"
        }), websocket)

async def handle_startup_analysis(message: dict, websocket: WebSocket):
    """Handle startup analysis requests"""
    try:
        # Send progress update
        await manager.send_personal_message(json.dumps({
            "type": "analysis_progress",
            "progress": 10,
            "message": "Starting analysis..."
        }), websocket)
        
        # Extract data from message
        startup_data = {
            "name": message.get("name", ""),
            "description": message.get("description", ""),
            "authors": message.get("authors", ""),
            "technology": message.get("technology", ""),
            "market": message.get("market", ""),
            "team": message.get("team", ""),
            "funding": message.get("funding", ""),
            "impact": message.get("impact", "")
        }
        
        # Combine all text for analysis
        combined_text = f"""
        Startup Name: {startup_data['name']}
        Description: {startup_data['description']}
        Authors: {startup_data['authors']}
        Technology: {startup_data['technology']}
        Market: {startup_data['market']}
        Team: {startup_data['team']}
        Funding: {startup_data['funding']}
        Impact: {startup_data['impact']}
        """
        
        await manager.send_personal_message(json.dumps({
            "type": "analysis_progress",
            "progress": 30,
            "message": "Running AI agents..."
        }), websocket)
        
        # Run the analysis using our orchestrator
        results = run_crewai_analysis(combined_text, startup_data['authors'])
        
        await manager.send_personal_message(json.dumps({
            "type": "analysis_progress",
            "progress": 80,
            "message": "Finalizing results..."
        }), websocket)
        
        # Send final results
        await manager.send_personal_message(json.dumps({
            "type": "startup_analysis_response",
            "analysis": results,
            "timestamp": asyncio.get_event_loop().time()
        }), websocket)
        
    except Exception as e:
        logger.error(f"Error handling startup analysis: {e}")
        await manager.send_personal_message(json.dumps({
            "type": "error",
            "message": f"Analysis error: {str(e)}"
        }), websocket)

async def handle_patent_search(message: dict, websocket: WebSocket):
    """Handle patent search requests"""
    try:
        query = message.get("query", "")
        limit = message.get("limit", 10)
        
        # TODO: Integrate with Logic Mill API
        results = {
            "query": query,
            "patents": [],
            "message": "Patent search functionality will be integrated with Logic Mill API"
        }
        
        await manager.send_personal_message(json.dumps({
            "type": "patent_search_response",
            "results": results,
            "timestamp": asyncio.get_event_loop().time()
        }), websocket)
        
    except Exception as e:
        logger.error(f"Error handling patent search: {e}")
        await manager.send_personal_message(json.dumps({
            "type": "error",
            "message": f"Patent search error: {str(e)}"
        }), websocket)

async def handle_research_gap_analysis(message: dict, websocket: WebSocket):
    """Handle research gap analysis requests"""
    try:
        description = message.get("description", "")
        
        # TODO: Integrate with Logic Mill API for research gap analysis
        results = {
            "description": description,
            "gap_analysis": "Research gap analysis will be integrated with Logic Mill API",
            "recommendations": []
        }
        
        await manager.send_personal_message(json.dumps({
            "type": "research_gap_analysis_response",
            "analysis": results,
            "timestamp": asyncio.get_event_loop().time()
        }), websocket)
        
    except Exception as e:
        logger.error(f"Error handling research gap analysis: {e}")
        await manager.send_personal_message(json.dumps({
            "type": "error",
            "message": f"Research gap analysis error: {str(e)}"
        }), websocket)

async def handle_deep_analysis(message: dict, websocket: WebSocket):
    """Handle deep analysis requests"""
    try:
        text = message.get("text", "")
        
        # Run comprehensive analysis
        results = run_crewai_analysis(text, "")
        
        await manager.send_personal_message(json.dumps({
            "type": "deep_analysis_response",
            "analysis": results,
            "timestamp": asyncio.get_event_loop().time()
        }), websocket)
        
    except Exception as e:
        logger.error(f"Error handling deep analysis: {e}")
        await manager.send_personal_message(json.dumps({
            "type": "error",
            "message": f"Deep analysis error: {str(e)}"
        }), websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
