# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copiar archivos de dependencias del backend usando el contexto del root
COPY backend/package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el código del backend y la carpeta de protos al WORKDIR (/app)
COPY backend/ ./
COPY protos/ ./protos/

# Compilar TypeScript (esto generará dist/)
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Instalar curl para healthchecks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copiar dependencias de producción y build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
# Copiar protos a /app/protos para que el resolve('../../../protos') funcione. 
# Si estamos en /app/dist/services/aiEngineClient.js:
# .. -> /app/dist
# .. -> /app
# .. -> /
# Entonces el código buscará en /protos/ai_engine.proto
COPY --from=builder /app/protos /protos

EXPOSE 4000

# Por defecto corremos el compilado
CMD ["node", "dist/index.js"]
