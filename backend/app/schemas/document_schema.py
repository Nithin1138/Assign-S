from pydantic import BaseModel
from typing import Optional, List, Dict

class Section(BaseModel):
    id: Optional[str] = None
    title: str
    content: str

class SaveRequest(BaseModel):
    user_id: str
    title: Optional[str] = None
    topic: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    sections: Optional[List[Section]] = None
    task_type: str = "generate"
    tone: str = "neutral"
    status: Optional[str] = "draft"
    page_settings: Optional[Dict] = None
    is_manual_save: Optional[bool] = False
    version_name: Optional[str] = None

from datetime import datetime

class DocumentResponse(BaseModel):
    id: int
    user_id: str
    title: Optional[str]
    topic: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    sections: Optional[list] = None
    task_type: Optional[str] = None
    tone: Optional[str] = None
    status: Optional[str] = "draft"
    page_settings: Optional[Dict] = None
    share_code: Optional[str] = None
    permission: Optional[str] = "owner"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AIRequest(BaseModel):
    prompt: str

class AIResponse(BaseModel):
    content: str

class VersionRequest(BaseModel):
    content: str

class DocumentVersionResponse(BaseModel):
    id: int
    document_id: int
    content: Optional[str] = None
    name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True