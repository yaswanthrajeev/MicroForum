# 🧩 MicroForum - Component Structure Diagram

## 📁 Project Structure Overview

```
microforum-dev/
├── docker-compose.yml
├── MicroForum/
│   ├── backend/
│   │   ├── alembic/                    # Database migrations
│   │   ├── app/
│   │   │   ├── api/                    # API endpoints
│   │   │   ├── db/                     # Database configuration
│   │   │   ├── messaging/              # Message queue
│   │   │   ├── models/                 # Database models
│   │   │   ├── nlp/                    # NLP services
│   │   │   ├── repositories/           # Data access layer
│   │   │   ├── schemas/                # Pydantic schemas
│   │   │   ├── services/               # Business logic
│   │   │   └── main.py                 # FastAPI application
│   │   ├── requirements.txt
│   │   └── worker.py                   # Sentiment analysis worker
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/             # React components
│   │   │   ├── styles/                 # CSS files
│   │   │   └── App.js                  # Main React app
│   │   └── package.json
│   └── documentation/
└── ARCHITECTURE_DIAGRAM.md
```

---

## 🔧 Backend Component Architecture

```mermaid
graph TB
    subgraph "Entry Point"
        Main[main.py]
        Worker[worker.py]
    end
    
    subgraph "API Layer"
        AuthAPI[api/auth.py]
        PostAPI[api/post.py]
        CommentAPI[api/comment.py]
        AdminAPI[api/admin.py]
    end
    
    subgraph "Service Layer"
        AuthService[services/auth.py]
        PostService[services/post.py]
        CommentService[services/comment.py]
        AdminService[services/admin.py]
        SentimentService[services/sentiment.py]
        JWTService[services/jwt.py]
    end
    
    subgraph "Repository Layer"
        AuthRepo[repositories/admin.py]
        PostRepo[repositories/post.py]
        CommentRepo[repositories/comment.py]
        SentimentRepo[repositories/sentiment.py]
    end
    
    subgraph "Data Models"
        UserModel[models/user.py]
        PostModel[models/post.py]
        CommentModel[models/comment.py]
    end
    
    subgraph "Schemas"
        AuthSchema[schemas/auth.py]
        PostSchema[schemas/post.py]
        CommentSchema[schemas/comment.py]
        UserSchema[schemas/user.py]
    end
    
    subgraph "External Services"
        NLPService[nlp/sentiment.py]
        Publisher[messaging/publisher.py]
        Database[db/session.py]
    end
    
    Main --> AuthAPI
    Main --> PostAPI
    Main --> CommentAPI
    Main --> AdminAPI
    
    AuthAPI --> AuthService
    PostAPI --> PostService
    CommentAPI --> CommentService
    AdminAPI --> AdminService
    
    AuthService --> AuthRepo
    PostService --> PostRepo
    CommentService --> CommentRepo
    AdminService --> AuthRepo
    SentimentService --> SentimentRepo
    
    AuthRepo --> UserModel
    PostRepo --> PostModel
    CommentRepo --> CommentModel
    
    AuthAPI --> AuthSchema
    PostAPI --> PostSchema
    CommentAPI --> CommentSchema
    
    CommentService --> Publisher
    Publisher --> NLPService
    Worker --> NLPService
    
    AuthService --> JWTService
    AuthService --> Database
    PostService --> Database
    CommentService --> Database
    AdminService --> Database
```

---

## 🎨 Frontend Component Architecture

```mermaid
graph TB
    subgraph "Main App"
        App[App.js]
        Router[React Router]
    end
    
    subgraph "Authentication"
        Login[Login.jsx]
        Signup[Signup.jsx]
        Navbar[Navbar.jsx]
    end
    
    subgraph "Content Management"
        AllPosts[AllPosts.jsx]
        CreatePost[CreatePost.jsx]
        CommentSection[CommentSection.jsx]
    end
    
    subgraph "Admin Features"
        AdminDashboard[AdminDashboard.jsx]
        Search[Search.jsx]
    end
    
    subgraph "Styling"
        FormCSS[Form.css]
        PostsCSS[AllPosts.css]
        AdminCSS[AdminDashboard.css]
        NavbarCSS[Navbar.css]
        SearchCSS[Search.css]
    end
    
    App --> Router
    Router --> Login
    Router --> Signup
    Router --> AllPosts
    Router --> CreatePost
    Router --> AdminDashboard
    Router --> Search
    
    AllPosts --> CommentSection
    AllPosts --> Navbar
    CreatePost --> Navbar
    AdminDashboard --> Navbar
    Search --> Navbar
    
    Login --> FormCSS
    Signup --> FormCSS
    CreatePost --> FormCSS
    AllPosts --> PostsCSS
    AdminDashboard --> AdminCSS
    Navbar --> NavbarCSS
    Search --> SearchCSS
```

