from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os


SQLALCHEMY_DATABASE_URL = "postgresql://postgres:12345678@localhost:5432/BLOG"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)