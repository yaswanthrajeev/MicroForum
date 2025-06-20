from app.models.post import Post


def create_post(db,post):
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

def delete_post(db, post_id):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None
    db.delete(post)
    db.commit()
    return post
def get_all_posts_by_user(db, user_id):
    posts = db.query(Post).filter(Post.author_id == user_id).all()
    if not posts:
        return []
    return posts

def get_all_posts(db):
    posts = db.query(Post).all()
    if not posts:
        return []
    return posts