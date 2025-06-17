# 1. Database Design

  The system contains three main entities:

- `users`: Contains both normal and admin users.
- `posts`: Created by users, with sentiment metadata.
- `comments`: Created on posts, with sentiment metadata.


## 1.2 Tables
  
  ####  Users Table

| Field         | Type          | Constraints                | Description                   |
|---------------|---------------|----------------------------|-------------------------------|
| id            | UUID / INT PK | PRIMARY KEY                | Unique user ID                |
| username      | TEXT          | UNIQUE, NOT NULL           | Username                      |
| email         | TEXT          | UNIQUE, NOT NULL           | User email address            |
| password_hash | TEXT          | NOT NULL                   | Hashed password               |
| role          | TEXT          | CHECK ('normal', 'admin')  | User role                     |


---

####  Posts Table

| Field           | Type          | Constraints                | Description                   |
|------------------|---------------|----------------------------|-------------------------------|
| id               | UUID / INT PK | PRIMARY KEY                | Unique post ID                |
| title            | TEXT          | NOT NULL                   | Title of the post             |
| body             | TEXT          | NOT NULL                   | Main content of the post      |
| author_id        | UUID / INT FK | REFERENCES users(id)       | Author of the post            |
| sentiment_score  | FLOAT         |                            | Sentiment score (-1 to 1)     |
| sentiment_label  | TEXT          |                            | Sentiment label               |


---

####  Comments Table

| Field           | Type          | Constraints                | Description                   |
|------------------|---------------|----------------------------|-------------------------------|
| id               | UUID / INT PK | PRIMARY KEY                | Unique comment ID             |
| post_id          | UUID / INT FK | REFERENCES posts(id)       | Associated post               |
| body             | TEXT          | NOT NULL                   | Comment text                  |
| author_id        | UUID / INT FK | REFERENCES users(id)       | Author of the comment         |
| sentiment_score  | FLOAT         |                            | Sentiment score (-1 to 1)     |
| sentiment_label  | TEXT          |                            | Sentiment label               |


## 1.3 UML DIAGRAM

<p align="center">
  <img src="/uml.jpg" width="600"/>
</p>



# 2. REST API Design

This section outlines the RESTful API endpoints for core features like authentication, posts, comments, and sentiment analytics.

---

### 🔐 2.1 Authentication (JWT)

| Method | Endpoint        | Description                 | Access       |
|--------|-----------------|-----------------------------|--------------|
| POST   | `/auth/signup`  | Register a new user         | Public       |
| POST   | `/auth/login`   | Authenticate and get JWT    | Public       |

---

### 🧑‍💻 2.2 User Endpoints

| Method | Endpoint        | Description             | Access       |
|--------|-----------------|-------------------------|--------------|
| GET    | `/users/me`     | Get current user data   | Authenticated|
| GET    | `/users/:id`    | Get user by ID          | Admin        |

---

### 📝 2.3 Post Endpoints

| Method | Endpoint        | Description                             | Access       |
|--------|-----------------|-----------------------------------------|--------------|
| GET    | `/posts/`       | Get all posts                           | Public       |
| GET    | `/posts/:id`    | Get a single post by ID                 | Public       |
| POST   | `/posts/`       | Create a new post (with sentiment)      | Normal User  |
| DELETE | `/posts/:id`    | Delete your own post                    | Normal User  |

---

### 💬 2.4 Comment Endpoints

| Method | Endpoint                | Description                              | Access       |
|--------|-------------------------|------------------------------------------|--------------|
| POST   | `/posts/:id/comments`   | Add a comment to a post (with sentiment) | Normal User  |
| GET    | `/posts/:id/comments`   | Get comments for a post                  | Public       |
| DELETE | `/comments/:id`         | Delete your own comment                  | Normal User  |

---

### 📊 2.5 Admin Analytics Dashboard

| Method | Endpoint                    | Description                              | Access |
|--------|-----------------------------|------------------------------------------|--------|
| GET    | `/admin/sentiment-summary`  | Pie chart: Sentiment distribution        | Admin  |
| GET    | `/admin/sentiment-trend`    | Line chart: Sentiment over time          | Admin  |
| GET    | `/admin/sentiment-breakdown`| Bar chart: Sentiment by user/content     | Admin  |
| GET    | `/admin/posts`              | View all posts                           | Admin  |
| GET    | `/admin/comments`           | View all comments                        | Admin  |





