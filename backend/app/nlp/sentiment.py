from transformers import pipeline

classifier = pipeline(
    "sentiment-analysis",model="cardiffnlp/twitter-roberta-base-sentiment"
    ,
    device=-1  # set -1 for CPU, or specific GPU index
)

def analyze_sentiment(text: str):
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
