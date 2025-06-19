from fastapi import HTTPException
from app.models.comment import Comment
from app.models.post import Post


def create_comment(db, post_id: int, user_id: int, body: str):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    new_comment = Comment(
        post_id=post_id,
        body=body,
        author_id=user_id,
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment
