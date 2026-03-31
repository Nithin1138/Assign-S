from pydantic import BaseModel
from typing import Optional, List, Dict

class Section(BaseModel):
    heading: str
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
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AIRequest(BaseModel):
    prompt: str

class AIResponse(BaseModel):
    content: str