import pika
import json
import os

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
QUEUE_NAME = "sentiment_analysis_queue"

def publish_comment_for_analysis(comment_id: int):
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
    channel = connection.channel()
    channel.queue_declare(queue=QUEUE_NAME, durable=True)
    message_body = json.dumps({"comment_id": comment_id})
    channel.basic_publish(
        exchange='',
        routing_key=QUEUE_NAME,
        body=message_body.encode('utf-8'),
        properties=pika.BasicProperties(delivery_mode=2)
    )
    connection.close()