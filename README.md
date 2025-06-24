# MicroForum

A microforum web application with role-based access, sentiment analysis, and an admin dashboard for analytics. Built with FastAPI, React, RabbitMQ, and Docker.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Sentiment Analysis](#sentiment-analysis)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [Docker](#docker)
- [Contributing](#contributing)
- [License](#license)

## Overview
MicroForum is a modern forum application supporting user authentication, post and comment creation, sentiment analysis, and an admin dashboard for analytics. It is designed for easy deployment and scalability using Docker.

## Features
- JWT-based authentication (signup/login)
- Role-based access (normal user/admin)
- Create, view, and delete posts and comments
- Sentiment analysis for posts and comments
- Admin dashboard with sentiment analytics (pie, line, bar charts)
- Asynchronous processing with RabbitMQ
- Containerized with Docker

## Tech Stack
- **Backend:** FastAPI, SQLAlchemy, Pydantic, RabbitMQ
- **Frontend:** React.js, Tailwind CSS
- **Database:** SQLite
- **AI/NLP:** HuggingFace Transformers (Twitter-RoBERTa sentiment model)
- **Containerization:** Docker, Docker Compose

## Architecture
- **API Layer:** Handles HTTP requests and responses (app/api/)
- **Service Layer:** Business logic and async jobs (app/services/)
- **Repository Layer:** Database operations (app/repositories/)
- **Models:** SQLAlchemy ORM models (app/models/)
- **Schemas:** Pydantic data validation (app/schemas/)
- **Message Queue:** RabbitMQ for async sentiment analysis

## AI Model Used
This project uses a transformer-based sentiment analysis model from HuggingFace:
- **Model:** cardiffnlp/twitter-roberta-base-sentiment
- **Type:** RoBERTa, pre-trained and fine-tuned for sentiment analysis on social media and short text (Twitter).
- **Why this model?**
  - Outperformed other tested models (BERTweet, DistilBERT SST-2) in accuracy and speed for forum-style and social text.
  - Provides three sentiment classes: Positive, Neutral, Negative.
  - Easy integration with Python using the `transformers` library.

## Message Queuing & Asynchronous Processing
- **Message Queue:** RabbitMQ is used to handle asynchronous tasks, specifically for sentiment analysis.
- **How it works:**
  - When a post or comment is created, a message is published to a queue.
  - A background worker consumes messages from the queue and performs sentiment analysis using the AI model.
  - The sentiment result is then stored back in the database.
- **Benefits:**
  - Decouples user-facing API from heavy AI processing.
  - Improves responsiveness and scalability.

## General Backend Flow
1. **Client** sends a request (e.g., create post/comment) to the **API Layer** (FastAPI).
2. **API Layer** validates and forwards the request to the **Service Layer**.
3. **Service Layer** handles business logic and, if needed, publishes a message to RabbitMQ for async processing.
4. **Repository Layer** manages database operations (CRUD).
5. **Worker** listens to the message queue, processes sentiment analysis, and updates the database.
6. **Client** can fetch results (posts/comments with sentiment) via API endpoints.

![Architecture Diagram](images/archi.png)



## Sentiment Analysis
Three transformer models were tested:
- **BERTweet** (`finiteautomata/bertweet-base-sentiment-analysis`)
- **Twitter-RoBERTa** (`cardiffnlp/twitter-roberta-base-sentiment`) ← *Selected for best accuracy and speed*
- **DistilBERT SST-2** (`distilbert-base-uncased-finetuned-sst-2-english`)

Twitter-RoBERTa was chosen for its superior performance on social/forum text.

## Setup & Installation
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd microforum-dev
   ```
2. **Backend Setup:**
   ```bash
   cd MicroForum/backend
   pip install -r requirements.txt
   # Set up environment variables as needed
   ```
3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```

## Usage
- Access the frontend at `http://localhost:3000`
- API available at `http://localhost:8000/docs`
- Admin dashboard available after login as admin


## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License
MIT License 
