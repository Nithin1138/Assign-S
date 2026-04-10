from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class TemplateRequest(BaseModel):
    user_id: str
    doc_id: Optional[int] = None
    name: str
    topic: Optional[str] = None
    description: Optional[str] = None
    sections: Optional[List[Any]] = None
    metadata_fields: Optional[Dict[str, Any]] = None
    style: Optional[Dict[str, Any]] = None
    extraction_details: Optional[Dict[str, Any]] = None

from datetime import datetime

class TemplateResponse(BaseModel):
    id: int
    name: str
    user_id: str
    doc_id: Optional[int] = None
    topic: Optional[str] = None
    description: Optional[str] = None
    sections: Optional[List[Any]] = None
    metadata_fields: Optional[Dict[str, Any]] = None
    style: Optional[Dict[str, Any]] = None
    extraction_details: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True