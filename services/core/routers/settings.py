from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..'))

from shared.database import get_db
from shared.models import Setting

router = APIRouter()

class SettingCreate(BaseModel):
    key: str
    value: str
    description: str

@router.get("/settings", response_model=List[dict])
def get_all_settings(db: Session = Depends(get_db)):
    settings = db.query(Setting).all()
    return [{"key": s.key, "value": s.value, "description": s.description} for s in settings]

@router.post("/settings", response_model=dict)
def set_setting(setting_data: SettingCreate, db: Session = Depends(get_db)):
    setting = db.query(Setting).filter(Setting.key == setting_data.key).first()
    if setting:
        setting.value = setting_data.value
        setting.description = setting_data.description
    else:
        setting = Setting(**setting_data.dict())
        db.add(setting)
    db.commit()
    db.refresh(setting)
    return {"key": setting.key, "value": setting.value, "description": setting.description}

@router.post("/settings/init")
def init_settings(db: Session = Depends(get_db)):
    defaults = [
        {"key": "webhook_url", "value": "", "description": "URL del webhook principal para n8n."}
    ]
    created = []
    for default in defaults:
        existing = db.query(Setting).filter(Setting.key == default["key"]).first()
        if not existing:
            setting = Setting(**default)
            db.add(setting)
            created.append(default["key"])
    db.commit()
    return {"created": created}