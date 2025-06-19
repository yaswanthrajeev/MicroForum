from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.db.base import Base
import datetime

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    body = Column(String, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    sentiment_score = Column(Float)
    sentiment_label = Column(String)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"),nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    author = relationship(
        "User",
        back_populates="posts",
        foreign_keys="[Post.author_id]"
    )
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")

