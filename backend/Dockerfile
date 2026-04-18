# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Compilar TypeScript
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copiar dependencias de producción y build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
# Si usamos tsx para correr directo (como en dev), necesitamos el src, 
# pero para prod mejor usar el dist compilado. 
# El script 'dev' usa tsx watch src/index.ts. 
# Crearemos un script 'start' en package.json si no existe.

EXPOSE 4000

# Por defecto corremos el compilado
CMD ["node", "dist/index.js"]
