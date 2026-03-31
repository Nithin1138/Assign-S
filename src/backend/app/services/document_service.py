from app.repositories import document_repo
from app.services.ai_service import generate_assignment


def save_document(db, req):
    doc = document_repo.create_document(db, req)
    return doc


def get_documents(db, user_id):
    return document_repo.get_documents_by_user(db, user_id)


def get_document(db, doc_id, user_id):
    return document_repo.get_document(db, doc_id, user_id)


def update_document(db, doc_id, req):
    doc = document_repo.get_document(db, doc_id, req.user_id)

    if not doc:
        return None   # important fix

    updated = document_repo.update_document(db, doc, req)
    return updated


def delete_document(db, doc_id):
    doc = document_repo.get_document(db, doc_id, None)

    if not doc:
        return None   # consistent behavior

    document_repo.delete_document(db, doc)
    return True


def generate_ai(prompt):
    return generate_assignment(prompt)   # return pure value