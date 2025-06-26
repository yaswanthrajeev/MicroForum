import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.base import Base
from app.models.user import User, UserRole
from app.models.post import Post
from app.models.comment import Comment
from app.services.auth import get_password_hash
from app.services.jwt import create_access_token
import os

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create test database
Base.metadata.create_all(bind=engine)

@pytest.fixture
def db_session():
    """Create a fresh database session for each test"""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    """Create a test client with database dependency override"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides = {}
    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)

@pytest.fixture
def test_user(db_session):
    """Create a test user"""
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=get_password_hash("testpass"),
        role=UserRole.NORMAL
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def test_admin(db_session):
    """Create a test admin user"""
    admin = User(
        username="admin",
        email="admin@example.com",
        hashed_password=get_password_hash("adminpass"),
        role=UserRole.ADMIN
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin

@pytest.fixture
def auth_headers(test_user):
    """Create authentication headers for test user"""
    token = create_access_token({"sub": test_user.username, "role": test_user.role.value})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def admin_headers(test_admin):
    """Create authentication headers for admin user"""
    token = create_access_token({"sub": test_admin.username, "role": test_admin.role.value})
    return {"Authorization": f"Bearer {token}"}

# Import after fixtures
from app.db.session import get_db

class TestAuth:
    def test_signup_success(self, client):
        """Test successful user signup"""
        response = client.post("/auth/signup", json={
            "username": "newuser",
            "email": "new@example.com",
            "password": "newpass"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["role"] == "normal"
    
    def test_signup_duplicate_username(self, client, test_user):
        """Test signup with existing username"""
        response = client.post("/auth/signup", json={
            "username": test_user.username,
            "email": "different@example.com",
            "password": "newpass"
        })
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]
    
    def test_signup_duplicate_email(self, client, test_user):
        """Test signup with existing email"""
        response = client.post("/auth/signup", json={
            "username": "differentuser",
            "email": test_user.email,
            "password": "newpass"
        })
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]
    
    def test_login_success(self, client, test_user):
        """Test successful login"""
        response = client.post("/auth/login", json={
            "username": test_user.username,
            "password": "testpass"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["role"] == "normal"
    
    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials"""
        response = client.post("/auth/login", json={
            "username": "nonexistent",
            "password": "wrongpass"
        })
        
        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["detail"]

class TestPosts:
    def test_create_post_success(self, client, auth_headers):
        """Test successful post creation"""
        response = client.post("/posts/create", 
            json={"title": "Test Post", "body": "Test content"},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test Post"
        assert data["body"] == "Test content"
    
    def test_create_post_unauthorized(self, client):
        """Test post creation without authentication"""
        response = client.post("/posts/create", 
            json={"title": "Test Post", "body": "Test content"}
        )
        
        assert response.status_code == 401
    
    def test_get_all_posts(self, client, db_session, test_user):
        """Test getting all posts"""
        # Create a test post
        post = Post(
            title="Test Post",
            body="Test content",
            author_id=test_user.id
        )
        db_session.add(post)
        db_session.commit()
        
        response = client.get(f"/posts/getAllPost?user_id={test_user.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Test Post"
    
    def test_delete_post_success(self, client, db_session, test_user, auth_headers):
        """Test successful post deletion by author"""
        # Create a test post
        post = Post(
            title="Test Post",
            body="Test content",
            author_id=test_user.id
        )
        db_session.add(post)
        db_session.commit()
        
        response = client.delete(f"/posts/delete/{post.id}", headers=auth_headers)
        
        assert response.status_code == 200
    
    def test_delete_post_unauthorized(self, client, db_session, test_user, auth_headers):
        """Test post deletion by non-author"""
        # Create a test post by different user
        other_user = User(
            username="otheruser",
            email="other@example.com",
            hashed_password=get_password_hash("pass"),
            role=UserRole.NORMAL
        )
        db_session.add(other_user)
        db_session.commit()
        
        post = Post(
            title="Test Post",
            body="Test content",
            author_id=other_user.id
        )
        db_session.add(post)
        db_session.commit()
        
        response = client.delete(f"/posts/delete/{post.id}", headers=auth_headers)
        
        assert response.status_code == 403

class TestComments:
    def test_create_comment_success(self, client, db_session, test_user, auth_headers):
        """Test successful comment creation"""
        # Create a test post
        post = Post(
            title="Test Post",
            body="Test content",
            author_id=test_user.id
        )
        db_session.add(post)
        db_session.commit()
        
        response = client.post(f"/comment/create?post_id={post.id}",
            json={"body": "Test comment"},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["body"] == "Test comment"
        assert data["author_name"] == test_user.username
    
    def test_create_comment_unauthorized(self, client, db_session, test_user):
        """Test comment creation without authentication"""
        # Create a test post
        post = Post(
            title="Test Post",
            body="Test content",
            author_id=test_user.id
        )
        db_session.add(post)
        db_session.commit()
        
        response = client.post(f"/comment/create?post_id={post.id}",
            json={"body": "Test comment"}
        )
        
        assert response.status_code == 401
    
    def test_get_comments(self, client, db_session, test_user):
        """Test getting comments for a post"""
        # Create a test post
        post = Post(
            title="Test Post",
            body="Test content",
            author_id=test_user.id
        )
        db_session.add(post)
        db_session.commit()
        
        # Create a test comment
        comment = Comment(
            body="Test comment",
            post_id=post.id,
            author_id=test_user.id
        )
        db_session.add(comment)
        db_session.commit()
        
        response = client.get(f"/comment/getAllComments/{post.id}/comments")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["body"] == "Test comment"

class TestAdmin:
    def test_get_all_users_admin(self, client, admin_headers, test_user, test_admin):
        """Test admin getting all users"""
        response = client.get("/admin/users", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2  # At least test_user and test_admin
    
    def test_get_all_users_unauthorized(self, client, auth_headers):
        """Test non-admin getting all users"""
        response = client.get("/admin/users", headers=auth_headers)
        
        assert response.status_code == 403
    
    def test_get_all_posts_admin(self, client, admin_headers, db_session, test_user):
        """Test admin getting all posts"""
        # Create a test post
        post = Post(
            title="Test Post",
            body="Test content",
            author_id=test_user.id
        )
        db_session.add(post)
        db_session.commit()
        
        response = client.get("/admin/posts", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
    
    def test_sentiment_summary_admin(self, client, admin_headers):
        """Test admin getting sentiment summary"""
        response = client.get("/admin/sentiment-summary", headers=admin_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "total_posts" in data
        assert "total_comments" in data

class TestErrorHandling:
    def test_invalid_token(self, client):
        """Test API calls with invalid token"""
        headers = {"Authorization": "Bearer invalid-token"}
        
        response = client.get("/admin/users", headers=headers)
        assert response.status_code == 401
    
    def test_missing_token(self, client):
        """Test API calls without token"""
        response = client.get("/admin/users")
        assert response.status_code == 401
    
    def test_invalid_post_id(self, client, auth_headers):
        """Test operations with non-existent post ID"""
        response = client.delete("/posts/delete/99999", headers=auth_headers)
        assert response.status_code == 404
    
    def test_invalid_comment_id(self, client, auth_headers):
        """Test operations with non-existent comment ID"""
        response = client.delete("/comment/delete/99999", headers=auth_headers)
        assert response.status_code == 404 