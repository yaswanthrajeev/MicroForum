from typing import List
from fastapi import APIRouter,Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.post import PostCreate, PostResponse
from services.jwt import verify_access_token
from models.user import User
from db.session import SessionLocal
from fastapi.security import OAuth2PasswordBearer
from models.post import Post
from models.comment import Comment
from schemas.comment import CommentResponse, CommentCreate
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

@comment_route.post("/create",response_model=CommentResponse)
def create_comment(comment : CommentCreate, post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post=db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    new_comment= Comment(
        post_id=post_id,
        body=comment.body,
        author_id=current_user.id,
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

@comment_route.delete("/delete/{comment_id}", response_model= CommentResponse)
def delete_comment(comment_id: int,db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    comment= db.query(Comment).filter(Comment.id==comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="comment not found")
    if comment.author_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    db.delete(comment)
    db.commit()
    return comment

@comment_route.get("/getAllComments/{post_id}/comments", response_model= List[CommentResponse])
def get_allComment(post_id : int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.post_id == post_id).all()
    return comments
