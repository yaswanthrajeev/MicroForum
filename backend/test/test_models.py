from transformers import pipeline
import time
import pandas as pd  # Install with: pip install pandas

# ==============================
# STEP 1: Load All Models
# ==============================
model_name_a = "finiteautomata/bertweet-base-sentiment-analysis"
model_name_b = "cardiffnlp/twitter-roberta-base-sentiment"
model_name_c = "distilbert-base-uncased-finetuned-sst-2-english"

model_a = pipeline("sentiment-analysis", model=model_name_a)
model_b = pipeline("sentiment-analysis", model=model_name_b)
model_c = pipeline("sentiment-analysis", model=model_name_c)

# ==============================
# STEP 2: Test Texts
# ==============================
texts = [
    "I really love this feature! It's amazing.",
    "This is the worst experience I've had.",
    "It's okay, not too bad.",
    "I'm not sure about this.",
    "this is okay",
    "love this",
    "average",
    "not too good, not too bad",
    "I hate this so much.",
    "Best service I've used, highly recommend!",
    "Terrible! Will never use this again.",
    "Quite satisfied, could be better."
]

results = []
# ==============================
# STEP 3: Compare All Models
# ==============================
for text in texts:
    # Model A
    t0 = time.time()
    res_a = model_a(text)[0]
    time_a = time.time() - t0

    # Model B
    t0 = time.time()
    res_b = model_b(text)[0]
    time_b = time.time() - t0

    # Model C
    t0 = time.time()
    res_c = model_c(text)[0]
    time_c = time.time() - t0

    results.append({
        "Text": text,
        "A Label": res_a["label"],
        "A Score": round(res_a["score"], 4),
        "A Time (s)": round(time_a, 4),
        "B Label": res_b["label"],
        "B Score": round(res_b["score"], 4),
        "B Time (s)": round(time_b, 4),
        "C Label": res_c["label"],
        "C Score": round(res_c["score"], 4),
        "C Time (s)": round(time_c, 4),
    })

# ==============================
# STEP 4: Export Results
# ==============================
df = pd.DataFrame(results)

# Print the first few rows
print("\n=== Model Comparison Results (First 5) ===\n")
print(df.head())

# Export to a CSV
csv_file = "sentiment_model_comparison.csv"
df.to_csv(csv_file, index=False)
print(f"\n✅ Results saved to {csv_file}")

