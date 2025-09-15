# 🐳 Instalación con Docker

## Prerrequisitos
- Docker
- Docker Compose

## Instalación Rápida

1. **Clonar el repositorio:**
```bash
git clone <repository-url>
cd bitworks-message
```

2. **Iniciar con Docker Compose:**
```bash
docker-compose up -d
```

3. **Acceder a la aplicación:**
- Frontend: http://localhost
- API Gateway: http://localhost:8000
- Cliente de pruebas: http://localhost/test.html

## Comandos Útiles

### Ver logs
```bash
docker-compose logs -f
```

### Reiniciar servicios
```bash
docker-compose restart
```

### Detener servicios
```bash
docker-compose down
```

### Reconstruir imágenes
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Acceder a la base de datos
```bash
docker-compose exec postgres psql -U ismael -d ia_message
```

## Configuración

### Variables de entorno
Edita `docker-compose.yml` para cambiar:
- Credenciales de base de datos
- Puertos de exposición

### Persistencia de datos
Los datos de PostgreSQL se guardan en el volumen `postgres_data`

## Estructura de Contenedores

- **postgres**: Base de datos PostgreSQL
- **backend**: Servicios Python (puertos 8000-8004)
- **frontend**: Aplicación React con Nginx (puerto 80)

## Troubleshooting

### Error de conexión a base de datos
```bash
docker-compose logs postgres
docker-compose restart backend
```

### Reconstruir todo desde cero
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```