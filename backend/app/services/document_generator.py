"""
document_generator.py — Document formatting and final output assembly.

Responsibility:
  - Receive structured AI output + template structure
  - Format / combine sections into a final document string
  - Apply heading hierarchy, metadata headers, academic formatting rules

Rules:
  - NO direct AI calls (receives pre-generated text)
  - NO database access
  - Pure transformation: structured data → formatted document string
"""

from typing import Optional


# --------------------------------------------------
# METADATA HEADER BUILDER
# --------------------------------------------------
def _build_metadata_block(metadata: dict) -> str:
    """Render academic metadata as a formatted header block."""
    lines = []
    field_labels = {
        "student_name": "Name",
        "registration_number": "Reg No",
        "course": "Course",
        "institution": "Institution",
        "faculty": "Faculty",
        "date": "Date",
    }

    for field, label in field_labels.items():
        val = metadata.get(field)
        if val:
            lines.append(f"**{label}:** {val}")

    return "\n".join(lines) if lines else ""


# --------------------------------------------------
# SECTION FORMATTER
# --------------------------------------------------
def _section_header(title: str, level: int) -> str:
    """Convert a section title + level to a markdown heading."""
    hashes = "#" * max(1, min(level + 1, 4))  # H2–H4 for sections
    return f"{hashes} {title}"


def _flatten_sections(sections: list, depth: int = 0) -> list[tuple[str, int]]:
    """Flatten nested section tree into [(title, level)] pairs."""
    flat = []
    for s in sections:
        flat.append((s.get("title", "Section"), s.get("level", 1)))
        if s.get("subsections"):
            flat.extend(_flatten_sections(s["subsections"], depth + 1))
    return flat


# --------------------------------------------------
# MAIN GENERATOR
# --------------------------------------------------
def generate_document(
    ai_output: str,
    sections: Optional[list] = None,
    metadata: Optional[dict] = None,
    title: Optional[str] = None,
) -> str:
    """
    Assemble a final formatted document string.

    Args:
        ai_output:  The raw text returned by the AI service.
        sections:   Optional section structure [{ title, level, subsections }].
        metadata:   Optional academic metadata dict.
        title:      Document title.

    Returns:
        A formatted markdown string ready to be stored / served.
    """
    parts = []

    # 1. Document title
    if title:
        parts.append(f"# {title}\n")

    # 2. Metadata header block
    if metadata:
        meta_block = _build_metadata_block(metadata)
        if meta_block:
            parts.append(meta_block + "\n")
            parts.append("---\n")

    # 3. Main AI-generated content
    # If the AI already wrote well-structured output, use it as-is.
    # In future iterations this could intelligently merge sections.
    if ai_output and ai_output.strip():
        parts.append(ai_output.strip())

    return "\n\n".join(parts)


def generate_section_outline(sections: list) -> str:
    """
    Produce a pure markdown heading outline from a section list.
    Useful for scaffolding before AI fills content.
    """
    flat = _flatten_sections(sections)
    lines = []
    for title, level in flat:
        lines.append(_section_header(title, level))
        lines.append("")  # blank line after each heading
    return "\n".join(lines)
