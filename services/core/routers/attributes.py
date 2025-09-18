from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..'))

from shared.database import get_db
from shared.models import Attribute, Template

router = APIRouter()


class AttributeCreate(BaseModel):
    client_id: int
    template_id: int
    value: str


class AttributeUpdate(BaseModel):
    value: Optional[str] = None


@router.get("/attributes/{client_id}", response_model=List[dict])
def get_client_attributes(client_id: int, db: Session = Depends(get_db)):
    attributes = db.query(Attribute).filter(Attribute.client_id == client_id).all()

    result = []
    for attr in attributes:
        template = db.query(Template).filter(Template.id == attr.template_id).first()
        if template:
            result.append({
                "id": attr.id,
                "client_id": attr.client_id,
                "template_id": attr.template_id,
                "key": template.key,
                "value": attr.value,
                "description": template.description,
                "data_type": template.data_type,
                "updated_at": attr.updated_at.isoformat()
            })
    return result


@router.post("/attributes", response_model=dict)
def set_client_attribute(attribute_data: AttributeCreate, db: Session = Depends(get_db)):
    # Check if attribute for this client and template already exists
    attribute = db.query(Attribute).filter(
        Attribute.client_id == attribute_data.client_id,
        Attribute.template_id == attribute_data.template_id
    ).first()

    if attribute:
        attribute.value = attribute_data.value
    else:
        # If not exists, create a new one
        attribute = Attribute(**attribute_data.dict())
        db.add(attribute)

    db.commit()
    db.refresh(attribute)

    # Fetch associated template to return full data
    template = db.query(Template).filter(Template.id == attribute.template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Associated template not found.")

    return {
        "id": attribute.id,
        "client_id": attribute.client_id,
        "template_id": attribute.template_id,
        "key": template.key,
        "value": attribute.value,
        "description": template.description,
        "data_type": template.data_type,
        "updated_at": attribute.updated_at.isoformat()
    }