from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
from datetime import datetime, timedelta
from jose import jwt, JWTError

from app.core.database import SessionLocal
from app.models.user import User
from app.core.config import settings
from app.utils.response import success_response, error_response

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter()

@router.get("/check_db")
def check_db(db: Session = Depends(get_db)):
    from sqlalchemy import inspect
    inspector = inspect(db.get_bind())
    cols = [col['name'] for col in inspector.get_columns('users')]
    return {"columns": cols}

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week

class EmailLoginRequest(BaseModel):
    email: str
    password: str

class GoogleLoginRequest(BaseModel):
    token: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    display_name: str = ""

import bcrypt

def verify_password(plain_password, hashed_password):
    if not hashed_password:
        return False
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == req.email, or_(User.is_deleted == False, User.is_deleted == None)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    import uuid
    new_uid = str(uuid.uuid4())
    if len(req.password) > 72:
        raise HTTPException(status_code=400, detail="Password must be less than 72 characters")
        
    hashed_password = get_password_hash(req.password[:72])
    
    new_user = User(
        uid=new_uid,
        email=req.email,
        hashed_password=hashed_password,
        displayName=req.display_name,
        photoURL="",
        preferences={"theme": "system", "default_view": "list", "editor_font": "inter"}
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.uid})
    return {"access_token": access_token, "token_type": "bearer", "user": {"uid": new_user.uid, "email": new_user.email, "displayName": new_user.displayName}}

@router.post("/login")
def login(req: EmailLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email, or_(User.is_deleted == False, User.is_deleted == None)).first()
    if len(req.password) > 72:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if not user or not verify_password(req.password[:72], user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    access_token = create_access_token(data={"sub": user.uid})
    return {"access_token": access_token, "token_type": "bearer", "user": {"uid": user.uid, "email": user.email, "displayName": user.displayName}}

@router.post("/google")
def google_login(req: GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        import requests as net_requests
        resp = net_requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {req.token}"}
        )
        if resp.status_code != 200:
            raise ValueError(f"Failed to fetch user info: {resp.text}")
            
        idinfo = resp.json()
        
        email = idinfo.get("email")
        if not email:
            raise ValueError("Google account does not have an email associated")
            
        # Check if user exists
        user = db.query(User).filter(User.email == email, or_(User.is_deleted == False, User.is_deleted == None)).first()
        
        if not user:
            # We must import uuid here to avoid early evaluation causing issues if not imported
            import uuid
            # Keep all present users by matching email, but if really new, create.
            new_uid = str(uuid.uuid4())
            user = User(
                uid=new_uid,
                email=email,
                displayName=idinfo.get("name", ""),
                photoURL=idinfo.get("picture", ""),
                preferences={"theme": "system", "default_view": "list", "editor_font": "inter"}
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
        access_token = create_access_token(data={"sub": user.uid})
        return {"access_token": access_token, "token_type": "bearer", "user": {"uid": user.uid, "email": user.email, "displayName": user.displayName}}
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