---

## 🔄 Data Flow Between Components

```mermaid
sequenceDiagram
    participant U as User
    participant N as Navbar
    participant L as Login
    participant P as AllPosts
    participant C as CreatePost
    participant A as AdminDashboard
    participant API as Backend API
    participant DB as Database
    participant MQ as RabbitMQ
    participant W as Worker

    U->>N: Navigate to Login
    N->>L: Show Login Form
    U->>L: Enter Credentials
    L->>API: POST /auth/login
    API->>DB: Verify User
    API-->>L: Return JWT Token
    L->>N: Update Navigation
    N->>P: Show Posts
    P->>API: GET /posts/all
    API->>DB: Fetch Posts
    API-->>P: Return Posts Data
    P-->>U: Display Posts

    U->>C: Create New Post
    C->>API: POST /posts/create
    API->>DB: Save Post
    API-->>C: Return Post Data
    C-->>U: Show Success

    U->>P: Add Comment
    P->>API: POST /comments/create
    API->>DB: Save Comment
    API->>MQ: Publish for Analysis
    MQ->>W: Process Sentiment
    W->>DB: Update Sentiment
    API-->>P: Return Comment Data
    P-->>U: Show Comment

    U->>A: Access Admin Dashboard
    A->>API: GET /admin/sentiment-summary
    API->>DB: Fetch Analytics
    API-->>A: Return Analytics
    A-->>U: Display Charts
```

---

## 🗄️ Database Schema Relationships

```mermaid
erDiagram
    USERS {
        int id PK "Primary Key"
        string username UK "Unique Username"
        string email UK "Unique Email"
        string password_hash "Hashed Password"
        string role "User Role"
        datetime created_at "Creation Timestamp"
        datetime updated_at "Update Timestamp"
        int created_by FK "Created By User"
        int updated_by FK "Updated By User"
    }
    
    POSTS {
        int id PK "Primary Key"
        string title "Post Title"
        string body "Post Content"
        int author_id FK "Author Reference"
        float sentiment_score "Sentiment Score"
        string sentiment_label "Sentiment Label"
        datetime created_at "Creation Timestamp"
        datetime updated_at "Update Timestamp"
        int created_by FK "Created By User"
        int updated_by FK "Updated By User"
    }
    
    COMMENTS {
        int id PK "Primary Key"
        int post_id FK "Post Reference"
        string body "Comment Content"
        int author_id FK "Author Reference"
        float sentiment_score "Sentiment Score"
        string sentiment_label "Sentiment Label"
        datetime created_at "Creation Timestamp"
        datetime updated_at "Update Timestamp"
        int created_by FK "Created By User"
        int updated_by FK "Updated By User"
    }
    
    USERS ||--o{ POSTS : "creates"
    USERS ||--o{ COMMENTS : "creates"
    POSTS ||--o{ COMMENTS : "has"
    USERS ||--o{ USERS : "created_by"
    USERS ||--o{ USERS : "updated_by"
```

---

## 🔐 Security Component Flow

```mermaid
graph TB
    subgraph "Frontend Security"
        TokenStorage[Local Storage]
        AuthState[Auth State]
        ProtectedRoute[Protected Routes]
    end
    
    subgraph "API Security"
        JWTVerification[JWT Verification]
        RoleCheck[Role Authorization]
        InputValidation[Input Validation]
        CORS[CORS Headers]
    end
    
    subgraph "Data Security"
        PasswordHash[Password Hashing]
        SQLInjection[SQL Injection Prevention]
        XSS[XSS Prevention]
    end
    
    subgraph "Service Security"
        AuthService[Authentication Service]
        AdminService[Admin Service]
        Logging[Security Logging]
    end
    
    TokenStorage --> JWTVerification
    AuthState --> ProtectedRoute
    ProtectedRoute --> JWTVerification
    
    JWTVerification --> RoleCheck
    RoleCheck --> InputValidation
    InputValidation --> CORS
    
    AuthService --> PasswordHash
    AdminService --> RoleCheck
    RoleCheck --> Logging
    
    InputValidation --> SQLInjection
    InputValidation --> XSS
```

