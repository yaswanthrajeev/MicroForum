from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class CommentCreate(BaseModel):
    body : str

class CommentResponse(BaseModel):
    id: int
    post_id: int
    body: str
    author_id: int
    author_name: str
    created_at: datetime
    sentiment_score: Optional[float] = None
    sentiment_label: Optional[str] = None

    class Config:
        orm_mode = True