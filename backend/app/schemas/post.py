from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.schemas.comment import CommentResponse

class PostCreate(BaseModel):
    title: str
    body: str

class PostResponse(BaseModel):
    id: int
    title: str
    body: str
    author_id: int
    created_at: datetime
    sentiment_score: Optional[float] = None
    sentiment_label: Optional[str] = None
    comments: List[CommentResponse] = []
