from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..'))

from shared.database import get_db
from shared.models import Template

router = APIRouter()

class TemplateCreate(BaseModel):
    key: str
    description: str
    data_type: str
    status: str = 'Activo'

class TemplateUpdate(BaseModel):
    key: Optional[str] = None
    description: Optional[str] = None
    data_type: Optional[str] = None
    status: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str

@router.get("/templates", response_model=List[dict])
def get_all_templates(db: Session = Depends(get_db)):
    templates = db.query(Template).all()
    return [
        {
            "id": t.id,
            "key": t.key,
            "description": t.description,
            "data_type": t.data_type,
            "status": t.status
        }
        for t in templates
    ]

@router.post("/templates", response_model=dict)
def create_template(template: TemplateCreate, db: Session = Depends(get_db)):
    db_template = Template(**template.dict())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return {
        "id": db_template.id,
        "key": db_template.key,
        "description": db_template.description,
        "data_type": db_template.data_type,
        "status": db_template.status
    }

@router.put("/templates/{template_id}", response_model=dict)
def update_template(template_id: int, template_data: TemplateUpdate, db: Session = Depends(get_db)):
    db_template = db.query(Template).filter(Template.id == template_id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")

    update_data = template_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_template, key, value)

    db.commit()
    db.refresh(db_template)
    return {
        "id": db_template.id,
        "key": db_template.key,
        "description": db_template.description,
        "data_type": db_template.data_type,
        "status": db_template.status
    }

@router.put("/templates/{template_id}/status", response_model=dict)
def update_template_status(template_id: int, status_update: StatusUpdate, db: Session = Depends(get_db)):
    db_template = db.query(Template).filter(Template.id == template_id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")

    db_template.status = status_update.status
    db.commit()
    db.refresh(db_template)
    return {
        "id": db_template.id,
        "key": db_template.key,
        "description": db_template.description,
        "data_type": db_template.data_type,
        "status": db_template.status
    }