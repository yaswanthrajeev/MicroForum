# api/admin.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services import admin as admin_service
from app.schemas.post import PostResponse
from app.models.post import Post
from app.models.comment import Comment
from app.services import sentiment as sentiment_service
import logging

logger = logging.getLogger(__name__)
admin_router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@admin_router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    logger.info("Fetching all users...")
    return admin_service.get_all_users(db)


@admin_router.patch("/promote/{username}")
def promote_to_admin(username: str, db: Session = Depends(get_db)):
    logger.info(f"Promoting user '{username}' to admin.")
    user = admin_service.promote_to_admin(db, username)
    logger.debug(f"User promoted: {user.username if user else 'None'}")
    return {"message": f"User {username} has been promoted to admin", "user": user}


@admin_router.get("/getAllPosts", response_model=list[PostResponse])
def get_all_posts(db: Session = Depends(get_db)):
    logger.info("Fetching all posts...")
    return admin_service.get_all_posts(db)


@admin_router.delete("/deletePost/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):
    logger.warning(f"Attempting to delete post with id {post_id}")
    post = admin_service.delete_post(db, post_id)
    logger.debug(f"Post deleted: {post_id}")
    return {"message": f"Post with id {post_id} has been deleted successfully"}


@admin_router.delete("/deleteComment/{comment_id}")
def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    logger.warning(f"Attempting to delete comment with id {comment_id}")
    comment = admin_service.delete_comment(db, comment_id)
    if not comment:
        logger.error(f"Comment with id {comment_id} not found.")
        raise HTTPException(status_code=404, detail="Comment not found")
    logger.debug(f"Comment deleted: {comment_id}")
    return {"message": f"Post with id {comment_id} has been deleted successfully"}


@admin_router.get("/sentiment-summary")
def posts_sentiment_summary(db: Session = Depends(get_db)):
    logger.info("Fetching sentiment summary for all posts.")
    return sentiment_service.posts_sentiment_summary(db)


@admin_router.get("/sentiment-summary")
def posts_sentiment_summary(post_id: int, db: Session = Depends(get_db)):
    logger.info(f"Fetching sentiment summary for post id {post_id}")
    return sentiment_service.posts_sentiment(post_id, db)
