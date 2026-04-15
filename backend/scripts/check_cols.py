import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'users';")
    cols = cur.fetchall()
    print("Columns in 'users':", [c[0] for c in cols])
    conn.close()
except Exception as e:
    print(f"Error: {e}")
