from sqlalchemy.sql import func
from app.models.user import User
from app.repositories import user_repo, activity_repo


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
    try:
        user = user_repo.get_user_by_uid(db, uid)
        if not user:
            return None

        if req.displayName is not None:
            user.displayName = req.displayName
        if req.photoURL is not None:
            user.photoURL = req.photoURL
            
        if req.institution is not None:
            user.institution = req.institution
        if req.fieldOfStudy is not None:
            user.fieldOfStudy = req.fieldOfStudy
        if req.bio is not None:
            user.bio = req.bio
        if req.skills is not None:
            user.skills = req.skills
        if req.socialLinks is not None:
            user.socialLinks = req.socialLinks
        if req.weeklyGoal is not None:
            user.weeklyGoal = req.weeklyGoal

        if req.custom_id and req.custom_id != user.custom_id:
            from datetime import datetime, timezone, timedelta
            
            if user.custom_id_updated_at:
                updated_at = user.custom_id_updated_at
                if updated_at.tzinfo is None:
                    updated_at = updated_at.replace(tzinfo=timezone.utc)
                
                one_year_ago = datetime.now(timezone.utc) - timedelta(days=365)
                if updated_at > one_year_ago:
                    from fastapi import HTTPException
                    days_left = (updated_at + timedelta(days=365) - datetime.now(timezone.utc)).days
                    raise HTTPException(status_code=400, detail=f"User ID can only be changed once a year. {days_left} days remaining.")

            existing = db.query(User).filter(User.custom_id == req.custom_id).first()
            if existing and existing.uid != uid:
                from fastapi import HTTPException
                raise HTTPException(status_code=400, detail="User ID already taken")
                
            user.custom_id = req.custom_id
            user.custom_id_updated_at = func.now()

        if req.preferences is not None:
            user.preferences = req.preferences

        res = user_repo.update_user(db, user)
        activity_repo.log_activity(
            db,
            uid,
            "profile_updated",
            "Identity Refined",
            "Updated professional scholarly profile details and preferences.",
            {"uid": uid}
        )
        return res
    except HTTPException:
        raise
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Internal Save Error: {str(e)}")