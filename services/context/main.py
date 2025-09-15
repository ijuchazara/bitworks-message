from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, Optional
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from shared.database import get_db, engine
from shared.models import Base, Context

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Context Service")

class ContextCreate(BaseModel):
    conversation_id: int
    context_window: Optional[Dict[str, Any]] = None
    parameters: Optional[Dict[str, Any]] = None

class ContextResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    conversation_id: int
    context_window: Optional[Dict[str, Any]]
    parameters: Optional[Dict[str, Any]]

@app.post("/context", response_model=ContextResponse)
def create_context(context: ContextCreate, db: Session = Depends(get_db)):
    db_context = Context(**context.model_dump())
    db.add(db_context)
    db.commit()
    db.refresh(db_context)
    return db_context

@app.get("/context/{conversation_id}", response_model=ContextResponse)
def get_context(conversation_id: int, db: Session = Depends(get_db)):
    context = db.query(Context).filter(Context.conversation_id == conversation_id).first()
    if not context:
        raise HTTPException(status_code=404, detail="Context not found")
    return context

@app.put("/context/{conversation_id}", response_model=ContextResponse)
def update_context(conversation_id: int, context_data: ContextCreate, db: Session = Depends(get_db)):
    context = db.query(Context).filter(Context.conversation_id == conversation_id).first()
    if not context:
        raise HTTPException(status_code=404, detail="Context not found")
    
    context.context_window = context_data.context_window
    context.parameters = context_data.parameters
    db.commit()
    db.refresh(context)
    return context

@app.delete("/context/{conversation_id}")
def delete_context(conversation_id: int, db: Session = Depends(get_db)):
    context = db.query(Context).filter(Context.conversation_id == conversation_id).first()
    if not context:
        raise HTTPException(status_code=404, detail="Context not found")
    
    db.delete(context)
    db.commit()
    return {"message": "Context deleted"}

# Configuraciones del sistema
@app.post("/system-config")
def set_system_config(key: str, value: str, db: Session = Depends(get_db)):
    from shared.models import SystemConfig
    
    config = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    if config:
        config.value = value
    else:
        config = SystemConfig(key=key, value=value)
        db.add(config)
    
    db.commit()
    db.refresh(config)
    return {"key": config.key, "value": config.value}

@app.get("/system-config/{key}")
def get_system_config(key: str, db: Session = Depends(get_db)):
    from shared.models import SystemConfig
    
    config = db.query(SystemConfig).filter(SystemConfig.key == key).first()
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")
    return {"key": config.key, "value": config.value}

@app.get("/system-config")
def get_all_system_configs(db: Session = Depends(get_db)):
    from shared.models import SystemConfig
    
    configs = db.query(SystemConfig).all()
    return [{"key": c.key, "value": c.value, "description": c.description} for c in configs]

@app.post("/system-config/init")
def init_system_configs(db: Session = Depends(get_db)):
    from shared.models import SystemConfig
    
    defaults = [
        {"key": "ai_role", "value": "Asistente virtual especializado en atención al cliente", "description": "Rol de la IA"},
        {"key": "office_hours", "value": "Lunes a Viernes: 9:00 AM - 6:00 PM", "description": "Horarios de atención"},
        {"key": "available_products", "value": "Producto A, Producto B, Producto C", "description": "Lista de productos"},
        {"key": "webhook_url", "value": "", "description": "URL del webhook"},
        {"key": "history_days", "value": "30", "description": "Días de historial"}
    ]
    
    created = []
    for default in defaults:
        existing = db.query(SystemConfig).filter(SystemConfig.key == default["key"]).first()
        if not existing:
            config = SystemConfig(**default)
            db.add(config)
            created.append(default["key"])
    
    db.commit()
    return {"created": created}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)