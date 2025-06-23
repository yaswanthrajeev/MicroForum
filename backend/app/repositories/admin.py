from app.models.comment import Comment 
from app.models.user import User, UserRole
from app.models.post import Post
def delete_comment(db, post):
    db.delete(post)
    db.commit()

def get_all_users(db):
    return db.query(User).all()

def promote_to_admin(db, username):
    logging.info(f"Promoting user {username} to admin")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        logging.warning(f"User {username} not found")
        return None
    if user.role.value == "admin":
        logging.warning(f"User {username} is already an admin")
        return user
    user.role = UserRole.ADMIN
    logging.info(f"User {username} promoted to admin")
    db.commit()
    db.refresh(user)
    return user

def get_all_posts(db):
    posts = db.query(Post).all()
    # Attach comments to each post
    for post in posts:
        logging.info(f"Getting comments for post {post.id}")
        post.comments = db.query(Comment).filter(Comment.post_id == post.id).all()
    return posts

def delete_post(db, post_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    logging.info(f"Deleting post {post_id}")
    if not post:
        logging.warning(f"Post {post_id} not found")
        return None
    db.delete(post)
    db.commit()
    return post