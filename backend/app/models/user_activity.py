from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base

class UserActivity(Base):
    __tablename__ = "user_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.uid", ondelete="CASCADE"), index=True)
    event_type = Column(String, nullable=False) # e.g., 'document_created', 'ai_generated', 'shared_link'
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
