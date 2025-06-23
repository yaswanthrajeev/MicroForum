from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from app.db.base import Base
import datetime


class UserRole(PyEnum):
    NORMAL = "normal"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.NORMAL, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    posts = relationship(
        "Post",
        back_populates="author",
        foreign_keys="[Post.author_id]"
    )
    comments = relationship(
        "Comment",
        back_populates="author",
        foreign_keys="[Comment.author_id]"
    )
    __table_args__ = {'extend_existing': True}
