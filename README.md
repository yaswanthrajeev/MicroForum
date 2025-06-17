## 1. Database Design

  The system contains three main entities:

- `users`: Contains both normal and admin users.
- `posts`: Created by users, with sentiment metadata.
- `comments`: Created on posts, with sentiment metadata.


  1.2 Tables
  
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


