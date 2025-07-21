from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

SQLALCHEMY_DATABASE_URL="postgresql+psycopg2://yaswanth:#kerala1*@localhost:5432/microforum"


if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
