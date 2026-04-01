import os
from dotenv import load_dotenv
from pathlib import Path

# Project root (base directory)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Decide environment
ENV = os.getenv("ENV", "development")

# Priority loading: root .env, then env-specific
load_dotenv(BASE_DIR / ".env")

if ENV == "production":
    load_dotenv(BASE_DIR / ".env.production")
else:
    load_dotenv(BASE_DIR / ".env.development")


class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL")
    JWT_SECRET = os.getenv("JWT_SECRET")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY")
    ENV = ENV



settings = Settings()