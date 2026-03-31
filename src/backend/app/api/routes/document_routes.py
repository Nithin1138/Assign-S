from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import SessionLocal
from app.schemas.document_schema import (
    SaveRequest,
    DocumentResponse,
    AIRequest,
    AIResponse,
)
from app.services import document_service

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
# Routes
# ----------------------------

@router.post("", response_model=DocumentResponse)
def save_doc(req: SaveRequest, db: Session = Depends(get_db)):
    return document_service.save_document(db, req)


@router.get("", response_model=List[DocumentResponse])
def get_docs(user_id: str, db: Session = Depends(get_db)):
    return document_service.get_documents(db, user_id)


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_doc(doc_id: int, user_id: str, db: Session = Depends(get_db)):
    doc = document_service.get_document(db, doc_id, user_id)

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return doc


@router.put("/{doc_id}", response_model=DocumentResponse)
def update_doc(doc_id: int, req: SaveRequest, db: Session = Depends(get_db)):
    updated = document_service.update_document(db, doc_id, req)

    if not updated:
        raise HTTPException(status_code=404, detail="Document not found")

    return updated


@router.delete("/{doc_id}")
def delete_doc(doc_id: int, db: Session = Depends(get_db)):
    result = document_service.delete_document(db, doc_id)

    if not result:
        raise HTTPException(status_code=404, detail="Document not found")

    return {"success": True}


@router.post("/ai", response_model=AIResponse)
def ai_handler(req: AIRequest):
    result = document_service.generate_ai(req.prompt)
    return {"content": result}