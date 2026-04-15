from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class SharedDocument(Base):
    __tablename__ = "shared_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Text, ForeignKey("users.uid", ondelete="CASCADE"), index=True) # Receiver
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), index=True)
    granted_by = Column(Text, ForeignKey("users.uid"), nullable=True) # Giver
    permission = Column(Text, default="view") # view, edit
    status = Column(Text, default="pending") # pending, accepted, rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    document = relationship("Document")
    receiver = relationship("User", foreign_keys=[user_id])
    granter = relationship("User", foreign_keys=[granted_by])
