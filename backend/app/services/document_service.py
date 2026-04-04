"""
document_service.py — Orchestrator for document operations.

Responsibility:
  - Coordinate between AI, parser, generator, and repository layers
  - No raw AI calls, no parsing logic, no DB queries

Flow for AI generation:
  1. ai_service.generate_assignment(prompt) → raw AI text
  2. template_parser.extract_structure(text) → structured data  [optional]
  3. document_generator.generate_document(...)  → final string   [optional]
  4. document_repo.create_document(db, req) → persisted record
"""

import uuid
from app.repositories import document_repo
from app.services.ai_service import generate_assignment
from app.services.template_parser import extract_structure
from app.services.document_generator import generate_document, generate_section_outline


# --------------------------------------------------
# CRUD OPERATIONS (DB layer)
# --------------------------------------------------

def save_document(db, req):
    return document_repo.create_document(db, req)


def get_documents(db, user_id):
    return document_repo.get_documents_by_user(db, user_id)


def get_document(db, doc_id, user_id):
    return document_repo.get_document(db, doc_id, user_id)


def update_document(db, doc_id, req):
    doc = document_repo.get_document(db, doc_id, req.user_id)
    if not doc:
        return None
    return document_repo.update_document(db, doc, req)


def delete_document(db, doc_id):
    doc = document_repo.get_document(db, doc_id, None)
    if not doc:
        return None
    document_repo.delete_document(db, doc)
    return True


# --------------------------------------------------
# AI GENERATION (Orchestrated flow)
# --------------------------------------------------

async def generate_ai(prompt: str) -> str:
    """
    Entry point used by the /documents/ai route.
    Delegates entirely to the AI service — no parsing needed here
    since the frontend handles template extraction and prompt building.
    """
    return await generate_assignment(prompt)


async def generate_ai_with_template(
    prompt: str,
    template_text: str = "",
    sections: list = None,
    metadata: dict = None,
    title: str = "",
) -> str:
    """
    Full pipeline: AI → parse template context → assemble document.
    """
    # Step 1: Generate raw content from AI (non-blocking)
    ai_output = await generate_assignment(prompt)

    # Step 2: Optional — parse template structure from uploaded text
    parsed = {}
    if template_text:
        parsed = extract_structure(template_text, title_hint=title)

    # Step 3: Assemble final document
    final = generate_document(
        ai_output=ai_output,
        sections=sections or parsed.get("sections", []),
        metadata=metadata or parsed.get("metadata", {}),
        title=title or parsed.get("title", ""),
    )

    return final


def parse_template_text(text: str, title: str = "") -> dict:
    """
    Expose backend template parsing for future API endpoints.
    Returns structured template data without any AI call.
    """
    return extract_structure(text, title_hint=title)


def get_section_outline(sections: list) -> str:
    """
    Generate a plain markdown heading outline from a section list.
    """
    return generate_section_outline(sections)


# --------------------------------------------------
# SHARED DOCUMENT OPERATIONS
# --------------------------------------------------

def generate_share_code(db, doc_id: int, user_id: str):
    doc = document_repo.get_document(db, doc_id, user_id)
    if not doc:
        return None
    
    # If already has a code, return it
    if doc.share_code:
        return doc.share_code
        
    # Generate new code
    new_code = str(uuid.uuid4())[:8].upper()
    document_repo.update_document(db, doc, {"share_code": new_code})
    return new_code

def get_document_by_code(db, code: str):
    return document_repo.get_document_by_share_code(db, code)

def save_shared_document(db, user_id: str, doc_id: int):
    return document_repo.add_shared_document(db, user_id, doc_id)

def get_shared_documents(db, user_id: str):
    return document_repo.get_shared_documents_by_user(db, user_id)