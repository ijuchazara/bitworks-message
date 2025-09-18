from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List
from datetime import datetime, date
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..'))

from shared.database import get_db
from shared.models import Conversation

router = APIRouter()

class ConversationCreate(BaseModel):
    user_id: int
    title: str

class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    title: str
    created_at: datetime
    updated_at: datetime

@router.post("/conversations", response_model=ConversationResponse)
def create_conversation(conversation: ConversationCreate, db: Session = Depends(get_db)):
    db_conversation = Conversation(**conversation.model_dump())
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation

@router.get("/conversations/{user_id}", response_model=List[ConversationResponse])
def get_user_conversations(user_id: int, db: Session = Depends(get_db)):
    conversations = db.query(Conversation).filter(Conversation.user_id == user_id).all()
    return conversations

@router.get("/conversations/today/{user_id}", response_model=ConversationResponse)
def get_or_create_today_conversation(user_id: int, db: Session = Depends(get_db)):
    today = date.today()
    conversation = db.query(Conversation).filter(
        Conversation.user_id == user_id,
        Conversation.created_at >= today
    ).first()

    if not conversation:
        conversation = Conversation(
            user_id=user_id,
            title=f"Conversación {today.strftime('%d/%m/%Y')}"
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    return conversation