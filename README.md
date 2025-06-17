# 📘 MicroForum — Design Document

## 1. Database Design

The system consists of three main entities:

- **Users**: Includes both normal and admin users  
- **Posts**: Created by users, with sentiment metadata  
- **Comments**: Created on posts, with sentiment metadata  

---

### 1.1 Tables

#### 🧑 Users Table

| Field         | Type          | Constraints                | Description                   |
|---------------|---------------|----------------------------|-------------------------------|
| id            | UUID / INT PK | PRIMARY KEY                | Unique user ID                |
| username      | TEXT          | UNIQUE, NOT NULL           | Username                      |
| email         | TEXT          | UNIQUE, NOT NULL           | User email address            |
| password_hash | TEXT          | NOT NULL                   | Hashed password               |
| role          | TEXT          | CHECK ('normal', 'admin')  | User role                     |

---

#### 📝 Posts Table

| Field           | Type          | Constraints                | Description                   |
|-----------------|---------------|----------------------------|-------------------------------|
| id              | UUID / INT PK | PRIMARY KEY                | Unique post ID                |
| title           | TEXT          | NOT NULL                   | Title of the post             |
| body            | TEXT          | NOT NULL                   | Main content of the post      |
| author_id       | UUID / INT FK | REFERENCES users(id)       | Author of the post            |
| sentiment_score | FLOAT         |                            | Sentiment score (-1 to 1)     |
| sentiment_label | TEXT          |                            | Sentiment label (Positive/Negative/Neutral) |

---

#### 💬 Comments Table

| Field           | Type          | Constraints                | Description                   |
|-----------------|---------------|----------------------------|-------------------------------|
| id              | UUID / INT PK | PRIMARY KEY                | Unique comment ID             |
| post_id         | UUID / INT FK | REFERENCES posts(id)       | Associated post               |
| body            | TEXT          | NOT NULL                   | Comment text                  |
| author_id       | UUID / INT FK | REFERENCES users(id)       | Author of the comment         |
| sentiment_score | FLOAT         |                            | Sentiment score (-1 to 1)     |
| sentiment_label | TEXT          |                            | Sentiment label               |

---

### 1.2 UML Diagram

<p align="center">
  <img src="/uml.jpg" width="600" alt="UML Diagram" />
</p>

---

## 2. REST API Design

Defines how frontend interacts with backend through HTTP. Each endpoint is mapped to specific roles and permissions.

---

### 🔐 2.1 Authentication (JWT)

| Method | Endpoint        | Description                 | Access       |
|--------|-----------------|-----------------------------|--------------|
| POST   | `/auth/signup`  | Register a new user         | Public       |
| POST   | `/auth/login`   | Authenticate and get token  | Public       |

---

### 👤 2.2 User Endpoints

| Method | Endpoint        | Description             | Access         |
|--------|-----------------|-------------------------|----------------|
| GET    | `/users/me`     | Get current user info   | Authenticated  |
| GET    | `/users/:id`    | Get user by ID          | Admin only     |

---

### 📝 2.3 Post Endpoints

| Method | Endpoint        | Description                             | Access       |
|--------|-----------------|-----------------------------------------|--------------|
| GET    | `/posts/`       | Get all posts                           | Public       |
| GET    | `/posts/:id`    | Get a specific post                     | Public       |
| POST   | `/posts/`       | Create a new post (with sentiment)      | Normal User  |
| DELETE | `/posts/:id`    | Delete your own post                    | Normal User  |

---

### 💬 2.4 Comment Endpoints

| Method | Endpoint                | Description                              | Access       |
|--------|-------------------------|------------------------------------------|--------------|
| POST   | `/posts/:id/comments`   | Add comment to a post (with sentiment)   | Normal User  |
| GET    | `/posts/:id/comments`   | View comments on a post                  | Public       |
| DELETE | `/comments/:id`         | Delete your own comment                  | Normal User  |

---

### 📊 2.5 Admin Analytics Dashboard

| Method | Endpoint                    | Description                              | Access |
|--------|-----------------------------|------------------------------------------|--------|
| GET    | `/admin/sentiment-summary`  | Pie chart: Sentiment distribution        | Admin  |
| GET    | `/admin/sentiment-trend`    | Line chart: Sentiment trend over time    | Admin  |
| GET    | `/admin/sentiment-breakdown`| Bar chart: Sentiment by user/type        | Admin  |
| GET    | `/admin/posts`              | View all posts                           | Admin  |
| GET    | `/admin/comments`           | View all comments                        | Admin  |

---

