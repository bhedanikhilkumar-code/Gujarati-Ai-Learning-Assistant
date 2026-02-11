import hashlib
import json
import re
import shutil
import uuid
import zipfile
from pathlib import Path

import fitz
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

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
SENTENCE_SPLIT_PATTERN = re.compile(r"(?<=[.!?])\s+")
NUMBERED_HEADING_PATTERN = re.compile(r"^\s*(\d+(?:\.\d+)*)[\).:-]?\s+.+$")


def _open_pdf_or_raise(pdf_path: Path) -> fitz.Document:
    try:
        return fitz.open(pdf_path)
    except (fitz.FileDataError, RuntimeError) as exc:
        raise ValueError("Invalid PDF file") from exc


def _job_dir(job_id: str) -> Path:
    return BASE_STORAGE_PATH / job_id


def _read_json_file(path: Path) -> list[dict[str, str | int]]:
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


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


def _is_heading(line: str) -> bool:
    trimmed = line.strip()
    if len(trimmed) < 3:
        return False

    alpha_chars = [c for c in trimmed if c.isalpha()]
    upper_ratio = 0
    if alpha_chars:
        upper_ratio = sum(1 for c in alpha_chars if c.isupper()) / len(alpha_chars)

    is_all_caps = bool(alpha_chars) and upper_ratio >= 0.9 and len(trimmed.split()) <= 12
    ends_with_colon = trimmed.endswith(":") and len(trimmed.split()) <= 14
    is_numbered = bool(NUMBERED_HEADING_PATTERN.match(trimmed))

    return is_all_caps or ends_with_colon or is_numbered


def _line_to_sentences(line: str) -> list[str]:
    parts = SENTENCE_SPLIT_PATTERN.split(line.strip())
    cleaned = [p.strip(" -•\t") for p in parts if p.strip()]
    return [c for c in cleaned if len(c) >= 20]


def generate_notes_outline(pages_text: list[dict[str, str | int]], job_id: str | None = None) -> str:
    """
    Generate a markdown outline from page text.

    Heading detection rules:
      - ALL CAPS lines
      - lines ending with ':'
      - numbered headings (e.g. '1. Intro', '2) Methods')

    Under each heading, adds 3-6 bullet summaries using nearby lines,
    with simple sentence splitting and trimming.
    """
    all_lines: list[tuple[int, str]] = []
    for page in pages_text:
        page_number = int(page.get("page", 0))
        text = str(page.get("text", ""))
        for line in text.splitlines():
            stripped = line.strip()
            if stripped:
                all_lines.append((page_number, stripped))

    heading_indices = [idx for idx, (_, line) in enumerate(all_lines) if _is_heading(line)]

    outline_parts = ["# Notes Outline", ""]

    if not heading_indices:
        outline_parts.append("## Key Points")
        candidates: list[str] = []
        for _, line in all_lines:
            candidates.extend(_line_to_sentences(line))
            if len(candidates) >= 6:
                break
        if not candidates:
            candidates = [line for _, line in all_lines[:6]]
        for sentence in candidates[:6]:
            outline_parts.append(f"- {sentence}")
        outline_parts.append("")
    else:
        for pos, heading_idx in enumerate(heading_indices):
            page_number, heading_text = all_lines[heading_idx]
            next_heading_idx = heading_indices[pos + 1] if pos + 1 < len(heading_indices) else len(all_lines)

            nearby_lines = [line for _, line in all_lines[heading_idx + 1 : next_heading_idx]]
            sentence_pool: list[str] = []
            for line in nearby_lines:
                sentence_pool.extend(_line_to_sentences(line))
                if len(sentence_pool) >= 10:
                    break

            if len(sentence_pool) < 3:
                fallback = [l.strip(" -•\t") for l in nearby_lines if len(l.strip()) >= 10]
                sentence_pool.extend(fallback)

            seen: set[str] = set()
            bullets: list[str] = []
            for sentence in sentence_pool:
                key = sentence.lower()
                if key in seen:
                    continue
                seen.add(key)
                bullets.append(sentence)
                if len(bullets) >= 6:
                    break

            if not bullets:
                bullets = ["No additional summary points detected near this heading."]

            bullets = bullets[: max(3, min(6, len(bullets)))]

            outline_parts.append(f"## {heading_text}")
            outline_parts.append(f"_Page {page_number}_")
            for bullet in bullets:
                outline_parts.append(f"- {bullet}")
            outline_parts.append("")

    outline_markdown = "\n".join(outline_parts).strip() + "\n"

    if job_id:
        notes_path = _job_dir(job_id) / "notes.md"
        notes_path.write_text(outline_markdown, encoding="utf-8")

    return outline_markdown


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


def _write_formulas_markdown(job_dir: Path) -> Path:
    formulas = _read_json_file(job_dir / "formulas.json")
    lines = ["# Formulas", ""]
    if not formulas:
        lines.append("- No formulas detected.")
    else:
        for item in formulas:
            lines.append(f"- Page {item.get('page', '?')}: {item.get('line', '')}")
    output_path = job_dir / "formulas.md"
    output_path.write_text("\n".join(lines).strip() + "\n", encoding="utf-8")
    return output_path


def _write_diagrams_markdown(job_dir: Path) -> Path:
    diagrams = _read_json_file(job_dir / "diagrams.json")
    lines = ["# Diagrams", ""]
    if not diagrams:
        lines.append("- No diagrams extracted.")
    else:
        for item in diagrams:
            lines.append(f"- Page {item.get('page', '?')}: {item.get('filename', '')}")
    output_path = job_dir / "diagrams.md"
    output_path.write_text("\n".join(lines).strip() + "\n", encoding="utf-8")
    return output_path


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
        generate_notes_outline(pages_text, job_id=job_id)
        extract_images(job_id)
    except ValueError as exc:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail="Uploaded file was not saved correctly") from exc

    return {"job_id": job_id}


@app.get("/export/{job_id}")
async def export_job(job_id: str):
    """Zip notes.md, formulas.md, diagrams.md and diagrams/ as export.zip and stream it."""
    job_dir = _job_dir(job_id)
    if not job_dir.exists() or not job_dir.is_dir():
        raise HTTPException(status_code=404, detail="Job not found")

    notes_path = job_dir / "notes.md"
    if not notes_path.exists():
        pages_text = _read_json_file(job_dir / "pages.json")
        if pages_text:
            generate_notes_outline(pages_text, job_id=job_id)

    formulas_md_path = _write_formulas_markdown(job_dir)
    diagrams_md_path = _write_diagrams_markdown(job_dir)

    if not notes_path.exists():
        raise HTTPException(status_code=404, detail="notes.md not found for this job")

    export_zip_path = job_dir / "export.zip"

    with zipfile.ZipFile(export_zip_path, mode="w", compression=zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(notes_path, arcname="notes.md")
        zipf.write(formulas_md_path, arcname="formulas.md")
        zipf.write(diagrams_md_path, arcname="diagrams.md")

        diagrams_dir = job_dir / "diagrams"
        if diagrams_dir.exists() and diagrams_dir.is_dir():
            for file_path in diagrams_dir.rglob("*"):
                if file_path.is_file():
                    zipf.write(file_path, arcname=str(file_path.relative_to(job_dir)))

    return FileResponse(
        path=export_zip_path,
        media_type="application/zip",
        filename="export.zip",
    )
