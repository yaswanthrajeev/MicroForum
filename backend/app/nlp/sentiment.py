from transformers import pipeline

classifier = pipeline(
    "sentiment-analysis",
    model="cardiffnlp/twitter-roberta-base-sentiment-latest",
    device=-1  # set -1 for CPU, or specific GPU index
)

def analyze_sentiment(text: str):
    result = classifier(text)[0]
    return result["label"], float(result["score"])
