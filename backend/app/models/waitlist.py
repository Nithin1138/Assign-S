from sqlalchemy import Column, Text, DateTime, Integer
from sqlalchemy.sql import func
from app.core.database import Base

class WaitlistUser(Base):
    __tablename__ = "waitlist_users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(Text, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
