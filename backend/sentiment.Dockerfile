# Use Python 3.12 slim image (smaller and faster)
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc g++ && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements-sentiment.txt .

# Install Python dependencies (including sentiment analysis)
RUN pip install --no-cache-dir -r requirements-sentiment.txt

# Copy application code
COPY app/ ./app/
COPY worker.py .

# Run the sentiment analysis worker
CMD ["python", "worker.py"] 