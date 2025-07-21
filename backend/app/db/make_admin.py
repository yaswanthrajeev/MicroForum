from app.db.session import SessionLocal
from app.models.user import User, UserRole

def make_admin(username):
    db = SessionLocal()
    user = db.query(User).filter(User.username == username).first()
    if user:
        user.role = UserRole.ADMIN
        db.commit()
        print(f"{username} is now an admin.")
    else:
        print("User not found.")
    db.close()

if __name__ == "__main__":
    make_admin("user2")  # Replace with the username you want to promote