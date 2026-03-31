from app.models.template import Template


def create_template(db, data):
    if hasattr(data, "model_dump"):
        data = data.model_dump(exclude_unset=True)
    elif hasattr(data, "dict"):
        data = data.dict(exclude_unset=True)
    template = Template(**data)
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


def get_templates_by_user(db, user_id):
    return db.query(Template).filter(Template.user_id == user_id).all()


def get_template(db, template_id, user_id):
    return db.query(Template).filter(
        Template.id == template_id,
        Template.user_id == user_id
    ).first()


def delete_template(db, template):
    db.delete(template)
    db.commit()