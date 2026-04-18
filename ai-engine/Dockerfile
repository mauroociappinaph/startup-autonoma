FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias para gRPC/Python
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY pyproject.toml ./

# Instalar dependencias directamente desde pyproject.toml
# Usamos pip install con las dependencias extraídas o instalamos el paquete
RUN pip install --no-cache-dir .

# Copiar el resto del código
COPY . .

# Exponer el puerto gRPC
EXPOSE 50051

# Comando para iniciar el servidor gRPC
# El archivo principal es app/core/grpc_server.py
CMD ["python", "-m", "app.core.grpc_server"]
