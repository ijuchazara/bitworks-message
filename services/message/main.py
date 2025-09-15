from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List
from datetime import datetime
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from shared.database import get_db, engine
from shared.models import Base, Message

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Message Service")

class MessageCreate(BaseModel):
    conversation_id: int
    role: str
    content: str

class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    conversation_id: int
    role: str
    content: str
    timestamp: datetime

@app.post("/messages", response_model=MessageResponse)
def create_message(message: MessageCreate, db: Session = Depends(get_db)):
    db_message = Message(**message.model_dump())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@app.get("/messages/{conversation_id}", response_model=List[MessageResponse])
def get_conversation_messages(conversation_id: int, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.timestamp).all()
    return messages

@app.get("/messages/detail/{message_id}", response_model=MessageResponse)
def get_message(message_id: int, db: Session = Depends(get_db)):
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message

@app.delete("/messages/{message_id}")
def delete_message(message_id: int, db: Session = Depends(get_db)):
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    db.delete(message)
    db.commit()
    return {"message": "Message deleted"}

@app.get("/mensaje")
def add_user_message(correo: str, mensaje: str, db: Session = Depends(get_db)):
    from shared.models import User, Conversation, SystemConfig
    from datetime import date, timedelta
    
    # Buscar usuario
    user = db.query(User).filter(User.email == correo).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Buscar conversación del día
    today = date.today()
    conversation = db.query(Conversation).filter(
        Conversation.user_id == user.id,
        Conversation.created_at >= today
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="No conversation found for today")
    
    # Crear mensaje
    new_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=mensaje
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    # Obtener configuraciones del sistema
    configs = db.query(SystemConfig).all()
    config_dict = {config.key: config.value for config in configs}
    
    # Obtener historial de conversaciones
    history_days = int(config_dict.get('history_days', '30'))
    cutoff_date = today - timedelta(days=history_days)
    
    conversations = db.query(Conversation).filter(
        Conversation.user_id == user.id,
        Conversation.created_at >= cutoff_date
    ).all()
    
    historial = []
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
        historial.append(conv_data)
    
    # Preparar datos para webhook
    webhook_data = {
        "status": "success",
        "user_id": user.id,
        "message_id": new_message.id,
        "role": config_dict.get('ai_role', 'Asistente virtual'),
        "hours": config_dict.get('office_hours', 'No configurado'),
        "products": [p.strip() for p in config_dict.get('available_products', 'No configurado').split('\n') if p.strip()],
        "history": historial
    }
    
    # Enviar al webhook si está configurado
    webhook_url = config_dict.get('webhook_url', '').strip()
    if webhook_url:
        try:
            import httpx
            with httpx.Client() as client:
                response = client.post(webhook_url, json=webhook_data, timeout=10)
                return {"status": "success", "message_id": new_message.id, "webhook_sent": True, "webhook_status": response.status_code}
        except Exception as e:
            return {"status": "success", "message_id": new_message.id, "webhook_sent": False, "webhook_error": str(e)}
    else:
        return {"status": "success", "message_id": new_message.id, "webhook_sent": False, "webhook_error": "No webhook URL configured"}

@app.get("/respuesta")
def add_ai_response(correo: str, respuesta: str, db: Session = Depends(get_db)):
    from shared.models import User, Conversation
    from datetime import date
    
    # Buscar usuario
    user = db.query(User).filter(User.email == correo).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Buscar conversación del día
    today = date.today()
    conversation = db.query(Conversation).filter(
        Conversation.user_id == user.id,
        Conversation.created_at >= today
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="No conversation found for today")
    
    # Crear respuesta
    new_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=respuesta
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    return {"status": "success", "message_id": new_message.id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)