from fastapi import HTTPException
from app.models.user import User, UserRole
from app.models.post import Post
from app.models.comment import Comment
from app.repositories import admin as admin_repository
import logging
logger = logging.getLogger(__name__)

def get_all_users(db):
    logger.info("Getting all users")
    return admin_repository.get_all_users(db)

def promote_to_admin(db,username):
    logger.info(f"Promoting user {username} to admin")
    user= admin_repository.promote_to_admin(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role.value != "admin":
        raise HTTPException(status_code=400, detail="User could not be promoted")
    logger.debug(f"User {username} promoted to admin")
    return user


def get_all_posts(db):
    logger.info("Fetching all posts.")
    posts = admin_repository.get_all_posts(db)
    if not posts:
        logger.warning("No posts found.")
        raise HTTPException(
            status_code=404,
            detail="No posts found",
            headers={"X-Error": "No posts available"}
        )
    logger.info(f"Fetched {len(posts)} posts.")
    return posts

def delete_post(db, post_id: int):
    logger.info(f"Attempting to delete post with id {post_id}.")
    post = admin_repository.delete_post(db, post_id)
    if not post:
        logger.warning(f"Post with id {post_id} not found for deletion.")
        raise HTTPException(status_code=404, detail="Post not found")
    logger.info(f"Deleted post with id {post_id}.")
    return post   

def delete_comment(db, comment_id: int):
    logger.info(f"Attempting to delete comment with id {comment_id}.")
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        logger.warning(f"Comment with id {comment_id} not found for deletion.")
        return None
    admin_repository.delete_comment(db, comment)
    logger.info(f"Deleted comment with id {comment_id}.")
    return comment

def post_sentiment(db, post_id: int):
    logger.info(f"Calculating sentiment for post id {post_id}.")
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        logger.warning(f"Post with id {post_id} not found for sentiment analysis.")
        raise HTTPException(status_code=404, detail="Post not found")
    if not post.comments:
        logger.info(f"Post id {post_id} has no comments.")
        return {
            "average_sentiment_score": None,
            "overall_sentiment_label": "Neutral",
            "sentiment_label_counts": {"Positive": 0, "Negative": 0, "Neutral": 0},
            "total_comments": 0
        }
    score = 0
    label_counts = {"Positive": 0, "Negative": 0, "Neutral": 0}
    for comment in post.comments:
        if comment.sentiment_score is not None:
            score += comment.sentiment_score
        if comment.sentiment_label in label_counts:
            label_counts[comment.sentiment_label] += 1
    avg_score = score / len(post.comments)
    if avg_score == 0:
        overall_label = "Neutral"
    elif avg_score > 0:
        overall_label = "Positive"
    else:
        overall_label = "Negative"
    logger.info(f"Post id {post_id} sentiment calculated: avg_score={avg_score}, overall_label={overall_label}, label_counts={label_counts}")
    return {
        "average_sentiment_score": avg_score,
        "overall_sentiment_label": overall_label,
        "sentiment_label_counts": label_counts,
        "total_comments": len(post.comments)
    }
