# backend/main.py
from fastapi import FastAPI, Request, UploadFile, File
from fastapi.responses import JSONResponse
from io import BytesIO
from backend.crew_pipeline import run_pipeline
from backend.utils.pdf_utils import extract_text_from_pdf

app = FastAPI()


@app.post("/analyze-paper")
async def analyze_paper(file: UploadFile = File(None), request: Request = None):
    """
    Handles PDF uploads or raw text JSON input.
    If a PDF is uploaded, extracts text safely with pdf_utils.
    If JSON is sent, uses 'text' field directly.
    """
    try:
        if file:
            # PDF upload: extract text safely
            paper_bytes = await file.read()
            paper_text = extract_text_from_pdf(BytesIO(paper_bytes))
            authors = []  # Could extend to read authors from JSON if sent separately
            agents_to_run = None
        elif request:
            # JSON input: use provided text
            data = await request.json()
            paper_text = data.get("text", "")
            authors = data.get("authors", [])
            agents_to_run = data.get("agents_to_run", None)
        else:
            return JSONResponse(status_code=400, content={"error": "No input provided"})

        # Run pipeline safely
        results = run_pipeline(paper_text, authors, agents_to_run)
        return JSONResponse(content=results)

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Pipeline failed: {str(e)}"}
        )
