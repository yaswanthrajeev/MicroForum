from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Use PostgreSQL in production, SQLite in development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///forum.db")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
