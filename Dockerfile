FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements y instalar dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fuente
COPY services/ ./services/
COPY shared/ ./shared/
COPY start_docker.py .

# Exponer puertos
EXPOSE 8000 8001 8002 8003 8004

# Comando por defecto
CMD ["python", "start_docker.py"]