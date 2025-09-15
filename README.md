# Sistema de Historial de Conversaciones IA

Sistema de microservicios para gestión de conversaciones con IA usando FastAPI, PostgreSQL, Redis, RabbitMQ y React.

## 🏗️ Arquitectura

- **Auth Service** (Puerto 8001): Autenticación JWT
- **Conversation Service** (Puerto 8002): CRUD conversaciones
- **Message Service** (Puerto 8003): Gestión de mensajes
- **Context Service** (Puerto 8004): Contexto IA y ventana deslizante
- **API Gateway** (Puerto 8000): Punto de entrada y routing
- **Frontend React** (Puerto 3000): Interfaz de usuario

## 🚀 Desarrollo Local

### Prerrequisitos
- Python 3.8+
- Node.js 16+
- PostgreSQL

### Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd bitworks-message
```

2. Configurar entorno de desarrollo:
```bash
python setup_dev.py
```

3. Configurar base de datos PostgreSQL:
```sql
CREATE DATABASE conversation_system;
```

4. Iniciar todos los servicios:
```bash
python start_dev.py
```

5. Acceder a la aplicación:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8000

## 📊 Modelos de Datos

### Users
- id, email, created_at

### Conversations
- id, user_id, title, created_at, updated_at

### Messages
- id, conversation_id, role, content, timestamp

### Context
- id, conversation_id, context_window, parameters

## 🔧 APIs Disponibles

### Autenticación
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Login de usuario
- `GET /auth/verify` - Verificar token

### Conversaciones
- `POST /conversations` - Crear conversación
- `GET /conversations/{user_id}` - Obtener conversaciones del usuario
- `PUT /conversations/{id}` - Actualizar conversación
- `DELETE /conversations/{id}` - Eliminar conversación

### Mensajes
- `POST /messages` - Crear mensaje
- `GET /messages/{conversation_id}` - Obtener mensajes de conversación
- `DELETE /messages/{id}` - Eliminar mensaje

### Contexto
- `POST /context` - Crear contexto
- `GET /context/{conversation_id}` - Obtener contexto
- `PUT /context/{conversation_id}` - Actualizar contexto
- `DELETE /context/{conversation_id}` - Eliminar contexto

## 🛠️ Desarrollo

### Estructura del Proyecto
```
bitworks-message/
├── services/           # Microservicios
│   ├── auth/           # Autenticación (8001)
│   ├── conversation/   # Conversaciones (8002)
│   ├── message/        # Mensajes (8003)
│   ├── context/        # Contexto + Config (8004)
│   └── gateway/        # API Gateway (8000)
├── frontend/           # React App (3000)
├── shared/             # Código compartido
├── requirements.txt    # Dependencias Python
├── setup_dev.py        # Configuración inicial
└── start_dev.py        # Iniciar servicios
```

### Variables de Entorno
- `DATABASE_URL`: URL de PostgreSQL (default: postgresql://ismael:mipass@localhost:5432/ia_message)
- `SECRET_KEY`: Clave secreta para JWT

## 📝 Comandos de Desarrollo

- `python setup_dev.py` - Configurar entorno inicial
- `python start_dev.py` - Iniciar todos los servicios
- Ctrl+C - Detener todos los servicios

## 📝 Notas de Implementación

- Desarrollo local sin Docker
- Funcionalidad core implementada
- APIs REST robustas para consumo externo
- Base escalable para futuras optimizaciones
- Redis y RabbitMQ se implementarán posteriormente