from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class PostCreate(BaseModel):
    title: str
    body: str

class PostResponse(BaseModel):
    id: int
    title: str
    body: str
    author_id: int
    timestamp: datetime
    sentiment_score: Optional[float] = None
    sentiment_label: Optional[str] = None
