from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import auth, projects, users, issues, analytics
from app.models import user

app = FastAPI()

# Any localhost / 127.0.0.1 port (Vite may use 5173, 5174, etc.). Without a matching
# origin the browser hides the response body from JS — axios never sees access_token.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])

app.include_router(users.router, prefix="/users", tags=["Users"])

app.include_router(projects.router, prefix="/projects", tags=["Projects"])

app.include_router(issues.router, prefix="/issues", tags=["Issues"])

app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])