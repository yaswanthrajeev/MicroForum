from fastapi import HTTPException
from app.api import post
from app.repositories import comment as comment_repo
from app.models.comment import Comment
def create_comment(db, post_id: int, user_id: int, body: str):
    # The repository already raises HTTPException if post is not found
    return comment_repo.create_comment(db, post_id, user_id, body)

def delete_comment(db,comment_id: int, current_user):
    return comment_repo.delete_comment(db, comment_id)


def get_allComment(post_id : int, db):
    return comment_repo.get_allComment(post_id, db)