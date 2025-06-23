from app.models.post import Post
from app.models.comment import Comment
import logging
logger = logging.getLogger(__name__)
def posts_sentiment_summary(db):
    logging.info("Getting posts sentiment summary")
    posts=db.query(Post).all()
    return posts
def posts_sentiment(db, post_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        logging.warning(f"Post {post_id} not found")
        return None
    return post
def get_comment(db, post_id: int):
    logging.info(f"Getting comments for post {post_id}")
    comments = db.query(Comment).filter(Comment.post_id == post_id).all()
    return comments
