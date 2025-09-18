from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import date
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..'))

from shared.database import get_db
from shared.models import User, Client, Conversation, Message

router = APIRouter()


class UserAccessRequest(BaseModel):
    username: str
    client_code: str


@router.get("/users", response_model=List[dict])
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": user.id,
            "username": user.username,
            "status": user.status,
            "created_at": user.created_at.isoformat(),
            "client_id": user.client_id,
            "client_code": user.client.client_code if user.client else "N/A",
            "client_name": user.client.name if user.client else "N/A"
        }
        for user in users
    ]


@router.get("/clients/{client_code}/users", response_model=List[dict])
def get_users_for_client(client_code: str, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.client_code == client_code).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    users = db.query(User).filter(User.client_id == client.id).all()
    return [
        {
            "id": user.id,
            "username": user.username
        }
        for user in users
    ]


@router.get("/load_conversation", response_model=dict)
def load_conversation(client_code: str, username: str, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.client_code == client_code, Client.status == 'Activo').first()
    if not client:
        raise HTTPException(status_code=404, detail=f"Cliente con código '{client_code}' no encontrado o inactivo.")

    user = db.query(User).filter(User.username == username, User.client_id == client.id).first()

    if not user:
        user = User(username=username, client_id=client.id)
        db.add(user)
        db.commit()
        db.refresh(user)

    today = date.today()
    conversation = db.query(Conversation).filter(
        Conversation.user_id == user.id,
        Conversation.created_at >= today
    ).first()

    if not conversation:
        conversation = db.query(Conversation).filter(
            Conversation.user_id == user.id
        ).order_by(Conversation.created_at.desc()).first()

    messages = []
    conversation_id = None
    if conversation:
        conversation_id = conversation.id
        messages = db.query(Message).filter(Message.conversation_id == conversation.id).order_by(
            Message.timestamp).all()

    return {
        "user_id": user.id,
        "username": user.username,
        "client_id": user.client_id,
        "client_code": user.client.client_code,
        "client_name": user.client.name,
        "conversation_id": conversation_id,
        "messages": [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat()
            }
            for msg in messages
        ]
    }