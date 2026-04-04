from pydantic import BaseModel
from typing import Optional, Dict

class UserProfileRequest(BaseModel):
    uid: str
    email: Optional[str] = None
    displayName: Optional[str] = None
    photoURL: Optional[str] = None
    preferences: Optional[Dict] = None

class UserResponse(BaseModel):
    uid: str
    email: Optional[str]
    displayName: Optional[str]
    preferences: Optional[Dict] = None

    class Config:
        from_attributes = True