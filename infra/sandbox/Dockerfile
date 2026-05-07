FROM node:20-alpine

# Instalar dependencias necesarias para el agente
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    bash \
    curl

# Configurar el directorio de trabajo
WORKDIR /workspace

# El contenedor se mantiene vivo esperando comandos vía 'docker exec'
CMD ["tail", "-f", "/dev/null"]
