from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers
from app.api.routes import document_routes, user_routes, template_routes

# DB
from app.core.database import Base, engine

app = FastAPI(
    title="AssignMate API",
    version="1.0.0"
)

# ----------------------------
# Startup Event (DB Init)
# ----------------------------
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


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
    user_routes.router,
    prefix="/api/v1/users",
    tags=["Users"]
)

app.include_router(
    template_routes.router,
    prefix="/api/v1/templates",
    tags=["Templates"]
)


# ----------------------------
# Health Check (important)
# ----------------------------
@app.get("/")
def health_check():
    return {"status": "running"}