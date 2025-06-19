from app.models.comment import Comment 
from app.models.user import User, UserRole
from app.models.post import Post
def delete_comment(db, post):
    db.delete(post)
    db.commit()

def get_all_users(db):
    return db.query(User).all()

def promote_to_admin(db, username):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    if user.role.value == "admin":
        return user
    user.role = UserRole.ADMIN
    db.commit()
    db.refresh(user)
    return user

def get_all_posts(db):
    posts = db.query(Post).all()
    # Attach comments to each post
    for post in posts:
        post.comments = db.query(Comment).filter(Comment.post_id == post.id).all()
    return posts

def delete_post(db, post_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None
    db.delete(post)
    db.commit()
    return post