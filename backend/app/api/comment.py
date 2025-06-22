from typing import List
from fastapi import APIRouter,Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.post import PostCreate, PostResponse
from services.jwt import verify_access_token
from app.models.user import User
from app.db.session import SessionLocal
from fastapi.security import OAuth2PasswordBearer
from app.models.post import Post
from app.models.comment import Comment
from schemas.comment import CommentResponse, CommentCreate
from app.services import comment as comment_service
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

comment_route=APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    user = db.query(User).filter(User.username == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

@comment_route.post("/create", response_model=CommentResponse)
def create_and_process_comment(comment: CommentCreate, post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    created_comment = comment_service.create_and_process_comment(db, post_id, current_user.id, comment.body)
    # Build response dict with author_name
    response = {
        "id": created_comment.id,
        "post_id": created_comment.post_id,
        "body": created_comment.body,
        "author_id": created_comment.author_id,
        "author_name": current_user.username,
        "created_at": created_comment.created_at,
        "sentiment_score": created_comment.sentiment_score,
        "sentiment_label": created_comment.sentiment_label,
    }
    return response

@comment_route.delete("/delete/{comment_id}", response_model=CommentResponse)
def delete_comment(comment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return comment_service.delete_comment(db, comment_id, current_user)


@comment_route.get("/getAllComments/{post_id}/comments", response_model= List[CommentResponse])
def get_allComment(post_id : int, db: Session = Depends(get_db)):
    return comment_service.get_allComment(post_id, db)
