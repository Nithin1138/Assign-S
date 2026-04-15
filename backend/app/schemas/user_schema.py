from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, List

class UserProfileRequest(BaseModel):
    uid: str
    email: Optional[str] = None
    displayName: Optional[str] = None
    photoURL: Optional[str] = None
    custom_id: Optional[str] = None
    institution: Optional[str] = None
    fieldOfStudy: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    socialLinks: Optional[Dict] = None
    weeklyGoal: Optional[int] = None
    preferences: Optional[Dict] = None

class UserResponse(BaseModel):
    uid: str
    email: Optional[str]
    displayName: Optional[str]
    photoURL: Optional[str] = None
    custom_id: Optional[str] = None
    custom_id_updated_at: Optional[datetime] = None
    institution: Optional[str] = None
    fieldOfStudy: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    socialLinks: Optional[Dict] = None
    weeklyGoal: Optional[int] = None
    preferences: Optional[Dict] = None

    class Config:
        from_attributes = True