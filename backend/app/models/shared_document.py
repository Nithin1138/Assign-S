from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class SharedDocument(Base):
    __tablename__ = "shared_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Text, index=True)  # The user who saved the shared document
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
