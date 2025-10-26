# Use Python 3.11 slim image (better compatibility with ML libraries)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Install system dependencies (including Rust compiler for tokenizers)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*


# Upgrade pip/tools
RUN python -m pip install --upgrade pip setuptools wheel

# Copy requirements first for better caching
COPY requirements-backend.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements-backend.txt -f https://download.pytorch.org/whl/cpu/torch_stable.html

# Copy application code
COPY . .

# Create non-root user

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 