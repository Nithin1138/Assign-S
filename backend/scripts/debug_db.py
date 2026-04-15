import os
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.core.database import SessionLocal
from app.models.document import Document
from sqlalchemy import text

def debug():
    db = SessionLocal()
    try:
        count = db.query(Document).count()
        print(f"Total documents: {count}")
        
        docs = db.query(Document).limit(5).all()
        for d in docs:
            print(f"ID: {d.id}, User: {d.user_id}, Title: {d.title}, Deleted: {d.is_deleted}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug()
