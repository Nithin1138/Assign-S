import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.user import User

logger = logging.getLogger(__name__)

_bearer = HTTPBearer(auto_error=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db)
) -> dict:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        uid: str = payload.get("sub")
        if uid is None:
            raise ValueError("JWT token does not contain a subject")
            
        from sqlalchemy import or_
        user = db.query(User).filter(
            User.uid == uid, 
            or_(User.is_deleted == False, User.is_deleted == None)
        ).first()
        if not user:
            raise ValueError("User not found or restricted")
            
        return {
            "uid": user.uid,
            "email": user.email,
            "display_name": user.displayName,
            "photo_url": user.photoURL,
        }
    except JWTError as e:
        logger.warning(f"JWT verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except ValueError as e:
        logger.warning(f"User validation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Unexpected error during token verification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed.",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db)
) -> dict | None:
    if not credentials:
        return None
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        uid: str = payload.get("sub")
        if not uid: return None
        from sqlalchemy import or_
        user = db.query(User).filter(
            User.uid == uid, 
            or_(User.is_deleted == False, User.is_deleted == None)
        ).first()
        if not user: return None
        return {
            "uid": user.uid,
            "email": user.email,
            "display_name": user.displayName,
            "photo_url": user.photoURL,
        }
    except Exception:
        return None
