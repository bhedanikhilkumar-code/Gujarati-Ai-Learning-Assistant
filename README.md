# Student Notes Sharing Platform

## FastAPI Upload Backend

This repository includes a FastAPI backend entrypoint at:

- `app/main.py`

### Endpoint

- `POST /upload`
  - Accepts multipart form-data with a single file field: `file`
  - Only PDF files are allowed
  - Saves upload to: `app/storage/{job_id}/input.pdf`
  - Extracts text page-by-page via PyMuPDF
  - Saves extracted text to: `app/storage/{job_id}/pages.json`
  - Returns JSON: `{ "job_id": "<uuid>" }`

### Text extraction helper

- `extract_text_per_page(job_id)`
  - Reads `app/storage/{job_id}/input.pdf`
  - Returns `[{"page": int, "text": str}, ...]`
  - Raises error for invalid/corrupt PDF files
  - Persists extracted output to `pages.json`

### CORS

CORS is configured to allow requests from:

- `http://localhost:3000`

### Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
