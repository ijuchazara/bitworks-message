from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List
from datetime import datetime
import jwt
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from shared.database import get_db, engine
from shared.models import Base, User

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Auth Service")
security = HTTPBearer()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")

class UserCreate(BaseModel):
    email: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    email: str
    created_at: datetime

@app.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(email=user.email)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = jwt.encode({"user_id": new_user.id, "email": new_user.email}, SECRET_KEY, algorithm="HS256")
    return {"access_token": token, "token_type": "bearer"}

@app.post("/login", response_model=Token)
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = jwt.encode({"user_id": db_user.id, "email": db_user.email}, SECRET_KEY, algorithm="HS256")
    return {"access_token": token, "token_type": "bearer"}

@app.get("/verify")
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return {"user_id": payload["user_id"], "email": payload["email"]}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/users", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

class UserAccessRequest(BaseModel):
    email: str

@app.post("/access")
def get_or_create_user(request: UserAccessRequest, db: Session = Depends(get_db)):
    # Buscar o crear usuario
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        user = User(email=request.email)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return {"user_id": user.id, "email": user.email}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)