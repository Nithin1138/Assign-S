import sys
import os

# Add the parent directory to sys.path to import from 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.core.database import engine, Base
from app.models.document import Document
from app.models.shared_document import SharedDocument

def migrate():
    print("Migrating database architecture for absolute visual excellence...")
    
    with engine.begin() as conn:
        # Create shared_documents table first (safe with metadata.create_all)
        print("Ensuring 'shared_documents' table exists...")
        Base.metadata.create_all(bind=engine, tables=[SharedDocument.__table__])
        print("'shared_documents' table synced.")

    with engine.connect() as conn:
        # Check if share_code exists in documents table using information_schema
        print("Checking 'documents' table for 'share_code' column via information_schema...")
        check_col = conn.execute(text(
            "SELECT 1 FROM information_schema.columns "
            "WHERE table_name='documents' AND column_name='share_code'"
        )).fetchone()
        
        if not check_col:
            print("Adding 'share_code' column to 'documents' table...")
            with engine.begin() as begin_conn:
                begin_conn.execute(text("ALTER TABLE documents ADD COLUMN share_code TEXT UNIQUE"))
            print("'share_code' added successfully.")
        else:
            print("'share_code' already exists.")

    print("Migration suite perfected for robust architectural discovery.")

if __name__ == "__main__":
    migrate()
