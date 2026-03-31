from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.services.user_service import sync_user_service, get_user_service, update_user_service
from app.schemas.user_schema import UserProfileRequest, UserResponse

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("", response_model=UserResponse)
def sync_user(req: UserProfileRequest, db: Session = Depends(get_db)):
    return sync_user_service(req, db)


@router.get("/{uid}", response_model=UserResponse)
def get_user(uid: str, db: Session = Depends(get_db)):
    user = get_user_service(uid, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

@router.put("/{uid}", response_model=UserResponse)
def update_user(uid: str, req: UserProfileRequest, db: Session = Depends(get_db)):
    user = update_user_service(uid, req, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user