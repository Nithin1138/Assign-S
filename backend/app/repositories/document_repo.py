from app.models.document import Document
from app.models.document_version import DocumentVersion
from app.models.shared_document import SharedDocument
from sqlalchemy import or_
from sqlalchemy.orm import joinedload

def create_document(db, data):
    if hasattr(data, "model_dump"):
        data = data.model_dump(exclude_unset=True)
    elif hasattr(data, "dict"):
        data = data.dict(exclude_unset=True)
    doc = Document(**data)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # Store initial version
    v = DocumentVersion(document_id=doc.id, content=doc.content)
    db.add(v)
    db.commit()
    
    return doc


def get_documents_by_user(db, user_id):
    return db.query(Document).filter(
        Document.user_id == user_id,
        or_(Document.is_deleted == False, Document.is_deleted == None)
    ).all()


def get_document(db, doc_id, user_id):
    query = db.query(Document).filter(
        Document.id == doc_id,
        or_(Document.is_deleted == False, Document.is_deleted == None)
    )
    if user_id:
        query = query.outerjoin(
            SharedDocument,
            (Document.id == SharedDocument.document_id) & (SharedDocument.user_id == user_id)
        ).filter(
            or_(
                Document.user_id == user_id,
                SharedDocument.user_id == user_id
            )
        )
    return query.first()

def get_document_by_id(db, doc_id):
    return db.query(Document).filter(Document.id == doc_id).first()

def get_document_for_update(db, doc_id, user_id):
    query = db.query(Document).filter(
        Document.id == doc_id,
        or_(Document.is_deleted == False, Document.is_deleted == None)
    )
    if user_id:
        query = query.outerjoin(
            SharedDocument,
            (Document.id == SharedDocument.document_id) & (SharedDocument.user_id == user_id)
        ).filter(
            or_(
                Document.user_id == user_id,
                (SharedDocument.user_id == user_id) & (SharedDocument.permission == "edit")
            )
        )
    return query.first()


def update_document(db, doc, data):
    # Capture current content as a version BEFORE updating
    version = DocumentVersion(document_id=doc.id, content=doc.content)
    db.add(version)

    if hasattr(data, "model_dump"):
        data = data.model_dump(exclude_unset=True)
    elif hasattr(data, "dict"):
        data = data.dict(exclude_unset=True)
    
    for key, value in data.items():
        if value is not None and key not in ["id", "user_id"]:
            setattr(doc, key, value)

    db.commit()
    db.refresh(doc)
    return doc


def delete_document(db, doc):
    # Production Grade: Soft Delete
    doc.is_deleted = True
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
        
    shared = SharedDocument(user_id=user_id, document_id=document_id, status="accepted")
    db.add(shared)
    db.commit()
    db.refresh(shared)
    return shared

def get_shared_documents_by_user(db, user_id):
    return db.query(Document).join(
        SharedDocument, 
        Document.id == SharedDocument.document_id
    ).filter(
        SharedDocument.user_id == user_id,
        SharedDocument.status == "accepted",
        or_(Document.is_deleted == False, Document.is_deleted == None)
    ).all()

def get_pending_shares_by_user(db, user_id):
    # Returns shared document data that are pending response
    return db.query(SharedDocument).options(
        joinedload(SharedDocument.document),
        joinedload(SharedDocument.granter)
    ).join(Document).filter(
        SharedDocument.user_id == user_id,
        SharedDocument.status == "pending",
        or_(Document.is_deleted == False, Document.is_deleted == None)
    ).all()

def respond_to_share_request(db, share_id, user_id, status):
    shared = db.query(SharedDocument).filter(
        SharedDocument.id == share_id,
        SharedDocument.user_id == user_id
    ).first()
    
    if not shared:
        return None
        
    if status == "rejected":
        db.delete(shared)
    else:
        shared.status = status
        
    db.commit()
    return True

def get_document_access_list(db, doc_id):
    return db.query(SharedDocument).options(joinedload(SharedDocument.receiver)).filter(SharedDocument.document_id == doc_id).all()

def update_shared_permission(db, doc_id, target_user_id, new_permission, granted_by_uid=None):
    shared = db.query(SharedDocument).filter(
        SharedDocument.document_id == doc_id,
        SharedDocument.user_id == target_user_id
    ).first()
    
    if not shared:
        if new_permission == "remove":
            return None
        # Add new access record
        shared = SharedDocument(
            document_id=doc_id,
            user_id=target_user_id,
            granted_by=granted_by_uid,
            permission=new_permission,
            status="pending"
        )
        db.add(shared)
    else:
        if new_permission == "remove":
            db.delete(shared)
        else:
            shared.permission = new_permission
            
    db.commit()
    if new_permission != "remove":
        db.refresh(shared)
    return shared