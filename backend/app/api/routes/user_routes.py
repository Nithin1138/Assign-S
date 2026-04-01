from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.services.user_service import sync_user_service, get_user_service, update_user_service
from app.schemas.user_schema import UserProfileRequest, UserResponse
from app.utils.response import success_response, error_response

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ----------------------------
# POST /users — Sync / Create
# ----------------------------
@router.post("", response_model=UserResponse)
def sync_user(req: UserProfileRequest, db: Session = Depends(get_db)):
    user = sync_user_service(req, db)
    return user


# ----------------------------
# GET /users/{uid}
# ----------------------------
@router.get("/{uid}", response_model=UserResponse)
def get_user(uid: str, db: Session = Depends(get_db)):
    user = get_user_service(uid, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ----------------------------
# PUT /users/{uid}
# ----------------------------
@router.put("/{uid}", response_model=UserResponse)
def update_user(uid: str, req: UserProfileRequest, db: Session = Depends(get_db)):
    user = update_user_service(uid, req, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user