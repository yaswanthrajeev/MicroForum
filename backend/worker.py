from dotenv import load_dotenv
load_dotenv()

import pika
import json
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db.session import SessionLocal
from app.models.comment import Comment
from app.nlp.sentiment import analyze_sentiment

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "user")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "password")
QUEUE_NAME = "sentiment_analysis_queue"

def process_comment_sentiment(comment_id: int):
    db = SessionLocal()
    try:
        comment = db.query(Comment).filter(Comment.id == comment_id).first()
        if not comment:
            print(f"Comment {comment_id} not found.")
            return
        label, score = analyze_sentiment(comment.body)
        comment.sentiment_label = label
        comment.sentiment_score = score
        db.commit()
        print(f"Updated comment {comment_id} with sentiment.")
    except Exception as e:
        print(f"Error processing comment {comment_id}: {e}")
        db.rollback()
    finally:
        db.close()

def callback(ch, method, properties, body):
    message = json.loads(body.decode('utf-8'))
    comment_id = message.get("comment_id")
    if comment_id is not None:
        process_comment_sentiment(comment_id)
    ch.basic_ack(delivery_tag=method.delivery_tag)

def main():
    # Create connection with credentials
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host=RABBITMQ_HOST,
            credentials=credentials
        )
    )
    channel = connection.channel()
    channel.queue_declare(queue=QUEUE_NAME, durable=True)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=QUEUE_NAME, on_message_callback=callback)
    print("Waiting for messages. To exit press CTRL+C")
    channel.start_consuming()

if __name__ == '__main__':
    main()