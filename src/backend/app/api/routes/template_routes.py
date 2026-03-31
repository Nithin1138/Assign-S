from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.services import template_service
from app.schemas.template_schema import TemplateRequest, TemplateResponse

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("", response_model=TemplateResponse)
def save_template(req: TemplateRequest, db: Session = Depends(get_db)):
    return template_service.save_template(db, req)


@router.get("", response_model=List[TemplateResponse])
def get_templates(user_id: str, db: Session = Depends(get_db)):
    return template_service.get_templates(db, user_id)


@router.delete("/{template_id}")
def delete_template(template_id: int, user_id: str, db: Session = Depends(get_db)):
    result = template_service.delete_template(db, template_id, user_id)

    if not result:
        raise HTTPException(status_code=404, detail="Template not found")

    return {"success": True}