from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class WaitlistCreate(BaseModel):
    email: EmailStr

class WaitlistUserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True
