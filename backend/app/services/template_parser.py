"""
template_parser.py — Pure backend template parsing / structure extraction.

Responsibility:
  - Receive raw text extracted from a template document
  - Identify headings, sections, metadata fields
  - Return a structured dict: { title, sections, metadata, style }

Rules:
  - NO AI calls
  - NO database access
  - Pure text processing only
"""

import re
from typing import Optional


# --------------------------------------------------
# HEADING PATTERNS
# --------------------------------------------------
_HEADING_PATTERNS = [
    re.compile(r"^#{1,3}\s+(.+)$", re.MULTILINE),          # Markdown ##
    re.compile(r"^([A-Z][A-Z\s]{2,}):?\s*$", re.MULTILINE), # ALL CAPS HEADING
    re.compile(r"^\d+[\.\)]\s+([A-Z].+)$", re.MULTILINE),  # 1. Numbered
    re.compile(r"^[A-Z][a-zA-Z\s]{3,}:\s*$", re.MULTILINE), # Title Case:
]

_METADATA_LABELS = {
    "student_name": ["name", "student name", "student"],
    "registration_number": ["reg no", "reg number", "registration", "roll no", "id"],
    "course": ["course", "subject", "paper"],
    "institution": ["college", "university", "institution", "campus"],
    "date": ["date", "submitted on"],
    "faculty": ["faculty", "department", "school"],
}


def _detect_headings(text: str) -> list[dict]:
    """Extract headings from raw text, returning ordered list with level."""
    headings = []
    seen = set()

    for line_no, line in enumerate(text.splitlines()):
        stripped = line.strip()
        if not stripped or len(stripped) < 2:
            continue

        level = None

        # Markdown heading
        md = re.match(r"^(#{1,3})\s+(.+)$", stripped)
        if md:
            level = len(md.group(1))
            title = md.group(2).strip(" #")
        elif re.match(r"^[A-Z][A-Z\s]{4,}$", stripped):
            # ALL CAPS — treat as H1
            level = 1
            title = stripped.title()
        elif re.match(r"^\d+[\.\)]\s+([A-Z].+)$", stripped):
            m = re.match(r"^\d+[\.\)]\s+(.+)$", stripped)
            level = 2
            title = m.group(1) if m else stripped
        elif re.match(r"^[A-Z][a-zA-Z ]{3,}:?\s*$", stripped) and len(stripped) < 60:
            level = 2
            title = stripped.rstrip(":")

        if level and title and title.lower() not in seen:
            seen.add(title.lower())
            headings.append({
                "title": title,
                "level": level,
                "line": line_no,
                "subsections": []
            })

    return headings


def _build_hierarchy(flat: list[dict]) -> list[dict]:
    """Convert flat heading list into nested section tree."""
    root = []
    stack = []  # [(level, node)]

    for node in flat:
        entry = {
            "title": node["title"],
            "level": node["level"],
            "subsections": []
        }

        while stack and stack[-1][0] >= node["level"]:
            stack.pop()

        if stack:
            stack[-1][1]["subsections"].append(entry)
        else:
            root.append(entry)

        stack.append((node["level"], entry))

    return root


def _extract_metadata(text: str) -> dict:
    """Try to pull common academic metadata fields from the text."""
    meta = {k: None for k in _METADATA_LABELS}
    lower = text.lower()

    for field, patterns in _METADATA_LABELS.items():
        for pat in patterns:
            # Match  "Field : Value" or "Field: Value" on same line
            m = re.search(
                rf"{re.escape(pat)}\s*[:\-–]\s*([^\n]{{1,80}})",
                lower
            )
            if m:
                raw_val = text[m.start(1):m.end(1)].strip()
                if raw_val and len(raw_val) > 1:
                    meta[field] = raw_val
                break

    return meta


def _extract_style_hints(text: str) -> dict:
    """
    Best-effort style guessing from raw text.
    (Real style extraction happens on the frontend via PDF/DOCX readers.)
    """
    return {
        "font_family": None,
        "heading_font_size": None,
        "body_font_size": None,
        "alignment": None,
        "line_spacing": None,
        "margins": None,
    }


def extract_structure(text: str, title_hint: Optional[str] = None) -> dict:
    """
    Main entry point for template parsing.

    Args:
        text: Raw plain text from an uploaded template.
        title_hint: Optional title if already known.

    Returns:
        {
          "title": str,
          "sections": [...],
          "metadata": {...},
          "style": {...}
        }
    """
    if not text or not text.strip():
        return {
            "title": title_hint or "Untitled",
            "sections": [],
            "metadata": {},
            "style": {}
        }

    flat_headings = _detect_headings(text)
    hierarchy = _build_hierarchy(flat_headings)
    metadata = _extract_metadata(text)
    style = _extract_style_hints(text)

    # Infer title: first H1, or first line, or hint
    title = title_hint
    if not title:
        if hierarchy:
            title = hierarchy[0]["title"]
        else:
            first_line = text.strip().splitlines()[0].strip(" #").strip()
            title = first_line if first_line else "Untitled"

    return {
        "title": title,
        "sections": hierarchy,
        "metadata": metadata,
        "style": style,
        "raw_text": text,
    }
