from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Repo root — avoids a second app.db if uvicorn is started from another cwd.
_ROOT = Path(__file__).resolve().parent.parent
DATABASE_URL = f"sqlite:///{_ROOT / 'app.db'}"

engine = create_engine(DATABASE_URL, connect_args={'check_same_thread': False})

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit = False)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()