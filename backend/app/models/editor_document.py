from sqlalchemy import Column, Integer, Text, DateTime, JSON, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class EditorDocument(Base):
    __tablename__ = "editor_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Text, ForeignKey("users.uid", ondelete="CASCADE"), index=True)
    title = Column(Text)
    topic = Column(Text)
    description = Column(Text)
    content = Column(Text)
    sections = Column(JSON)
    task_type = Column(Text)
    tone = Column(Text)
    status = Column(Text, default="draft") 
    share_code = Column(Text, unique=True, index=True, nullable=True)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User")
