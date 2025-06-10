from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
import os
from app.core.config import DB_URL

engine = create_engine(DB_URL)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
