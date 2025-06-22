from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.post import PostCreate, PostResponse
from services.jwt import verify_access_token
from app.models.user import User
from app.db.session import SessionLocal
from fastapi.security import OAuth2PasswordBearer
from app.models.post import Post
from app.services import post as post_service
import logging

logger = logging.getLogger(__name__)  # Get a logger for this module
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

post_router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    logger.debug("Validating user with access token...")
    payload = verify_access_token(token)
    if not payload:
        logger.warning("Invalid access token.")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    user = db.query(User).filter(User.username == payload.get("sub")).first()
    if not user:
        logger.warning(f"User not found for token subject: {payload.get('sub')}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    logger.debug(f"Authenticated user: {user.username}")
    return user


@post_router.post("/create", response_model=PostResponse)
def create_post(post: PostCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logger.info(f"User {current_user.username} is creating a new post.")
    new_post = Post(title=post.title, body=post.body, author_id=current_user.id)
    return post_service.create_post(db, new_post)


@post_router.delete("/delete/{post_id}", response_model=PostResponse)
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logger.warning(f"User {current_user.username} is attempting to delete post ID {post_id}.")
    return post_service.delete_post(db, post_id, current_user)


@post_router.get("/getAllPost", response_model=List[PostResponse])
def get_allPost(user_id: int, db: Session = Depends(get_db)):
    logger.debug(f"Fetching all posts for user ID {user_id}.")
    return post_service.get_all_posts_by_user(db, user_id)


@post_router.get("/all", response_model=List[PostResponse])
def get_all_posts(db: Session = Depends(get_db)):
    logger.debug("Fetching all posts...")
    return post_service.get_all_posts(db)
