from fastapi import HTTPException
from app.models.comment import Comment
from app.models.post import Post

import logging
logger = logging.getLogger(__name__)

def create_comment(db, post_id: int, user_id: int, body: str):
    logging.info(f"Creating comment for post {post_id}")
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        logging.warning(f"Post {post_id} not found")
        raise HTTPException(status_code=404, detail="Post not found")
    new_comment = Comment(
        post_id=post_id,
        body=body,
        author_id=user_id,
    )
    db.add(new_comment)
    logging.info(f"Comment {new_comment.id} created")
    db.commit()
    db.refresh(new_comment)
    return new_comment

def delete_comment(db, comment_id: int, current_user):
    logging.info(f"Deleting comment {comment_id}")
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        logging.warning(f"Comment {comment_id} not found")
        raise HTTPException(status_code=404, detail="Comment not found")
    # Check if the comment belongs to the current user
    print(f"Comment Owner: {comment.author_id}, Current User: {current_user.id}, Current User Role: {current_user.role}")

    if comment.author_id != current_user.id  and current_user.role.value != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    db.delete(comment)
    db.commit()
    return comment


def get_allComment(post_id : int, db):
    logging.info(f"Getting all comments for post {post_id}")
    comments = db.query(Comment).filter(Comment.post_id == post_id).all()
    return comments