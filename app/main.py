import hashlib
import json
import re
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

FORMULA_MARKERS = ("=", "∑", "∫", "→", "λ", "μ", "^", "_")
SYMBOL_OR_NUMBER_PATTERN = re.compile(r"[^A-Za-z\s]")
DIGIT_PATTERN = re.compile(r"\d")


def _open_pdf_or_raise(pdf_path: Path) -> fitz.Document:
    try:
        return fitz.open(pdf_path)
    except (fitz.FileDataError, RuntimeError) as exc:
        raise ValueError("Invalid PDF file") from exc


def _job_dir(job_id: str) -> Path:
    return BASE_STORAGE_PATH / job_id


def extract_text_per_page(job_id: str) -> list[dict[str, str | int]]:
    """
    Extract text from each page of the uploaded PDF for a given job.

    Returns:
        list[dict]: [{"page": 1, "text": "..."}, ...]

    Side effect:
        Saves extraction output to app/storage/{job_id}/pages.json
    """
    job_dir = _job_dir(job_id)
    input_pdf_path = job_dir / "input.pdf"

    if not input_pdf_path.exists():
        raise FileNotFoundError(f"PDF not found for job_id={job_id}")

    pages: list[dict[str, str | int]] = []

    with _open_pdf_or_raise(input_pdf_path) as document:
        for page_number, page in enumerate(document, start=1):
            pages.append({"page": page_number, "text": page.get_text("text")})

    output_json_path = job_dir / "pages.json"
    output_json_path.write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding="utf-8")

    return pages


def _is_likely_formula_line(line: str) -> bool:
    compact = line.strip()
    if not compact:
        return False

    if any(marker in compact for marker in FORMULA_MARKERS):
        return True

    symbol_count = len(SYMBOL_OR_NUMBER_PATTERN.findall(compact))
    digit_count = len(DIGIT_PATTERN.findall(compact))
    ratio = symbol_count / max(len(compact), 1)

    return (symbol_count >= 6 and digit_count >= 2) or ratio >= 0.35


def detect_formulas(pages_text: list[dict[str, str | int]], job_id: str | None = None) -> list[dict[str, str | int]]:
    """
    Detect likely formula lines from extracted page text.

    A line is considered likely formula if it contains common math markers
    (=, ∑, ∫, →, λ, μ, ^, _) or has many symbols/numbers.

    Args:
        pages_text: output of extract_text_per_page().
        job_id: optional; when provided, writes formulas.json under this job folder.

    Returns:
        list[dict]: [{"page": int, "line": str}, ...]
    """
    formulas: list[dict[str, str | int]] = []

    for page_item in pages_text:
        page_number = int(page_item.get("page", 0))
        text = str(page_item.get("text", ""))
        for line in text.splitlines():
            if _is_likely_formula_line(line):
                formulas.append({"page": page_number, "line": line.strip()})

    if job_id:
        formulas_path = _job_dir(job_id) / "formulas.json"
        formulas_path.write_text(json.dumps(formulas, ensure_ascii=False, indent=2), encoding="utf-8")

    return formulas


def extract_images(job_id: str) -> list[dict[str, str | int]]:
    """
    Extract unique embedded images from a PDF and save as PNGs.

    Side effects:
      - Saves images under app/storage/{job_id}/diagrams/page_{n}_{i}.png
      - Saves extraction metadata to app/storage/{job_id}/diagrams.json

    Returns:
      list[dict]: [{"page": <int>, "filename": "diagrams/page_n_i.png"}, ...]
    """
    job_dir = _job_dir(job_id)
    input_pdf_path = job_dir / "input.pdf"

    if not input_pdf_path.exists():
        raise FileNotFoundError(f"PDF not found for job_id={job_id}")

    diagrams_dir = job_dir / "diagrams"
    diagrams_dir.mkdir(parents=True, exist_ok=True)

    seen_hashes: set[str] = set()
    extracted: list[dict[str, str | int]] = []

    with _open_pdf_or_raise(input_pdf_path) as document:
        for page_number, page in enumerate(document, start=1):
            images = page.get_images(full=True)
            for image_index, image in enumerate(images, start=1):
                xref = image[0]
                image_info = document.extract_image(xref)
                image_bytes = image_info.get("image", b"")
                if not image_bytes:
                    continue

                image_hash = hashlib.sha256(image_bytes).hexdigest()
                if image_hash in seen_hashes:
                    continue
                seen_hashes.add(image_hash)

                output_name = f"page_{page_number}_{image_index}.png"
                output_file = diagrams_dir / output_name

                pixmap = fitz.Pixmap(document, xref)
                if pixmap.alpha or pixmap.colorspace is None:
                    pixmap = fitz.Pixmap(fitz.csRGB, pixmap)
                pixmap.save(output_file)

                extracted.append({"page": page_number, "filename": f"diagrams/{output_name}"})

    diagrams_json_path = job_dir / "diagrams.json"
    diagrams_json_path.write_text(json.dumps(extracted, ensure_ascii=False, indent=2), encoding="utf-8")

    return extracted


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Accept a PDF file, run extraction pipeline, and return a generated job_id."""
    content_type = (file.content_type or "").lower()
    filename = (file.filename or "").lower()

    if content_type != "application/pdf" and not filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    job_id = str(uuid.uuid4())
    job_dir = _job_dir(job_id)
    job_dir.mkdir(parents=True, exist_ok=True)

    output_path = job_dir / "input.pdf"

    file_bytes = await file.read()
    output_path.write_bytes(file_bytes)

    try:
        pages_text = extract_text_per_page(job_id)
        detect_formulas(pages_text, job_id=job_id)
        extract_images(job_id)
    except ValueError as exc:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail="Uploaded file was not saved correctly") from exc

    return {"job_id": job_id}
