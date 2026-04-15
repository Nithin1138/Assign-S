from sqlalchemy import Column, Text, DateTime, JSON, Boolean, Integer
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    uid = Column(Text, primary_key=True, index=True)
    email = Column(Text, unique=True, index=True)
    displayName = Column(Text)
    photoURL = Column(Text)
    hashed_password = Column(Text, nullable=True)
    custom_id = Column(Text, unique=True, index=True, nullable=True)
    custom_id_updated_at = Column(DateTime(timezone=True), nullable=True)
    institution = Column(Text, nullable=True)
    fieldOfStudy = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    skills = Column(JSON, nullable=True)
    socialLinks = Column(JSON, nullable=True)
    weeklyGoal = Column(Integer, default=0)
    preferences = Column(JSON)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())