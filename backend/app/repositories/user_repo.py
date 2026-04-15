from app.models.user import User
from sqlalchemy import or_

def get_user_by_uid(db, uid: str):
    return db.query(User).filter(
        User.uid == uid,
        or_(User.is_deleted == False, User.is_deleted == None)
    ).first()

def create_user(db, user: User):
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_user(db, user: User):
    db.commit()
    db.refresh(user)
    return user

def delete_user(db, user: User):
    user.is_deleted = True
    db.commit()
