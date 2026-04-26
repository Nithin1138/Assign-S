import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Routers
from app.api.routes import document_routes, user_routes, template_routes, auth_routes, editor_document_routes, waitlist_routes

# DB
from app.core.db_sync import sync_database
from app.core.database import Base, engine

# --------------------------------------------------
# LOGGING
# --------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ----------------------------
# Lifespan (replaces on_event)
# ----------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Perform a 'Clean Start Up Grade' - Auto-create tables and sync columns
    sync_database()
    yield


app = FastAPI(
    title="AssignMate API",
    version="1.0.0",
    lifespan=lifespan
)


# ----------------------------
# Global Exception Handler
# ----------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "data": None,
            "error": str(exc)
        }
    )


# ----------------------------
# Middleware
# ----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------
# Routes
# ----------------------------
app.include_router(
    document_routes.router,
    prefix="/api/v1/documents",
    tags=["Documents"]
)

app.include_router(
    editor_document_routes.router,
    prefix="/api/v1/editor-documents",
    tags=["Editor Documents"]
)

app.include_router(
    user_routes.router,
    prefix="/api/v1/users",
    tags=["Users"]
)

app.include_router(
    template_routes.router,
    prefix="/api/v1/templates",
    tags=["Templates"]
)

app.include_router(
    auth_routes.router,
    prefix="/api/v1/auth",
    tags=["Auth"]
)

app.include_router(
    waitlist_routes.router,
    prefix="/api/v1/waitlist",
    tags=["Waitlist"]
)


# ----------------------------
# Health Check
# ----------------------------
@app.get("/")
def health_check():
    return {"success": True, "data": {"status": "running"}, "error": None}