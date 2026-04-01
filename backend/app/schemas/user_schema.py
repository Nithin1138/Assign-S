from pydantic import BaseModel
from typing import Optional, Dict

class UserProfileRequest(BaseModel):
    uid: str
    email: Optional[str] = None
    displayName: Optional[str] = None
    photoURL: Optional[str] = None
    preferences: Optional[Dict[str, str]] = None

class UserResponse(BaseModel):
    uid: str
    email: Optional[str]
    displayName: Optional[str]

    class Config:
        from_attributes = True