from fastapi import HTTPException
from app.api import post
from app.repositories import comment as comment_repo
from app.models.comment import Comment
from app.nlp.sentiment import analyze_sentiment

def process_comment(comment_text):
    label, score = analyze_sentiment(comment_text)
    # Save to DB, alert admin, etc.

def create_and_process_comment(db, post_id: int, user_id: int, body: str):
    # The repository already raises HTTPException if post is not found
    comment=comment_repo.create_comment(db, post_id, user_id, body)

    label,score=analyze_sentiment(body)
    comment.sentiment_score = score
    comment.sentiment_label = label
    db.commit()
    return comment
    

def delete_comment(db,comment_id: int, current_user):
    return comment_repo.delete_comment(db, comment_id,current_user)


def get_allComment(post_id: int, db):
    comments = comment_repo.get_allComment(post_id, db)
    result = []
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
