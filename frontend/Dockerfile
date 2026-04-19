# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (React 19 RC puede necesitar legacy-peer-deps según lo aprendido)
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Construir Next.js
# Nota: Necesitamos las env vars de build si se inyectan en tiempo de compilación
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Instalar curl para healthchecks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copiar dependencias y build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# Comando para iniciar Next.js
CMD ["npm", "run", "start"]
