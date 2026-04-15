from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

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
from app.models.shared_document import SharedDocument

router = APIRouter()

class AccessUpdateRequest(BaseModel):
    user_id: str
    permission: str

class ShareResponseRequest(BaseModel):
    share_id: int
    status: str # accepted, rejected


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
        
    permission = "owner"
    if doc.user_id != user_id:
        shared = db.query(SharedDocument).filter(
            SharedDocument.document_id == doc_id,
            SharedDocument.user_id == user_id
        ).first()
        permission = shared.permission if shared else "view"
        
    response = DocumentResponse.model_validate(doc).model_dump()
    response["permission"] = permission
    return response


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
    result = document_service.delete_document(db, doc_id, user["uid"])
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

@router.get("/{doc_id}/access")
def get_doc_access(
    doc_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    doc = document_service.get_document(db, doc_id, user["uid"])
    if not doc or doc.user_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Only the owner can view access.")
    access_list = document_service.get_document_access_list(db, doc_id)
    return success_response([{
        "user_id": item.user_id,
        "name": item.receiver.displayName if getattr(item, "receiver", None) else "Unknown User",
        "email": item.receiver.email if getattr(item, "receiver", None) else item.user_id,
        "permission": item.permission,
        "granted_by": item.granted_by
    } for item in access_list])

@router.put("/{doc_id}/access")
def update_doc_access(
    doc_id: int,
    req: AccessUpdateRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    doc = document_service.get_document(db, doc_id, user["uid"])
    if not doc or doc.user_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Only the owner can manage access.")
    
    updated = document_service.update_document_access(db, doc_id, req.user_id, req.permission, granter_uid=user["uid"])
    if updated is None and req.permission != "remove":
        raise HTTPException(status_code=404, detail="User not found with that Mail or ID.")
    return success_response({"message": "Access updated successfully"})

@router.get("/list/pending")
def list_pending_shares(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    pending = document_service.get_pending_shares(db, user["uid"])
    return success_response([{
        "id": item.id,
        "document_id": item.document_id,
        "document_title": item.document.title if item.document else "Unknown Document",
        "owner_id": item.document.user_id if item.document else "Unknown",
        "granter_name": item.granter.displayName if item.granter else "Peer",
        "permission": item.permission,
        "created_at": str(item.created_at)
    } for item in pending])

@router.post("/respond-share")
def respond_share(
    req: ShareResponseRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if req.status not in ["accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be 'accepted' or 'rejected'.")
    
    success = document_service.respond_to_share_request(db, req.share_id, user["uid"], req.status)
    if not success:
        raise HTTPException(status_code=404, detail="Share request not found.")
        
    return success_response({"message": f"Share request {req.status}"})