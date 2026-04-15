import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load .env (current or parent dir)
if os.path.exists(".env"):
    load_dotenv(".env")
elif os.path.exists("backend/.env"):
    load_dotenv("backend/.env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found")
    exit(1)

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

def run_migration():
    print("Initiating Production-Grade Architecture Migration...")
    
    # We use a single transaction block for safety
    with engine.begin() as conn:
        # 1. Soft Delete & New Core Fields
        print("Integrating Core Architectural Fields (Soft Delete, Timestamps, Status)...")
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;'))
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS institution TEXT;'))
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS "fieldOfStudy" TEXT;'))
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;'))
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS skills JSON;'))
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS "socialLinks" JSON;'))
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS "weeklyGoal" INTEGER DEFAULT 0;'))
        conn.execute(text('ALTER TABLE templates ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;'))
        conn.execute(text('ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;'))
        conn.execute(text('ALTER TABLE documents ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;'))
        conn.execute(text("ALTER TABLE documents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';"))
        # Enforce status values
        conn.execute(text('ALTER TABLE documents DROP CONSTRAINT IF EXISTS chk_doc_status;'))
        conn.execute(text("ALTER TABLE documents ADD CONSTRAINT chk_doc_status CHECK (status IN ('draft', 'generated', 'finalized'));"))

        # 2. Sharing System Enhancements
        print("Refining Sharing Infrastructure...")
        conn.execute(text('ALTER TABLE shared_documents ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;'))
        conn.execute(text('ALTER TABLE shared_documents ADD COLUMN IF NOT EXISTS granted_by TEXT;'))
        conn.execute(text('ALTER TABLE shared_documents DROP CONSTRAINT IF EXISTS chk_perm_values;'))
        conn.execute(text("ALTER TABLE shared_documents ADD CONSTRAINT chk_perm_values CHECK (permission IN ('view', 'edit'));"))

        # 3. New Strategic Tables (Versioning, Auditing)
        print("Constructing Strategy Tables (Versioning, Extraction Logs)...")
        conn.execute(text('''
            CREATE TABLE IF NOT EXISTS document_versions (
                id SERIAL PRIMARY KEY,
                document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
                content TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        '''))
        conn.execute(text('''
            CREATE TABLE IF NOT EXISTS template_logs (
                id SERIAL PRIMARY KEY,
                template_id INTEGER NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
                raw_data JSON,
                ai_output JSON,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        '''))

        # 4. Enforcing Relational Constraints (Foreign Keys)
        print("Enforcing Structural Constraints...")
        # Link Documents to Users
        conn.execute(text('ALTER TABLE documents DROP CONSTRAINT IF EXISTS fk_doc_user;'))
        conn.execute(text('ALTER TABLE documents ADD CONSTRAINT fk_doc_user FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE;'))
        # Link Sharing to Documents & Users
        conn.execute(text('ALTER TABLE shared_documents DROP CONSTRAINT IF EXISTS fk_shared_doc;'))
        conn.execute(text('ALTER TABLE shared_documents ADD CONSTRAINT fk_shared_doc FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;'))
        conn.execute(text('ALTER TABLE shared_documents DROP CONSTRAINT IF EXISTS fk_shared_user;'))
        conn.execute(text('ALTER TABLE shared_documents ADD CONSTRAINT fk_shared_user FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE;'))

        # 5. Performance Optimization (Indexes)
        print("Injecting Performance Indexes...")
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_users_uid ON users(uid);'))
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_docs_user ON documents(user_id);'))
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_docs_share ON documents(share_code);'))
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_shared_docs_id ON shared_documents(document_id);'))
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_doc_versions_doc_id ON document_versions(document_id);'))

        # 6. Normalization: Migrate extraction details if they exist in templates
        print("Normalizing Template Storage (Migrating Legacy Details)...")
        # Attempt migration if columns exist
        try:
            conn.execute(text('''
                INSERT INTO template_logs (template_id, raw_data, ai_output, created_at)
                SELECT id, extraction_details->'raw', extraction_details->'ai', created_at
                FROM templates 
                WHERE extraction_details IS NOT NULL;
            '''))
            # Note: We keep the old column for now but it should ideally be dropped later.
        except Exception as e:
            print(f"Migration Note (Internal): {e}")

        # 7. Activity Tracking System
        print("Initializing Activity Tracking Infrastructure...")
        conn.execute(text('''
            CREATE TABLE IF NOT EXISTS user_activities (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
                event_type TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                metadata_json JSON,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        '''))
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activities(user_id);'))

    print("Architecture Migration Successfully Completed.")

if __name__ == "__main__":
    run_migration()
