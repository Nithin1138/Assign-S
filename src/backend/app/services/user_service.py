from sqlalchemy.sql import func
from app.models.user import User
from app.repositories import user_repo


def sync_user_service(req, db):
    user = user_repo.get_user_by_uid(db, req.uid)

    if not user:
        user = User(
            uid=req.uid,
            email=req.email,
            displayName=req.displayName,
            photoURL=req.photoURL,
            created_at=func.now()
        )
        user = user_repo.create_user(db, user)

    return user


def get_user_service(uid, db):
    return user_repo.get_user_by_uid(db, uid)


def update_user_service(uid, req, db):
    user = user_repo.get_user_by_uid(db, uid)

    if not user:
        return None   # FIX

    if req.displayName:
        user.displayName = req.displayName
    if req.photoURL:
        user.photoURL = req.photoURL
    if req.preferences:
        user.preferences = req.preferences

    return user_repo.update_user(db, user)