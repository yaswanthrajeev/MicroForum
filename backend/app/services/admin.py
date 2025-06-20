from fastapi import HTTPException
from app.models.user import User, UserRole
from app.models.post import Post
from app.models.comment import Comment
from app.repositories import admin as admin_repository
def get_all_users(db):
    return admin_repository.get_all_users(db)

def promote_to_admin(db,username):
    user= admin_repository.promote_to_admin(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role.value != "admin":
        raise HTTPException(status_code=400, detail="User could not be promoted")
    return user


def get_all_posts(db):
    posts= admin_repository.get_all_posts(db)
    if not posts:
        raise HTTPException(
    status_code=404,
    detail="No posts found",
    headers={"X-Error": "No posts available"}
    )
    return posts

def delete_post(db, post_id: int):
    post = admin_repository.delete_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post   

def delete_comment(db, comment_id: int):
    comment= db.query(Comment).filter(Comment.id== comment_id).first()
    if not comment:
        return None
    admin_repository.delete_comment(db, comment)
    return comment

def post_sentiment(db, post_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if not post.comments:
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
    return {
        "average_sentiment_score": avg_score,
        "overall_sentiment_label": overall_label,
        "sentiment_label_counts": label_counts,
        "total_comments": len(post.comments)
    }
