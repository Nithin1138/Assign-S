from app.repositories import template_repo


def save_template(db, req):
    template = template_repo.create_template(db, req)
    return template


def get_templates(db, user_id):
    return template_repo.get_templates_by_user(db, user_id)


def delete_template(db, template_id, user_id):
    template = template_repo.get_template(db, template_id, user_id)

    if not template:
        return None   # consistent

    template_repo.delete_template(db, template)
    return True