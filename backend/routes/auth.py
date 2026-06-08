from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.database import get_db
from models.models import User
from utils.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "teacher"

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=request.name,
        email=request.email,
        password=hash_password(request.password),
        role=request.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.name
    })

    return {
        "message": f"Account created successfully ✅",
        "token": token,
        "role": user.role,
        "name": user.name
    }

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(request.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.name
    })

    return {
        "message": "Login successful ✅",
        "token": token,
        "role": user.role,
        "name": user.name
    }

@router.post("/create-demo-users")
def create_demo_users(db: Session = Depends(get_db)):
    demo_users = [
        {"name": "Ms. Priya Teacher", "email": "teacher@school.com", "password": "teacher123", "role": "teacher"},
        {"name": "Mr. Admin Singh",   "email": "admin@school.com",   "password": "admin123",   "role": "admin"},
        {"name": "Parent Sharma",     "email": "parent@school.com",  "password": "parent123",  "role": "parent"},
    ]
    for u in demo_users:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            user = User(
                name=u["name"],
                email=u["email"],
                password=hash_password(u["password"]),
                role=u["role"]
            )
            db.add(user)
    db.commit()
    return {"message": "Demo users created ✅"}