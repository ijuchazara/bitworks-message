from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List
from datetime import datetime
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from shared.database import get_db, engine
from shared.models import Base, Conversation

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Conversation Service")

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

@app.post("/conversations", response_model=ConversationResponse)
def create_conversation(conversation: ConversationCreate, db: Session = Depends(get_db)):
    db_conversation = Conversation(**conversation.model_dump())
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation

@app.get("/conversations/{user_id}", response_model=List[ConversationResponse])
def get_user_conversations(user_id: int, db: Session = Depends(get_db)):
    conversations = db.query(Conversation).filter(Conversation.user_id == user_id).all()
    return conversations

@app.get("/conversations/detail/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: int, db: Session = Depends(get_db)):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

@app.put("/conversations/{conversation_id}", response_model=ConversationResponse)
def update_conversation(conversation_id: int, title: str, db: Session = Depends(get_db)):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation.title = title
    db.commit()
    db.refresh(conversation)
    return conversation

@app.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: int, db: Session = Depends(get_db)):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    db.delete(conversation)
    db.commit()
    return {"message": "Conversation deleted"}

@app.get("/conversations/today/{user_id}", response_model=ConversationResponse)
def get_or_create_today_conversation(user_id: int, db: Session = Depends(get_db)):
    from datetime import date
    
    # Buscar conversación de hoy
    today = date.today()
    conversation = db.query(Conversation).filter(
        Conversation.user_id == user_id,
        Conversation.created_at >= today
    ).first()
    
    # Si no existe, crear nueva conversación
    if not conversation:
        conversation = Conversation(
            user_id=user_id,
            title=f"Conversación {today.strftime('%d/%m/%Y')}"
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
    
    return conversation

@app.get("/historia")
def get_user_history(correo: str, db: Session = Depends(get_db)):
    from shared.models import User, Message, SystemConfig
    from datetime import date, timedelta
    
    # Buscar usuario
    user = db.query(User).filter(User.email == correo).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Obtener configuración de días desde la base de datos
    history_config = db.query(SystemConfig).filter(SystemConfig.key == "history_days").first()
    days = int(history_config.value) if history_config else 30
    
    # Obtener fecha actual y hace X días
    today = date.today()
    cutoff_date = today - timedelta(days=days)
    
    # Filtrar conversaciones por fecha
    conversations = db.query(Conversation).filter(
        Conversation.user_id == user.id,
        Conversation.created_at >= cutoff_date
    ).all()
    
    result = []
    for conv in conversations:
        messages = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.timestamp).all()
        
        conv_data = {
            "id": conv.id,
            "title": conv.title,
            "created_at": conv.created_at.isoformat(),
            "updated_at": conv.updated_at.isoformat(),
            "messages": [
                {
                    "id": msg.id,
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat()
                } for msg in messages
            ]
        }
        result.append(conv_data)
    
    return {"user_email": correo, "conversations": result, "days_range": days}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)