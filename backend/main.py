# backend/main.py
from fastapi import FastAPI, Request, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO
import logging
# Configure logging first
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to import CrewAI orchestrator, fallback to simple orchestrator
try:
    from backend.crewai_orchestrator import run_crewai_analysis
    ORCHESTRATOR_TYPE = "crewai"
    logger.info("Using CrewAI orchestrator")
except Exception as e:
    logger.warning(f"CrewAI orchestrator not available: {e}")
    try:
        from backend.simple_orchestrator import run_simple_analysis as run_crewai_analysis
        ORCHESTRATOR_TYPE = "simple"
        logger.info("Using simple orchestrator")
    except Exception as e2:
        logger.error(f"Both orchestrators failed: {e2}")
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
