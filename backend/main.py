from fastapi import FastAPI, File, UploadFile
from backend.utils.pdf_parser import extract_text_from_fileobj
from backend.crew_pipeline import run_pipeline
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')

app = FastAPI(title="Max Planck → Unicorn Analyst")

@app.post("/analyze-paper")
async def analyze_paper(file: UploadFile = File(...), authors: str = ""):
    logging.info("Received paper for analysis")
    
    # Step 1: Extract text from PDF
    text = extract_text_from_fileobj(file.file)
    logging.info(f"Extracted {len(text)} characters from PDF")

    # Step 2: Run full pipeline (calls all agents internally)
    results = run_pipeline(text, authors)

    # Step 3: Return JSON output
    logging.info(f"Returning final Unicorn Potential Score: {results.get('unicorn_potential_score')}")
    return results

@app.get("/")
async def root():
    return {"message": "Welcome to Max Planck Unicorn Analyst API"}
