# Use Python 3.11 slim
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install system deps commonly needed by ML / audio / image libs
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      git \
      curl \
      ca-certificates \
      libsndfile1 \
      libglib2.0-0 \
      libgomp1 && \
    rm -rf /var/lib/apt/lists/*

# Upgrade pip and install wheel first
RUN python -m pip install --upgrade pip setuptools wheel

# Copy requirements and install (cache layer)
COPY requirements-sentiment.txt ./
RUN pip install --no-cache-dir -r requirements-sentiment.txt -f https://download.pytorch.org/whl/cpu/torch_stable.html

# Copy app and worker
COPY app/ ./app/
COPY worker.py ./worker.py

# If your worker uses HF Hub and needs token, document ENV var:
# ARG HUGGINGFACE_TOKEN
# ENV HUGGINGFACE_TOKEN=${HUGGINGFACE_TOKEN}



# Run the worker (unbuffered)
CMD ["python", "-u", "worker.py"]