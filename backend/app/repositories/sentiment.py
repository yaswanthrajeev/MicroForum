from app.models.post import Post


def posts_sentiment_summary(db):
    posts=db.query(Post).all()
    return posts
