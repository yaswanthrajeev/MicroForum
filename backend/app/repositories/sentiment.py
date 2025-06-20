from app.models.post import Post
from app.models.comment import Comment

def posts_sentiment_summary(db):
    posts=db.query(Post).all()
    return posts
def posts_sentiment(db, post_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None
    return post
def get_comment(db, post_id: int):
    comments = db.query(Comment).filter(Comment.post_id == post_id).all()
    return comments
