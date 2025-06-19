from app.api import post
from app.repositories import comment as comment_repo

def create_comment_service(db, post_id: int, user_id: int, body: str):
    # The repository already raises HTTPException if post is not found
    return comment_repo.create_comment(db, post_id, user_id, body)