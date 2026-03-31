from sqlalchemy import Column, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    uid = Column(Text, primary_key=True)
    email = Column(Text)
    displayName = Column(Text)
    photoURL = Column(Text)
    preferences = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())