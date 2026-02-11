import uuid
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="PDF Upload API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_STORAGE_PATH = Path(__file__).resolve().parent / "storage"
BASE_STORAGE_PATH.mkdir(parents=True, exist_ok=True)


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Accept a PDF file, persist it, and return a generated job_id."""
    content_type = (file.content_type or "").lower()
    filename = (file.filename or "").lower()

    if content_type != "application/pdf" and not filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    job_id = str(uuid.uuid4())
    job_dir = BASE_STORAGE_PATH / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    output_path = job_dir / "input.pdf"

    file_bytes = await file.read()
    output_path.write_bytes(file_bytes)

    return {"job_id": job_id}