---

## 📊 Sentiment Analysis Component Flow

```mermaid
graph LR
    subgraph "Input Layer"
        CommentInput[Comment Creation]
        TextExtraction[Text Extraction]
    end
    
    subgraph "Queue Layer"
        MessagePublisher[Message Publisher]
        RabbitMQ[RabbitMQ Server]
        MessageConsumer[Message Consumer]
    end
    
    subgraph "Processing Layer"
        WorkerProcess[Worker Process]
        NLPService[NLP Service]
        ModelInference[Model Inference]
    end
    
    subgraph "Output Layer"
        SentimentResult[Sentiment Result]
        DatabaseUpdate[Database Update]
        DashboardUpdate[Dashboard Update]
    end
    
    CommentInput --> TextExtraction
    TextExtraction --> MessagePublisher
    MessagePublisher --> RabbitMQ
    RabbitMQ --> MessageConsumer
    MessageConsumer --> WorkerProcess
    WorkerProcess --> NLPService
    NLPService --> ModelInference
    ModelInference --> SentimentResult
    SentimentResult --> DatabaseUpdate
    DatabaseUpdate --> DashboardUpdate
```

---

## 🚀 Deployment Component Structure

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end
    
    subgraph "Frontend Layer"
        ReactApp[React Application]
        StaticFiles[Static Assets]
        CDN[Content Delivery]
    end
    
    subgraph "Backend Layer"
        FastAPIServer[FastAPI Server]
        UvicornServer[Uvicorn ASGI]
        LoadBalancer[Load Balancer]
    end
    
    subgraph "Service Layer"
        RabbitMQService[RabbitMQ Service]
        WorkerService[Worker Service]
        DatabaseService[Database Service]
    end
    
    subgraph "Infrastructure"
        Docker[Docker Containers]
        DockerCompose[Docker Compose]
        VolumeStorage[Volume Storage]
    end
    
    Browser --> ReactApp
    Mobile --> ReactApp
    ReactApp --> StaticFiles
    StaticFiles --> CDN
    
    ReactApp --> FastAPIServer
    FastAPIServer --> UvicornServer
    UvicornServer --> LoadBalancer
    
    FastAPIServer --> RabbitMQService
    FastAPIServer --> DatabaseService
    RabbitMQService --> WorkerService
    WorkerService --> DatabaseService
    
    FastAPIServer --> Docker
    RabbitMQService --> Docker
    WorkerService --> Docker
    DatabaseService --> Docker
    
    Docker --> DockerCompose
    DockerCompose --> VolumeStorage
```

---

## 📈 Component Dependencies

### Backend Dependencies
```yaml
FastAPI:
  - uvicorn
  - sqlalchemy
  - pydantic
  - python-jose[cryptography]
  - passlib[bcrypt]
  - python-multipart

Database:
  - sqlite3
  - alembic

Message Queue:
  - pika
  - rabbitmq-server

NLP:
  - transformers
  - torch
  - numpy

Testing:
  - pytest
  - pytest-asyncio
```

### Frontend Dependencies
```yaml
React:
  - react
  - react-dom
  - react-router-dom

HTTP Client:
  - axios

Styling:
  - tailwindcss
  - css modules

Charts:
  - chart.js
  - react-chartjs-2

Development:
  - @vitejs/plugin-react
  - vite
```

---

## 🔄 Component Communication Patterns

### 1. **Synchronous Communication**
- API calls between frontend and backend
- Database queries
- JWT token validation

### 2. **Asynchronous Communication**
- Message queue for sentiment analysis
- Worker process communication
- Event-driven updates

### 3. **State Management**
- React component state
- Local storage for authentication
- Global state for user sessions

### 4. **Error Handling**
- Try-catch blocks in services
- HTTP error responses
- Frontend error boundaries
- Logging and monitoring

This component architecture ensures modularity, maintainability, and scalability of the MicroForum application. 