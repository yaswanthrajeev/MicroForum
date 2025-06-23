from app.models.post import Post
import logging
logger = logging.getLogger(__name__)

def create_post(db,post):
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

def delete_post(db, post_id):
    logging.info(f"Deleting post {post_id}")
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        logging.warning(f"Post {post_id} not found")
        return None
    db.delete(post)
    logging.info(f"Post {post_id} deleted")
    db.commit()
    return post

def get_all_posts_by_user(db, user_id):
    logging.info(f"Getting all posts for user {user_id}")
    posts = db.query(Post).filter(Post.author_id == user_id).all()
    if not posts:
        logging.warning(f"No posts found for user {user_id}")
        return []
    return posts

def get_all_posts(db):
    posts = db.query(Post).all()
    if not posts:
        logging.warning("No posts found")
        return []
    return posts

def get_post(db, post_id):
    logging.info(f"Getting post {post_id}")
    return db.query(Post).filter(Post.id == post_id).first()
    logging.info(f"Post {post_id} found")