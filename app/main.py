import json
import shutil
import uuid
from pathlib import Path

import fitz
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


def extract_text_per_page(job_id: str) -> list[dict[str, str | int]]:
    """
    Extract text from each page of the uploaded PDF for a given job.

    Returns:
        list[dict]: [{"page": 1, "text": "..."}, ...]

    Side effect:
        Saves extraction output to app/storage/{job_id}/pages.json
    """
    job_dir = BASE_STORAGE_PATH / job_id
    input_pdf_path = job_dir / "input.pdf"

    if not input_pdf_path.exists():
        raise FileNotFoundError(f"PDF not found for job_id={job_id}")

    pages: list[dict[str, str | int]] = []

    try:
        with fitz.open(input_pdf_path) as document:
            for page_number, page in enumerate(document, start=1):
                pages.append({"page": page_number, "text": page.get_text("text")})
    except fitz.FileDataError as exc:
        raise ValueError("Invalid PDF file") from exc
    except RuntimeError as exc:
        raise ValueError("Invalid PDF file") from exc

    output_json_path = job_dir / "pages.json"
    output_json_path.write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding="utf-8")

    return pages


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Accept a PDF file, persist it, extract page text, and return a generated job_id."""
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

    try:
        extract_text_per_page(job_id)
    except ValueError as exc:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail="Uploaded file was not saved correctly") from exc

    return {"job_id": job_id}
