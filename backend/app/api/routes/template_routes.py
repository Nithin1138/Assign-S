from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import get_current_user
from app.services import template_service
from app.schemas.template_schema import TemplateRequest, TemplateResponse
from app.utils.response import success_response

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ----------------------------
# POST /templates — Create
# ----------------------------
@router.post("")
def save_template(
    req: TemplateRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if req.user_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    template = template_service.save_template(db, req)
    return JSONResponse(status_code=201, content=success_response(
        {
            "id": template.id,
            "user_id": template.user_id,
            "name": template.name,
            "sections": template.sections,
            "topic": template.topic,
            "description": template.description,
            "metadata_fields": template.metadata_fields,
            "style": template.style,
            "created_at": str(template.created_at),
            "updated_at": str(template.updated_at),
        }
    ))


# ----------------------------
# GET /templates — List
# ----------------------------
@router.get("", response_model=List[TemplateResponse])
def get_templates(
    user_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    return template_service.get_templates(db, user_id)


# ----------------------------
# DELETE /templates/{id}
# ----------------------------
@router.delete("/{template_id}")
def delete_template(
    template_id: int,
    user_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Access denied.")
    result = template_service.delete_template(db, template_id, user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Template not found")
    return JSONResponse(status_code=200, content=success_response({"deleted": True}))