from sqlalchemy import Column, Integer, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.core.database import Base
updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Text, index=True)
    title = Column(Text)
    topic = Column(Text)
    description = Column(Text)
    content = Column(Text)
    sections = Column(JSON)
    task_type = Column(Text)
    tone = Column(Text)
    share_code = Column(Text, unique=True, index=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

