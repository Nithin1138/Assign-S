from app.models.template import Template
from app.models.template_log import TemplateLog

from sqlalchemy import or_

def create_template(db, data):
    if hasattr(data, "model_dump"):
        data = data.model_dump(exclude_unset=True)
    elif hasattr(data, "dict"):
        data = data.dict(exclude_unset=True)
    
    # Extract logs if provided for normalization
    logs = data.pop("extraction_details", None)
    
    template = Template(**data)
    db.add(template)
    db.commit()
    db.refresh(template)
    
    # Store logs in normalized table
    if logs:
        log_entry = TemplateLog(
            template_id=template.id, 
            raw_data=logs.get("raw"),
            ai_output=logs.get("ai")
        )
        db.add(log_entry)
        db.commit()

    return template


def get_templates_by_user(db, user_id):
    return db.query(Template).filter(
        Template.user_id == user_id,
        or_(Template.is_deleted == False, Template.is_deleted == None)
    ).all()


def get_template(db, template_id, user_id):
    return db.query(Template).filter(
        Template.id == template_id,
        Template.user_id == user_id,
        or_(Template.is_deleted == False, Template.is_deleted == None)
    ).first()


def delete_template(db, template):
    # Production Grade: Soft Delete
    template.is_deleted = True
    db.commit()