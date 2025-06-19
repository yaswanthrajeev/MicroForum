
from fastapi import HTTPException
from app.models.user import User, UserRole

def get_all_users(db):
    return db.query(User).all()

def promote_to_admin(db,username):
    user=db.query(User).filter(User.username == username).first()
    if not user:
        raise None
    if user.role.value == "admin":
        raise user
    user.role = UserRole.ADMIN
    db.commit()
    db.refresh(user)
    return user