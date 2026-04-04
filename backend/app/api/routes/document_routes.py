from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List

from app.core.database import SessionLocal
from app.core.security import get_current_user
from app.schemas.document_schema import (
    SaveRequest,
    DocumentResponse,
    AIRequest,
    AIResponse,
)
from app.services import document_service
from app.utils.response import success_response, error_response

router = APIRouter()


# ----------------------------
# DB Dependency
# ----------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ----------------------------
# POST /documents — Create
# ----------------------------
@router.post("")
def save_doc(
    req: SaveRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # Enforce that the user_id in the request matches the authenticated user
    if req.user_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Cannot create documents for another user.")
    doc = document_service.save_document(db, req)
    return JSONResponse(status_code=201, content=success_response(
        {
            "id": doc.id,
            "user_id": doc.user_id,
            "title": doc.title,
            "topic": doc.topic,
            "description": doc.description,
            "content": doc.content,
            "sections": doc.sections,
            "task_type": doc.task_type,
            "tone": doc.tone,
            "share_code": doc.share_code,
            "created_at": str(doc.created_at),
            "updated_at": str(doc.updated_at),
        }
    ))


# ----------------------------
# GET /documents — List
# ----------------------------
@router.get("", response_model=List[DocumentResponse])
def get_docs(
    user_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    return document_service.get_documents(db, user_id)


# ----------------------------
# GET /documents/{id} — Single
# ----------------------------
@router.get("/{doc_id}", response_model=DocumentResponse)
def get_doc(
    doc_id: int,
    user_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    doc = document_service.get_document(db, doc_id, user_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


# ----------------------------
# PUT /documents/{id} — Update
# ----------------------------
@router.put("/{doc_id}", response_model=DocumentResponse)
def update_doc(
    doc_id: int,
    req: SaveRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if req.user_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    updated = document_service.update_document(db, doc_id, req)
    if not updated:
        raise HTTPException(status_code=404, detail="Document not found")
    return updated


# ----------------------------
# DELETE /documents/{id}
# ----------------------------
@router.delete("/{doc_id}")
def delete_doc(
    doc_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    result = document_service.delete_document(db, doc_id)
    if not result:
        raise HTTPException(status_code=404, detail="Document not found")
    return JSONResponse(status_code=200, content=success_response({"deleted": True}))


# ----------------------------
# POST /documents/ai — AI Generate
# ----------------------------
@router.post("/ai", response_model=AIResponse)
async def ai_handler(
    req: AIRequest,
    user=Depends(get_current_user),
):
    result = await document_service.generate_ai(req.prompt)
    return {"content": result}


# ----------------------------
# SHARING OPERATIONS
# ----------------------------

@router.post("/{doc_id}/share")
def share_document(
    doc_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    code = document_service.generate_share_code(db, doc_id, user["uid"])
    if not code:
        raise HTTPException(status_code=404, detail="Document not found")
    return success_response({"share_code": code})


@router.get("/share/{code}")
def get_document_by_code(
    code: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    doc = document_service.get_document_by_code(db, code)
    if not doc:
        raise HTTPException(status_code=404, detail="Shared document not found")
    return {
        "id": doc.id,
        "title": doc.title,
        "topic": doc.topic,
        "description": doc.description,
        "content": doc.content,
        "sections": doc.sections,
        "task_type": doc.task_type,
        "tone": doc.tone,
        "share_code": doc.share_code,
        "created_at": str(doc.created_at),
    }


@router.post("/save-shared/{code}")
def save_shared_document(
    code: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    doc = document_service.get_document_by_code(db, code)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    document_service.save_shared_document(db, user["uid"], doc.id)
    return success_response({"message": "Document saved to shared list"})


@router.get("/list/shared", response_model=List[DocumentResponse])
def get_shared_docs(
    user_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    return document_service.get_shared_documents(db, user_id)