from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..'))

from shared.database import get_db
from shared.models import Client, Attribute, Template

router = APIRouter()


class ClientAttributeData(BaseModel):
    template_id: int
    value: str


class ClientCreate(BaseModel):
    client_code: str
    name: str
    attributes: List[ClientAttributeData] = []


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    attributes: Optional[List[ClientAttributeData]] = None


class StatusUpdate(BaseModel):
    status: str


@router.get("/clients", response_model=List[dict])
def get_clients(db: Session = Depends(get_db)):
    clients = db.query(Client).all()
    return [
        {
            "id": c.id,
            "client_code": c.client_code,
            "name": c.name,
            "status": c.status,
            "created_at": c.created_at.isoformat()
        }
        for c in clients
    ]


@router.post("/clients", response_model=dict)
def create_client(client_data: ClientCreate, db: Session = Depends(get_db)):
    db_client_code = db.query(Client).filter(Client.client_code == client_data.client_code).first()
    if db_client_code:
        raise HTTPException(status_code=400, detail="Client with this code already exists")

    db_client_name = db.query(Client).filter(Client.name == client_data.name).first()
    if db_client_name:
        raise HTTPException(status_code=400, detail="Client with this name already exists")

    db_client = Client(client_code=client_data.client_code, name=client_data.name, status='Activo')
    db.add(db_client)
    db.commit()
    db.refresh(db_client)

    for attr_data in client_data.attributes:
        attribute = Attribute(
            client_id=db_client.id,
            template_id=attr_data.template_id,
            value=attr_data.value
        )
        db.add(attribute)
    db.commit()

    return {
        "id": db_client.id,
        "client_code": db_client.client_code,
        "name": db_client.name,
        "status": db_client.status,
        "created_at": db_client.created_at.isoformat()
    }


@router.put("/clients/{client_code}", response_model=dict)
def update_client(client_code: str, client_data: ClientUpdate, db: Session = Depends(get_db)):
    db_client = db.query(Client).filter(Client.client_code == client_code).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")

    if client_data.name is not None:
        db_client.name = client_data.name
    if client_data.status is not None:
        db_client.status = client_data.status

    db.commit()

    if client_data.attributes is not None:
        for attr_data in client_data.attributes:
            attribute = db.query(Attribute).filter(
                Attribute.client_id == db_client.id,
                Attribute.template_id == attr_data.template_id
            ).first()
            if attribute:
                attribute.value = attr_data.value
            else:
                new_attribute = Attribute(
                    client_id=db_client.id,
                    template_id=attr_data.template_id,
                    value=attr_data.value
                )
                db.add(new_attribute)
        db.commit()

    db.refresh(db_client)
    return {
        "id": db_client.id,
        "client_code": db_client.client_code,
        "name": db_client.name,
        "status": db_client.status,
        "created_at": db_client.created_at.isoformat()
    }


@router.put("/clients/{client_code}/status", response_model=dict)
def update_client_status(client_code: str, status_update: StatusUpdate, db: Session = Depends(get_db)):
    db_client = db.query(Client).filter(Client.client_code == client_code).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")

    db_client.status = status_update.status
    db.commit()
    db.refresh(db_client)
    return {
        "id": db_client.id,
        "client_code": db_client.client_code,
        "name": db_client.name,
        "status": db_client.status,
        "created_at": db_client.created_at.isoformat()
    }