from app.models.document import Document

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
    return db.query(Document).filter(
        Document.id == doc_id,
        Document.user_id == user_id
    ).first()


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