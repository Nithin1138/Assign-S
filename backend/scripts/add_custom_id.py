import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + '/../..'))

from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN custom_id TEXT UNIQUE;"))
        conn.execute(text("CREATE INDEX ix_users_custom_id ON users (custom_id);"))
        conn.commit()
        print("Column custom_id added successfully.")
    except Exception as e:
        print("Error or already exists:", e)
