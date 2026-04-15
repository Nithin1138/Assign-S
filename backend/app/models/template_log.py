from sqlalchemy import Column, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class TemplateLog(Base):
    __tablename__ = "template_logs"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates.id", ondelete="CASCADE"), index=True)
    raw_data = Column(JSON, nullable=True) # Analysis log from heuristic parse
    ai_output = Column(JSON, nullable=True) # Analysis log from Gemini parse
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    template = relationship("Template", back_populates="logs")
