import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from app.database import Base, engine
from app.models import issue, project, user  # noqa: F401 — register ORM tables with Base
from app.routers import analytics, auth, issues, projects, users

app = FastAPI(title="Workspace API")

# Explicit production origins (Vercel) + localhost for local dev
_cors_origins = [x.strip() for x in os.getenv("CORS_ORIGINS", "").split(",") if x.strip()]
_cors_regex = r"https?://(localhost|127\.0\.0\.1)(:\d+)?"
if os.getenv("CORS_ALLOW_VERCEL", "").lower() in ("1", "true", "yes"):
    _cors_regex = _cors_regex + r"|https://[\w.-]+\.vercel\.app"

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_origin_regex=_cors_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(projects.router, prefix="/projects", tags=["Projects"])
app.include_router(issues.router, prefix="/issues", tags=["Issues"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
