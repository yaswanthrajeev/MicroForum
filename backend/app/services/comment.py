from fastapi import HTTPException
from app.api import post
from app.repositories import comment as comment_repo
from app.models.comment import Comment
from app.nlp.sentiment import analyze_sentiment
from app.messaging.publisher import publish_comment_for_analysis
import logging

logger = logging.getLogger(__name__)

    # Save to DB, alert admin, etc.

def create_and_process_comment(db, post_id: int, user_id: int, body: str):
    # The repository already raises HTTPException if post is not found
    logger.info(f"creating comment for post {post_id} by user {user_id}")
    comment=comment_repo.create_comment(db, post_id, user_id, body)
    #publish to rabbitmq
    logger.info(f"publishing comment {comment.id} for analysis")
    publish_comment_for_analysis(comment.id)


    db.commit()
    
    return comment
    

def delete_comment(db,comment_id: int, current_user):
    return comment_repo.delete_comment(db, comment_id,current_user)


def get_allComment(post_id: int, db):
    comments = comment_repo.get_allComment(post_id, db)
    result = []
    logger.info(f"getting all comments for post {post_id}")
    for comment in comments:
        comment_dict = {
            "id": comment.id,
            "post_id": comment.post_id,
            "body": comment.body,
            "author_id": comment.author_id,
            "author_name": comment.author.username if comment.author else "",
            "created_at": comment.created_at,
            "sentiment_score": comment.sentiment_score,
            "sentiment_label": comment.sentiment_label,
        }
        result.append(comment_dict)
    return result
    
