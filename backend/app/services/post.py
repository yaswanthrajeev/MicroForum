from fastapi import HTTPException
from app.repositories import post as post_repo
from app.models.post import Post
def create_post(db,post):
    return post_repo.create_post(db, post)

def delete_post(db, post_id, current_user):
    post = post_repo.delete_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != current_user.id and getattr(current_user, "role", None) != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    return post
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
