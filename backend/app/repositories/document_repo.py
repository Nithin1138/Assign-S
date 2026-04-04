from app.models.document import Document
from app.models.shared_document import SharedDocument

def create_document(db, data):
    if hasattr(data, "model_dump"):
        data = data.model_dump(exclude_unset=True)
    elif hasattr(data, "dict"):
        data = data.dict(exclude_unset=True)
    doc = Document(**data)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def get_documents_by_user(db, user_id):
    return db.query(Document).filter(Document.user_id == user_id).all()


def get_document(db, doc_id, user_id):
    # If user_id is provided, filter by it. If None, skip (used for shared docs)
    query = db.query(Document).filter(Document.id == doc_id)
    if user_id:
        query = query.filter(Document.user_id == user_id)
    return query.first()


def update_document(db, doc, data):
    if hasattr(data, "model_dump"):
        data = data.model_dump(exclude_unset=True)
    elif hasattr(data, "dict"):
        data = data.dict(exclude_unset=True)
    for key, value in data.items():
        if value is not None:
            setattr(doc, key, value)

    db.commit()
    db.refresh(doc)
    return doc


def delete_document(db, doc):
    db.delete(doc)
    db.commit()


# --------------------------------------------------
# SHARED DOCUMENT OPERATIONS
# --------------------------------------------------

def get_document_by_share_code(db, share_code):
    return db.query(Document).filter(Document.share_code == share_code).first()

def add_shared_document(db, user_id, document_id):
    # Check if already shared/saved to avoid duplicates
    existing = db.query(SharedDocument).filter(
        SharedDocument.user_id == user_id,
        SharedDocument.document_id == document_id
    ).first()
    if existing:
        return existing
        
    shared = SharedDocument(user_id=user_id, document_id=document_id)
    db.add(shared)
    db.commit()
    db.refresh(shared)
    return shared

def get_shared_documents_by_user(db, user_id):
    # Returns documents that have been saved as shared by this user
    return db.query(Document).join(
        SharedDocument, 
        Document.id == SharedDocument.document_id
    ).filter(SharedDocument.user_id == user_id).all()