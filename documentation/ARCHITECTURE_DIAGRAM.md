# 🏗️ MicroForum - Detailed Architecture Diagram

## 📋 System Overview

MicroForum is a full-stack forum application with real-time sentiment analysis, built using modern microservices architecture with message queuing for asynchronous processing.

---

## 🏛️ High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React Frontend]
        Admin[Admin Dashboard]
        Auth[Authentication UI]
    end
    
    subgraph "API Gateway Layer"
        API[FastAPI Backend]
        JWT[JWT Authentication]
        CORS[CORS Middleware]
    end
    
    subgraph "Service Layer"
        AuthService[Auth Service]
        PostService[Post Service]
        CommentService[Comment Service]
        AdminService[Admin Service]
        SentimentService[Sentiment Service]
    end
    
    subgraph "Data Layer"
        DB[(SQLite Database)]
        Repo[Repository Layer]
    end
    
    subgraph "Message Queue"
        RMQ[RabbitMQ]
        Queue[Sentiment Queue]
    end
    
    subgraph "Worker Layer"
        Worker[Sentiment Worker]
        NLP[NLP Service]
    end
    
    subgraph "External Services"
        Model[Transformers Model]
    end
    
    UI --> API
    Admin --> API
    Auth --> API
    
    API --> JWT
    API --> CORS
    
    API --> AuthService
    API --> PostService
    API --> CommentService
    API --> AdminService
    API --> SentimentService
    
    AuthService --> Repo
    PostService --> Repo
    CommentService --> Repo
    AdminService --> Repo
    SentimentService --> Repo
    
    Repo --> DB
    
    CommentService --> RMQ
    RMQ --> Queue
    Queue --> Worker
    Worker --> NLP
    NLP --> Model
    
    Worker --> DB
```

---

## 🔧 Detailed Component Architecture

### 1. Frontend Layer (React)

```mermaid
graph LR
    subgraph "Frontend Components"
        App[App.js]
        Nav[Navbar]
        Login[Login Form]
        Signup[Signup Form]
        Posts[AllPosts]
        Create[CreatePost]
        Comments[CommentSection]
        Admin[AdminDashboard]
        Search[Search]
    end
    
    subgraph "Styling"
        CSS[CSS Modules]
        Tailwind[Tailwind CSS]
    end
    
    subgraph "State Management"
        Local[Local Storage]
        State[React State]
    end
    
    App --> Nav
    App --> Login
    App --> Signup
    App --> Posts
    App --> Create
    App --> Comments
    App --> Admin
    App --> Search
    
    Login --> CSS
    Signup --> CSS
    Posts --> CSS
    Create --> CSS
    Admin --> CSS
    Search --> CSS
    
    Login --> Local
    Signup --> Local
    Posts --> State
    Admin --> State
```

### 2. Backend API Layer (FastAPI)

```mermaid
graph TB
    subgraph "API Routes"
        AuthAPI[/auth]
        PostAPI[/posts]
        CommentAPI[/comments]
        AdminAPI[/admin]
    end
    
    subgraph "Middleware"
        JWT[JWT Verification]
        CORS[CORS Headers]
        Logging[Request Logging]
    end
    
    subgraph "Dependencies"
        DB[Database Session]
        User[Current User]
    end
    
    AuthAPI --> JWT
    PostAPI --> JWT
    CommentAPI --> JWT
    AdminAPI --> JWT
    
    JWT --> User
    User --> DB
    
    AuthAPI --> CORS
    PostAPI --> CORS
    CommentAPI --> CORS
    AdminAPI --> CORS
```

### 3. Service Layer Architecture

```mermaid
graph LR
    subgraph "Service Layer"
        AuthS[Auth Service]
        PostS[Post Service]
        CommentS[Comment Service]
        AdminS[Admin Service]
        SentimentS[Sentiment Service]
    end
    
    subgraph "Repository Layer"
        AuthR[Auth Repo]
        PostR[Post Repo]
        CommentR[Comment Repo]
        AdminR[Admin Repo]
        SentimentR[Sentiment Repo]
    end
    
    subgraph "Models"
        UserM[User Model]
        PostM[Post Model]
        CommentM[Comment Model]
    end
    
    AuthS --> AuthR
    PostS --> PostR
    CommentS --> CommentR
    AdminS --> AdminR
    SentimentS --> SentimentR
    
    AuthR --> UserM
    PostR --> PostM
    CommentR --> CommentM
    AdminR --> UserM
    AdminR --> PostM
    AdminR --> CommentM
```

### 4. Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant S as Service
    participant R as Repository
    participant D as Database
    participant MQ as RabbitMQ
    participant W as Worker
    participant N as NLP

    U->>F: Create Comment
    F->>A: POST /comments/create
    A->>S: create_and_process_comment()
    S->>R: create_comment()
    R->>D: INSERT comment
    S->>MQ: publish_comment_for_analysis()
    MQ->>W: Process message
    W->>N: analyze_sentiment()
    N-->>W: Return sentiment
    W->>D: UPDATE comment sentiment
    W-->>MQ: Acknowledge
    A-->>F: Return comment data
    F-->>U: Show comment
```

---

## 🗄️ Database Schema

