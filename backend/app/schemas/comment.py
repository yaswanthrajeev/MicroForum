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
    timestamp: datetime
    sentiment_score: Optional[float] = None
    sentiment_label: Optional[str] = None

    class Config:
        orm_mode = True