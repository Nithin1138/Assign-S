from sqlalchemy import Column, Integer, Text, DateTime, JSON, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Text, ForeignKey("users.uid", ondelete="CASCADE"), index=True)
    doc_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), index=True, nullable=True) 
    name = Column(Text)
    topic = Column(Text)
    description = Column(Text)
    sections = Column(JSON)  # Optimized hierarchical structure
    metadata_fields = Column(JSON) # Extracted metadata like student_name etc
    style = Column(JSON) # Margins, font sizes, font family, etc
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    logs = relationship("TemplateLog", back_populates="template", cascade="all, delete-orphan")
    owner = relationship("User")

