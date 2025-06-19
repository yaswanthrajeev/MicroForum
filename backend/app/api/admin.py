# api/admin.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services import admin as admin_service

admin_router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@admin_router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    return admin_service.get_all_users(db)

@admin_router.patch("/promote/{username}")
def promote_to_admin(username: str, db: Session = Depends(get_db)):
    user = admin_service.promote_to_admin(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role.value != "admin":
        raise HTTPException(status_code=400, detail="User could not be promoted")
    return {"message": f"User {username} has been promoted to admin", "user": user}