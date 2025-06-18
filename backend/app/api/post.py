from typing import List
from fastapi import APIRouter,Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.post import PostCreate, PostResponse
from services.jwt import verify_access_token
from models.user import User
from db.session import SessionLocal
from fastapi.security import OAuth2PasswordBearer
from models.post import Post
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

post_router = APIRouter()

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

@post_router.post("/create", response_model=PostResponse)
def create_post(post: PostCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Use current_user.id as author_id
    new_post = Post(
        title=post.title,
        body=post.body,
        author_id=current_user.id
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

@post_router.delete("/delete/{post_id}", response_model=PostResponse)
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    
    post=db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    db.delete(post)
    db.commit()
    return post

@post_router.get("/getAllPost",response_model=List[PostResponse])
def get_allPost(user_id : int, db: Session = Depends(get_db)):
    posts = db.query(Post).filter(Post.author_id == user_id).all()
    return posts
@post_router.get("/all", response_model=List[PostResponse])
def get_all_posts(db: Session = Depends(get_db)):
    posts = db.query(Post).all()
    return posts
