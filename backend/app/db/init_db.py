import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import engine, SQLALCHEMY_DATABASE_URL
from app.db.base import Base
from app.models.user import User
from app.models.post import Post
from app.models.comment import Comment

print(f"Using database URL: {SQLALCHEMY_DATABASE_URL}")

try:
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully.")
except Exception as e:
    print(f"Error creating tables: {e}")
    import traceback
    traceback.print_exc()