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