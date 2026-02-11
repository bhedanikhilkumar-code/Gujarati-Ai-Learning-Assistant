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
  - Detects likely formula lines from text
  - Saves formulas to: `app/storage/{job_id}/formulas.json`
  - Generates markdown notes outline from headings + nearby summaries
  - Saves notes outline to: `app/storage/{job_id}/notes.md`
  - Extracts unique embedded images via hash dedupe
  - Saves images to: `app/storage/{job_id}/diagrams/page_{n}_{i}.png`
  - Saves image metadata to: `app/storage/{job_id}/diagrams.json`
  - Returns JSON: `{ "job_id": "<uuid>" }`


- `GET /export/{job_id}`
  - Creates and streams `export.zip`
  - Includes:
    - `notes.md`
    - `formulas.md`
    - `diagrams.md`
    - `diagrams/` folder (all extracted image files)

### Helpers

- `extract_text_per_page(job_id)`
  - Reads `app/storage/{job_id}/input.pdf`
  - Returns `[{"page": int, "text": str}, ...]`
  - Raises error for invalid/corrupt PDF files
  - Persists extracted output to `pages.json`

- `detect_formulas(pages_text)`
  - Detects likely formulas from each text line using markers:
    - `=`, `∑`, `∫`, `→`, `λ`, `μ`, `^`, `_`
  - Also flags lines with many symbols/numbers
  - Returns `[{"page": int, "line": str}, ...]`
  - Persists extracted output to `formulas.json`

- `generate_notes_outline(pages_text)`
  - Creates markdown outline using headings from ALL CAPS / ending with `:` / numbered headings
  - Adds 3-6 bullet summaries from nearby text (simple sentence splitting + trimming)
  - Returns markdown string and persists `notes.md`

- `_write_formulas_markdown(job_dir)`
  - Builds `formulas.md` from `formulas.json`

- `_write_diagrams_markdown(job_dir)`
  - Builds `diagrams.md` from `diagrams.json`

- `extract_images(job_id)`
  - Reads `app/storage/{job_id}/input.pdf`
  - Returns `[{"page": int, "filename": str}, ...]`
  - Deduplicates images using SHA-256 hash of image bytes
  - Persists images under `diagrams/` and metadata to `diagrams.json`

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
