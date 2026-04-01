import sqlite3
import os

db_path = "/Users/nithin/Downloads/AssignMate2.0-main/src/backend/app/app.db"

if not os.path.exists(db_path):
    print(f"Error: Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='templates';")
    table_exists = cursor.fetchone()
    if table_exists:
        print("Table 'templates' exists.")
        cursor.execute("PRAGMA table_info(templates);")
        columns = [col[1] for col in cursor.fetchall()]
        print(f"Columns: {columns}")
        
        cursor.execute("SELECT COUNT(*) FROM templates;")
        count = cursor.fetchone()[0]
        print(f"Count of templates: {count}")
    else:
        print("Table 'templates' DOES NOT EXIST. Migrating...")
        # Manually create it to fix schema issues
        cursor.execute("""
        CREATE TABLE templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            doc_id INTEGER,
            name TEXT,
            topic TEXT,
            description TEXT,
            sections JSON,
            metadata_fields JSON,
            style JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        """)
        conn.commit()
        print("Table 'templates' created successfully.")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
