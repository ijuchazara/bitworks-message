from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os

app = FastAPI(title="API Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")
CONVERSATION_SERVICE_URL = os.getenv("CONVERSATION_SERVICE_URL", "http://localhost:8002")
MESSAGE_SERVICE_URL = os.getenv("MESSAGE_SERVICE_URL", "http://localhost:8003")
CONTEXT_SERVICE_URL = os.getenv("CONTEXT_SERVICE_URL", "http://localhost:8004")

async def proxy_request(url: str, method: str, headers: dict = None, json_data: dict = None):
    async with httpx.AsyncClient() as client:
        response = await client.request(method, url, headers=headers, json=json_data)
        try:
            return response.json(), response.status_code
        except:
            return {"error": "Invalid response"}, response.status_code

# Auth routes
@app.post("/auth/register")
async def register(request: Request):
    data = await request.json()
    result, status = await proxy_request(f"{AUTH_SERVICE_URL}/register", "POST", json_data=data)
    if status != 200:
        raise HTTPException(status_code=status, detail=result)
    return result

@app.post("/auth/login")
async def login(request: Request):
    data = await request.json()
    result, status = await proxy_request(f"{AUTH_SERVICE_URL}/login", "POST", json_data=data)
    if status != 200:
        raise HTTPException(status_code=status, detail=result)
    return result

@app.get("/auth/verify")
async def verify(request: Request):
    headers = dict(request.headers)
    result, status = await proxy_request(f"{AUTH_SERVICE_URL}/verify", "GET", headers=headers)
    if status != 200:
        raise HTTPException(status_code=status, detail=result)
    return result

@app.get("/users")
async def get_users():
    result, status = await proxy_request(f"{AUTH_SERVICE_URL}/users", "GET")
    if status != 200:
        raise HTTPException(status_code=status, detail=result)
    return result

@app.post("/access")
async def user_access(request: Request):
    data = await request.json()
    result, status = await proxy_request(f"{AUTH_SERVICE_URL}/access", "POST", json_data=data)
    if status != 200:
        raise HTTPException(status_code=status, detail=result)
    return result

@app.get("/conversations/today/{user_id}")
async def get_today_conversation(user_id: int):
    result, status = await proxy_request(f"{CONVERSATION_SERVICE_URL}/conversations/today/{user_id}", "GET")
    if status != 200:
        raise HTTPException(status_code=status, detail=result)
    return result

# Conversation routes
@app.post("/conversations")
async def create_conversation(request: Request):
    data = await request.json()
    result, status = await proxy_request(f"{CONVERSATION_SERVICE_URL}/conversations", "POST", json_data=data)
    if status != 200:
        raise HTTPException(status_code=status, detail=result)
    return result

@app.get("/conversations/{user_id}")
async def get_conversations(user_id: int):
    result, status = await proxy_request(f"{CONVERSATION_SERVICE_URL}/conversations/{user_id}", "GET")
    if status != 200:
        raise HTTPException(status_code=status, detail=result)
    return result

# Message routes
@app.post("/messages")
async def create_message(request: Request):
    data = await request.json()
    result, status = await proxy_request(f"{MESSAGE_SERVICE_URL}/messages", "POST", json_data=data)
    if status != 200:
        raise HTTPException(status_code=status, detail=result)
    return result

@app.get("/messages/{conversation_id}")
async def get_messages(conversation_id: int):
    result, status = await proxy_request(f"{MESSAGE_SERVICE_URL}/messages/{conversation_id}", "GET")
    if status != 200:
        raise HTTPException(status_code=status, detail=result)
    return result

# Context routes
@app.post("/context")
async def create_context(request: Request):
    data = await request.json()
    result, status = await proxy_request(f"{CONTEXT_SERVICE_URL}/context", "POST", json_data=data)
    if status != 200:
        raise HTTPException(status_code=status, detail=result)
    return result

@app.get("/context/{conversation_id}")
async def get_context(conversation_id: int):
    result, status = await proxy_request(f"{CONTEXT_SERVICE_URL}/context/{conversation_id}", "GET")
    if status != 200:
        raise HTTPException(status_code=status, detail=result)
    return result

# Endpoints REST solicitados
@app.get("/mensaje")
async def add_message(correo: str, mensaje: str):
    result, status = await proxy_request(f"{MESSAGE_SERVICE_URL}/mensaje?correo={correo}&mensaje={mensaje}", "GET")
    if status != 200:
        raise HTTPException(status_code=status, detail=result)
    return result

@app.get("/respuesta")
async def add_response(correo: str, respuesta: str):
    result, status = await proxy_request(f"{MESSAGE_SERVICE_URL}/respuesta?correo={correo}&respuesta={respuesta}", "GET")
    if status != 200:
        raise HTTPException(status_code=status, detail=result)
    return result

@app.get("/historia")
async def get_history(correo: str):
    result, status = await proxy_request(f"{CONVERSATION_SERVICE_URL}/historia?correo={correo}", "GET")
    if status != 200:
        raise HTTPException(status_code=status, detail=result)
    return result

# System Config endpoints
@app.post("/system-config")
async def set_system_config(key: str, value: str):
    result, status = await proxy_request(f"{CONTEXT_SERVICE_URL}/system-config?key={key}&value={value}", "POST")
    if status != 200:
        raise HTTPException(status_code=status, detail=result)
    return result

@app.get("/system-config")
async def get_all_system_configs():
    result, status = await proxy_request(f"{CONTEXT_SERVICE_URL}/system-config", "GET")
    if status != 200:
        raise HTTPException(status_code=status, detail=result)
    return result

@app.get("/system-config/{key}")
async def get_system_config(key: str):
    result, status = await proxy_request(f"{CONTEXT_SERVICE_URL}/system-config/{key}", "GET")
    if status != 200:
        raise HTTPException(status_code=status, detail=result)
    return result

@app.post("/system-config/init")
async def init_system_configs():
    result, status = await proxy_request(f"{CONTEXT_SERVICE_URL}/system-config/init", "POST")
    if status != 200:
        raise HTTPException(status_code=status, detail=result)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)