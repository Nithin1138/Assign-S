from sqlalchemy import Column, Integer, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Text, index=True)
    doc_id = Column(Integer, index=True, nullable=True) # ID of the document this template was extracted from
    name = Column(Text)
    topic = Column(Text)
    description = Column(Text)
    sections = Column(JSON)  # Optimized hierarchical structure
    metadata_fields = Column(JSON) # Extracted metadata like student_name etc
    style = Column(JSON) # Margins, font sizes, font family, etc
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

