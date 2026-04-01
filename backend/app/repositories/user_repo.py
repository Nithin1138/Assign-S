from app.models.user import User

def get_user_by_uid(db, uid: str):
    return db.query(User).filter(User.uid == uid).first()

def create_user(db, user: User):
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_user(db, user: User):
    db.commit()
    db.refresh(user)
    return user
