# api/admin.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services import admin as admin_service
from app.schemas.post import PostResponse
from app.models.post import Post
from app.models.comment import Comment
from app.services import sentiment as sentiment_service
admin_router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@admin_router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    return admin_service.get_all_users(db)

@admin_router.patch("/promote/{username}")
def promote_to_admin(username: str, db: Session = Depends(get_db)):
    user = admin_service.promote_to_admin(db, username)
    
    return {"message": f"User {username} has been promoted to admin", "user": user}

@admin_router.get("/getAllPosts", response_model=list[PostResponse])
def get_all_posts( db: Session = Depends(get_db)):
    return admin_service.get_all_posts(db)

@admin_router.delete("/deletePost/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):
    post= admin_service.delete_post(db, post_id)
    return {"message": f"Post with id {post_id} has been deleted successfully"}

@admin_router.delete("/deleteComment/{comment_id}")
def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    comment=admin_service.delete_comment(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": f"Post with id {comment_id} has been deleted successfully"}

@admin_router.get("/sentiment-summary")
def posts_sentiment_summary(db: Session = Depends(get_db)):
    return sentiment_service.posts_sentiment_summary(db)
    posts = sentiment_service.posts_sentiment_summary(db)
    summary = []
    for post in posts:
        comments = db.query(Comment).filter(Comment.post_id == post.id).all()
        avg_score = None
        label_counts = {"Positive": 0, "Negative": 0, "Neutral": 0}
        if comments:
            scores = [c.sentiment_score for c in comments if c.sentiment_score is not None]
            avg_score = sum(scores) / len(scores) if scores else None
            for c in comments:
                label = (c.sentiment_label or "Neutral").capitalize()
                if label in label_counts:
                    label_counts[label] += 1
                else:
                    label_counts["Neutral"] += 1  # fallback for unexpected labels
        summary.append({
            "post_id": post.id,
            "title": post.title,
            "average_sentiment_score": avg_score,
            "sentiment_label_counts": label_counts,
            "total_comments": len(comments)
        })
    return summary
# ...existing code...
