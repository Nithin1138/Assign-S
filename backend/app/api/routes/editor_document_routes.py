from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.core.database import SessionLocal
from app.core.security import get_current_user
from app.models.editor_document import EditorDocument
from app.utils.response import success_response, error_response

router = APIRouter()

class EditorSaveRequest(BaseModel):
    user_id: str
    title: str = None
    content: str = None
    topic: str = None
    description: str = None
    tone: str = None
    task_type: str = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("")
def save_editor_doc(
    req: EditorSaveRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if req.user_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    
    doc = EditorDocument(
        user_id=req.user_id,
        title=req.title,
        content=req.content,
        topic=req.topic,
        description=req.description,
        tone=req.tone,
        task_type=req.task_type
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return success_response({
        "id": doc.id,
        "title": doc.title,
        "content": doc.content,
        "updated_at": str(doc.updated_at)
    })

@router.get("")
def get_editor_docs(
    user_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    
    docs = db.query(EditorDocument).filter(
        EditorDocument.user_id == user_id,
        EditorDocument.is_deleted == False
    ).order_by(EditorDocument.updated_at.desc()).all()
    
    return success_response([
        {
            "id": d.id,
            "title": d.title,
            "content": d.content,
            "created_at": str(d.created_at) if d.created_at else None,
            "updated_at": str(d.updated_at) if d.updated_at else str(d.created_at),
            "taskType": d.task_type
        } for d in docs
    ])

@router.get("/{doc_id}")
def get_editor_doc(
    doc_id: int,
    user_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    
    doc = db.query(EditorDocument).filter(
        EditorDocument.id == doc_id,
        EditorDocument.user_id == user_id
    ).first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    return success_response({
        "id": doc.id,
        "title": doc.title,
        "content": doc.content,
        "updated_at": str(doc.updated_at),
        "taskType": doc.task_type
    })

@router.put("/{doc_id}")
def update_editor_doc(
    doc_id: int,
    req: EditorSaveRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if req.user_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    
    doc = db.query(EditorDocument).filter(
        EditorDocument.id == doc_id,
        EditorDocument.user_id == req.user_id
    ).first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if req.title is not None:
        doc.title = req.title
    if req.content is not None:
        doc.content = req.content
    if req.topic is not None:
        doc.topic = req.topic
    if req.description is not None:
        doc.description = req.description
    if req.tone is not None:
        doc.tone = req.tone
    if req.task_type is not None:
        doc.task_type = req.task_type
        
    db.commit()
    db.refresh(doc)
    return success_response({"id": doc.id, "title": doc.title})

@router.delete("/{doc_id}")
def delete_editor_doc(
    doc_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    doc = db.query(EditorDocument).filter(
        EditorDocument.id == doc_id,
        EditorDocument.user_id == user["uid"]
    ).first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    doc.is_deleted = True
    db.commit()
    return success_response({"deleted": True})
