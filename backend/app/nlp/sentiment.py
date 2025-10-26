from transformers import pipeline
from threading import Lock

# Global variables
_classifier = None
_lock = Lock()  # thread-safe lazy load

def get_classifier():
    global _classifier
    if _classifier is None:
        with _lock:
            if _classifier is None:
                _classifier = pipeline(
                    "sentiment-analysis",
                    model="cardiffnlp/twitter-roberta-base-sentiment",
                    device=-1  # CPU
                )
    return _classifier

def analyze_sentiment(text: str):
    classifier = get_classifier()
    result = classifier(text)[0]

    # Convert raw labels to human-readable labels
    label_mapping = {
        "LABEL_0": "Negative",
        "LABEL_1": "Neutral",
        "LABEL_2": "Positive"
    }

    raw_label = result["label"]
    human_label = label_mapping.get(raw_label, "Neutral")  # Default to Neutral if unknown
    return human_label, float(result["score"])
