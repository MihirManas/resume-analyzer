import tempfile
import os
import logging
from fastapi import UploadFile

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────
# LAYER 1: MarkItDown (Primary — handles PDF, DOCX, images, etc.)
# ─────────────────────────────────────────────────────────────────────
def _try_markitdown(filepath: str) -> str | None:
    """Attempt extraction using Microsoft MarkItDown."""
    try:
        from markitdown import MarkItDown
        md = MarkItDown()
        result = md.convert(filepath)
        text = (result.text_content or "").strip()
        if len(text) > 50:  # Sanity check — did it actually extract something useful?
            logger.info(f"MarkItDown succeeded: {len(text)} chars extracted.")
            return text
        logger.warning(f"MarkItDown returned too little text ({len(text)} chars). Falling back.")
        return None
    except Exception as e:
        logger.warning(f"MarkItDown failed: {e}. Falling back.")
        return None


# ─────────────────────────────────────────────────────────────────────
# LAYER 2: PyMuPDF (Fallback for PDF files)
# ─────────────────────────────────────────────────────────────────────
def _try_pymupdf(filepath: str) -> str | None:
    """Attempt PDF extraction using PyMuPDF (fitz)."""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(filepath)
        pages = []
        for page_num, page in enumerate(doc):
            text = page.get_text("text")
            if text.strip():
                pages.append(f"## Page {page_num + 1}\n\n{text.strip()}")
        doc.close()

        full_text = "\n\n---\n\n".join(pages)
        if len(full_text) > 50:
            logger.info(f"PyMuPDF succeeded: {len(full_text)} chars extracted.")
            return full_text
        logger.warning(f"PyMuPDF returned too little text ({len(full_text)} chars). Falling back.")
        return None
    except Exception as e:
        logger.warning(f"PyMuPDF failed: {e}. Falling back.")
        return None


# ─────────────────────────────────────────────────────────────────────
# LAYER 3: pdfplumber (Secondary fallback for PDF — better with tables)
# ─────────────────────────────────────────────────────────────────────
def _try_pdfplumber(filepath: str) -> str | None:
    """Attempt PDF extraction using pdfplumber."""
    try:
        import pdfplumber
        pages = []
        with pdfplumber.open(filepath) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text and text.strip():
                    pages.append(f"## Page {i + 1}\n\n{text.strip()}")

        full_text = "\n\n---\n\n".join(pages)
        if len(full_text) > 50:
            logger.info(f"pdfplumber succeeded: {len(full_text)} chars extracted.")
            return full_text
        logger.warning(f"pdfplumber returned too little text ({len(full_text)} chars). Falling back.")
        return None
    except Exception as e:
        logger.warning(f"pdfplumber failed: {e}. Falling back.")
        return None


# ─────────────────────────────────────────────────────────────────────
# LAYER 4: python-docx (Fallback for DOCX files)
# ─────────────────────────────────────────────────────────────────────
def _try_python_docx(filepath: str) -> str | None:
    """Attempt DOCX extraction using python-docx."""
    try:
        from docx import Document
        doc = Document(filepath)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        full_text = "\n\n".join(paragraphs)
        if len(full_text) > 50:
            logger.info(f"python-docx succeeded: {len(full_text)} chars extracted.")
            return full_text
        logger.warning(f"python-docx returned too little text. Falling back.")
        return None
    except Exception as e:
        logger.warning(f"python-docx failed: {e}. Falling back.")
        return None


# ─────────────────────────────────────────────────────────────────────
# MASTER EXTRACTION FUNCTION (with smart fallback chain)
# ─────────────────────────────────────────────────────────────────────
async def extract_markdown_from_upload(upload_file: UploadFile) -> str:
    """
    Robust document-to-markdown extraction with a multi-layer fallback chain.

    Flow:
        Upload → Save temp file → MarkItDown → PyMuPDF → pdfplumber → python-docx → Error

    This ensures PDFs work reliably in production, not just in local development.
    """
    ext = os.path.splitext(upload_file.filename)[1].lower()

    # Save upload to a temp file (all libraries need a filepath)
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        content = await upload_file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # ── LAYER 1: Always try MarkItDown first (works for PDF, DOCX, images) ──
        text = _try_markitdown(tmp_path)
        if text:
            return text

        # ── LAYER 2 & 3: PDF-specific fallbacks ──
        if ext in [".pdf"]:
            text = _try_pymupdf(tmp_path)
            if text:
                return text

            text = _try_pdfplumber(tmp_path)
            if text:
                return text

        # ── LAYER 4: DOCX-specific fallback ──
        if ext in [".docx", ".doc"]:
            text = _try_python_docx(tmp_path)
            if text:
                return text

        # ── ALL LAYERS FAILED ──
        raise Exception(
            f"Could not extract text from '{upload_file.filename}'. "
            f"All extraction methods (MarkItDown, PyMuPDF, pdfplumber, python-docx) failed. "
            f"Please try a different file format (PDF or DOCX recommended)."
        )

    finally:
        # Always clean up the temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