```mermaid
erDiagram
    USERS {
        int id PK
        string username UK
        string email UK
        string password_hash
        string role
        datetime created_at
        int created_by FK
        int updated_by FK
        datetime updated_at
    }
    
    POSTS {
        int id PK
        string title
        string body
        int author_id FK
        float sentiment_score
        string sentiment_label
        datetime created_at
        datetime updated_at
        int created_by FK
        int updated_by FK
    }
    
    COMMENTS {
        int id PK
        int post_id FK
        string body
        int author_id FK
        float sentiment_score
        string sentiment_label
        datetime created_at
        datetime updated_at
        int created_by FK
        int updated_by FK
    }
    
    USERS ||--o{ POSTS : "creates"
    USERS ||--o{ COMMENTS : "creates"
    POSTS ||--o{ COMMENTS : "has"
    USERS ||--o{ USERS : "created_by"
    USERS ||--o{ USERS : "updated_by"
```

---

## 🔄 Message Queue Flow

```mermaid
graph LR
    subgraph "Producer"
        Comment[Comment Creation]
        Publisher[Message Publisher]
    end
    
    subgraph "Queue"
        RMQ[RabbitMQ Server]
        Queue[Sentiment Queue]
    end
    
    subgraph "Consumer"
        Worker[Sentiment Worker]
        NLP[NLP Processing]
        DB[Database Update]
    end
    
    Comment --> Publisher
    Publisher --> RMQ
    RMQ --> Queue
    Queue --> Worker
    Worker --> NLP
    NLP --> DB
```

---

## 🔐 Security Architecture

```mermaid
graph TB
    subgraph "Authentication Flow"
        Login[Login Request]
        Verify[Password Verification]
        Token[JWT Token Generation]
        Store[Token Storage]
    end
    
    subgraph "Authorization"
        Request[API Request]
        JWTVerify[JWT Verification]
        RoleCheck[Role Check]
        Access[Access Control]
    end
    
    subgraph "Security Measures"
        Hash[Password Hashing]
        CORS[CORS Protection]
        Validation[Input Validation]
        Logging[Security Logging]
    end
    
    Login --> Verify
    Verify --> Hash
    Verify --> Token
    Token --> Store
    
    Request --> JWTVerify
    JWTVerify --> RoleCheck
    RoleCheck --> Access
    
    Access --> Validation
    Access --> Logging
```

---

## 📊 Sentiment Analysis Pipeline

```mermaid
graph TB
    subgraph "Input"
        Comment[New Comment]
        Text[Comment Text]
    end
    
    subgraph "Processing"
        Queue[Message Queue]
        Worker[Worker Process]
        Model[Transformers Model]
        Analysis[Sentiment Analysis]
    end
    
    subgraph "Output"
        Label[Sentiment Label]
        Score[Sentiment Score]
        Update[Database Update]
        Dashboard[Admin Dashboard]
    end
    
    Comment --> Text
    Text --> Queue
    Queue --> Worker
    Worker --> Model
    Model --> Analysis
    Analysis --> Label
    Analysis --> Score
    Label --> Update
    Score --> Update
    Update --> Dashboard
```

---

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Client"
        Browser[Web Browser]
    end
    
    subgraph "Frontend"
        React[React App]
        Static[Static Files]
    end
    
    subgraph "Backend"
        FastAPI[FastAPI Server]
        Uvicorn[Uvicorn ASGI]
    end
    
    subgraph "Services"
        RabbitMQ[RabbitMQ Server]
        Worker[Worker Process]
    end
    
    subgraph "Data"
        SQLite[SQLite Database]
        Files[File Storage]
    end
    
    Browser --> React
    React --> Static
    Browser --> FastAPI
    FastAPI --> Uvicorn
    FastAPI --> RabbitMQ
    FastAPI --> SQLite
    RabbitMQ --> Worker
    Worker --> SQLite
    Worker --> Files
```

---

## 🔧 Technology Stack

### Frontend
- **Framework**: React 18
- **Styling**: CSS Modules + Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router
- **Charts**: Chart.js + React-Chartjs-2

### Backend
- **Framework**: FastAPI
- **ASGI Server**: Uvicorn
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT with PyJWT
- **Password Hashing**: Passlib with bcrypt
- **Message Queue**: RabbitMQ with pika
- **NLP**: Transformers (Hugging Face)

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Version Control**: Git
- **Database Migrations**: Alembic

---

## 📈 Performance Considerations

### Caching Strategy
- JWT token caching in localStorage
- Database query optimization
- Static asset caching

### Scalability
- Message queue for async processing
- Stateless API design
- Database connection pooling
- Worker process isolation

### Monitoring
- Request/response logging
- Error tracking and reporting
- Performance metrics collection
- Sentiment analysis accuracy monitoring

---

## 🔄 Data Flow Summary

1. **User Authentication**: JWT-based stateless authentication
2. **Content Creation**: Posts and comments with real-time validation
3. **Sentiment Analysis**: Asynchronous processing via message queue
4. **Admin Dashboard**: Real-time sentiment analytics and user management
5. **Data Persistence**: ACID-compliant database operations
6. **Security**: Multi-layer security with input validation and authorization

This architecture provides a scalable, maintainable, and secure forum platform with advanced sentiment analysis capabilities. 