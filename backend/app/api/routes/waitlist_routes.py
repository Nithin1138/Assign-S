from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.waitlist import WaitlistUser
from app.schemas.waitlist import WaitlistCreate, WaitlistUserResponse
from sqlalchemy.exc import IntegrityError

router = APIRouter()

@router.post("/join", response_model=WaitlistUserResponse)
def join_waitlist(data: WaitlistCreate, db: Session = Depends(get_db)):
    try:
        new_user = WaitlistUser(email=data.email)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except IntegrityError:
        db.rollback()
        # If email already exists, just return the existing one or a success message
        existing_user = db.query(WaitlistUser).filter(WaitlistUser.email == data.email).first()
        return existing_user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not join waitlist: {str(e)}"
        )
