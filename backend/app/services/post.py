from fastapi import HTTPException
from app.repositories import post as post_repo
from app.models.post import Post
from app.models.user import UserRole
import logging
logger = logging.getLogger(__name__)
def create_post(db,post):
    logger.info(f"creating post {post.title} by user {post.author_id}")
    created_post = post_repo.create_post(db, post)
    logger.info(f"post {created_post.id} created")
    # Build and return a dict with all required fields for PostResponse
    return {
        "id": created_post.id,
        "title": created_post.title,
        "body": created_post.body,
        "author_id": created_post.author_id,
        "author_name": created_post.author.username if created_post.author else "",
        "created_at": created_post.created_at,
        "sentiment_score": created_post.sentiment_score,
        "sentiment_label": created_post.sentiment_label,
        "comments": [],
    }

def delete_post(db, post_id, current_user):
    logger.info(f"Deleting post {post_id}")
    post = post_repo.get_post(db, post_id)  # Fetch, don't delete yet
    if not post:
        logger.warning(f"Post {post_id} not found")
        raise HTTPException(status_code=404, detail="Post not found")
    is_admin = False
    try:
        is_admin = current_user.role == UserRole.ADMIN or str(current_user.role) == "admin"
    except Exception as e:
        logger.error(f"Error checking user role: {e}")
    if post.author_id != current_user.id and not is_admin:
        logger.warning(f"user {current_user.id} not authorized to delete post {post_id}")
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    post_repo.delete_post(db, post_id)  # Now actually delete
    return {
        "id": post.id,
        "title": post.title,
        "body": post.body,
        "author_id": post.author_id,
        "author_name": post.author.username if post.author else "",
        "created_at": post.created_at,
        "sentiment_score": post.sentiment_score,
        "sentiment_label": post.sentiment_label,
        "comments": [],
    }

def get_all_posts_by_user(db, user_id):
    return post_repo.get_all_posts_by_user(db, user_id)

def get_all_posts(db):
    posts = post_repo.get_all_posts(db)
    result = []
    for post in posts:
        post_dict = {
            "id": post.id,
            "title": post.title,
            "body": post.body,
            "author_id": post.author_id,
            "author_name": post.author.username if post.author else "",
            "created_at": post.created_at,
            "sentiment_score": post.sentiment_score,
            "sentiment_label": post.sentiment_label,
            # "comments": will be set below
        }
        comments = []
        for comment in post.comments:
            comments.append({
                "id": comment.id,
                "post_id": comment.post_id,
                "body": comment.body,
                "author_id": comment.author_id,
                "author_name": comment.author.username if comment.author else "",
                "created_at": comment.created_at,
                "sentiment_score": comment.sentiment_score,
                "sentiment_label": comment.sentiment_label,
            })
        post_dict["comments"] = comments
        result.append(post_dict)
    return result

def get_post(post_id, db):
    post= post_repo.get_post(db, post_id)
    if not post:
        logger.warning(f"post {post_id} not found")
        raise HTTPException(status_code=404, detail="Post not found")
    post_dict = {
        "id": post.id,
        "title": post.title,
        "body": post.body,
        "author_id": post.author_id,
        "author_name": post.author.username if post.author else "",
        "created_at": post.created_at,
        "sentiment_score": post.sentiment_score,
        "sentiment_label": post.sentiment_label,
            # "comments": will be set below
        }
    return post_dict
