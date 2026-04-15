from sqlalchemy.orm import Session
from app.models.user_activity import UserActivity

def log_activity(db: Session, user_id: str, event_type: str, title: str, description: str = None, metadata: dict = None):
    activity = UserActivity(
        user_id=user_id,
        event_type=event_type,
        title=title,
        description=description,
        metadata_json=metadata
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity

def get_activities_by_user(db: Session, user_id: str, limit: int = 50):
    return db.query(UserActivity).filter(UserActivity.user_id == user_id).order_by(UserActivity.created_at.desc()).limit(limit).all()
