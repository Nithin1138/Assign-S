import logging
from sqlalchemy import text, inspect
from app.core.database import engine, Base

# Import all models to ensure they are registered with Base.metadata
from app.models.user import User
from app.models.document import Document
from app.models.template import Template
from app.models.shared_document import SharedDocument
from app.models.document_version import DocumentVersion
from app.models.template_log import TemplateLog
from app.models.editor_document import EditorDocument

logger = logging.getLogger(__name__)

def sync_database():
    """
    Ensure all tables exist and have all required columns.
    This provides a clean, self-healing startup upgrade logic.
    """
    logger.info("Initializing 'Clean Startup' Database Synchronization...")
    
    # 1. Automatic table creation (if not exists)
    Base.metadata.create_all(bind=engine)
    
    # 2. Dynamic column synchronization (Incremental Schema Upgrade)
    inspector = inspect(engine)
    
    for table_name, table_obj in Base.metadata.tables.items():
        existing_cols = {col['name'] for col in inspector.get_columns(table_name)}
        
        for col_name, col_obj in table_obj.columns.items():
            if col_name not in existing_cols:
                logger.info(f"Architecture Upgrade: Detected missing column '{col_name}' in '{table_name}'. Syncing...")
                
                # Map SQLAlchemy type to PostgreSQL type
                type_str = str(col_obj.type).upper()
                
                # Refine type mapping for PostgreSQL
                if "JSON" in type_str:
                    pg_type = "JSON"
                elif "DATETIME" in type_str or "TIMESTAMP" in type_str:
                    pg_type = "TIMESTAMP WITH TIME ZONE"
                elif "INTEGER" in type_str:
                    pg_type = "INTEGER"
                elif "VARCHAR" in type_str or "TEXT" in type_str:
                    pg_type = "TEXT"
                else:
                    pg_type = type_str # Fallback
                
                try:
                    with engine.begin() as conn:
                        # Use quoted identifiers for table and column names to handle case sensitivity
                        conn.execute(text(f'ALTER TABLE "{table_name}" ADD COLUMN "{col_name}" {pg_type}'))
                    logger.info(f"Architecture Upgrade: Column '{col_name}' integrated successfully.")
                except Exception as e:
                    logger.error(f"Architecture Failure: Could not sync column '{col_name}': {e}")

    # 3. Data Integrity: Initialize NULL values for boolean flags and default statuses
    # This prevents existing records from 'vanishing' due to NULL mismatch in filters
    try:
        with engine.begin() as conn:
            # Initialize is_deleted for all relevant tables
            for table_name in ["users", "documents", "templates"]:
                conn.execute(text(f'UPDATE "{table_name}" SET "is_deleted" = false WHERE "is_deleted" IS NULL'))
            
            # Initialize status for documents
            conn.execute(text('UPDATE "documents" SET "status" = \'draft\' WHERE "status" IS NULL'))
            
            # Initialize status for shared documents (ensure they are accepted if already present)
            conn.execute(text('UPDATE "shared_documents" SET "status" = \'accepted\' WHERE "status" IS NULL'))
            
        logger.info("Data Integrity Sync: Initialized NULL flags and statuses successfully.")
    except Exception as e:
        logger.warning(f"Data Integrity Warning: Procedural sync skipped or failed: {e}")

    logger.info("Database Synchronization and Upgrade Logic Finalized.")
