from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
print(f"Connecting to: {db_url}")

try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        print("SQLAlchemy connection successful!")
except Exception as e:
    print(f"SQLAlchemy connection failed: {e}")
