from app.repositories import sentiment as sentiment_repo
from app.models.comment import Comment
import logging
logger = logging.getLogger(__name__)
def posts_sentiment_summary(db):
    logger.info("Getting posts sentiment summary")
    posts = sentiment_repo.posts_sentiment_summary(db)
    summary = []
    for post in posts:
        logger.info(f"Getting sentiment summary for post {post.id}")
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

def posts_sentiment(post_id: int, db):
    post = sentiment_repo.posts_sentiment(db, post_id)
    if not post:
        logger.warning(f"Post {post_id} not found")
        return {"message": "Post not found"}
    summary = []
    comments = sentiment_repo.get_comment(db,post_id)
    avg_score = None
    label_counts = {"Positive": 0, "Negative": 0, "Neutral": 0}
    
    if comments:
        scores = [c.sentiment_score for c in comments if c.sentiment_score is not None]
        avg_score = sum(scores) / len(scores) if scores else None
        for c in comments:
            label = (c.sentiment_label or "Neutral").capitalize()
            if label in label_counts:
                logger.info(f"Incrementing count for label {label}")
                label_counts[label] += 1
            else:
                label_counts["Neutral"] += 1  # fallback for unexpected labels
    
    summary.append({
        "post_id": post_id,
        "average_sentiment_score": avg_score,
        "sentiment_label_counts": label_counts,
        "total_comments": len(comments)
    })
    return summary
