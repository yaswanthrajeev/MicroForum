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
    