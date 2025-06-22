from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.schemas.auth import UserCreate, UserLogin, Token
from app.services.auth import get_password_hash, verify_password
from app.services.jwt import create_access_token
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/signup", response_model=Token)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    logger.info(f"Attempting signup for user: {user.username}")
    db_user = db.query(User).filter((User.username == user.username) | (User.email == user.email)).first()
    if db_user:
        logger.warning(f"Signup failed for {user.username}: Username or email already registered.")
        raise HTTPException(status_code=400, detail="Username or email already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, email=user.email, hashed_password=hashed_password, role=UserRole.NORMAL)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    access_token = create_access_token({"sub": new_user.username, "role": new_user.role.value})
    logger.debug(f"User {new_user.username} signed up successfully.")
    return {"access_token": access_token, "token_type": "bearer", "role": new_user.role.value}


@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    logger.info(f"Attempting login for user: {user.username}")
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        logger.warning(f"Login failed for user: {user.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token({"sub": db_user.username, "role": db_user.role.value})
    is_admin = db_user.role.value == "admin"
    logger.debug(f"User {user.username} logged in successfully. Admin: {is_admin}")
    return {"access_token": access_token, "token_type": "bearer", "role": db_user.role.value}
