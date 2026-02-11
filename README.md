# Student Notes Sharing Platform

## FastAPI Upload Backend

This repository now includes a FastAPI backend entrypoint at:

- `app/main.py`

### Endpoint

- `POST /upload`
  - Accepts multipart form-data with a single file field: `file`
  - Only PDF files are allowed
  - Saves upload to: `app/storage/{job_id}/input.pdf`
  - Returns JSON: `{ "job_id": "<uuid>" }`

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
