# Spec: Centralized Environment (#199)

## Requirements

### REQ-1: Fail-Fast en Variables Críticas
Si `REDIS_URL` no está definida en el entorno al arrancar, el proceso DEBE lanzar un `Error` con un mensaje claro que indique qué variable falta y cómo configurarla. NO debe continuar con un valor por defecto.

### REQ-2: Módulo Centralizado de Config
DEBE existir un archivo `backend/src/config/env.ts` que:
- Sea el único punto de acceso a las variables de entorno de infraestructura.
- Valide la presencia de las variables críticas al importarse (efecto de lado controlado).
- Exporte constantes tipadas (`string`, `number`) — nunca `string | undefined`.

### REQ-3: .env.example Actualizado
El `.env.example` DEBE documentar todas las variables del sistema con sus valores de ejemplo o descripción.

### REQ-4: Sin Strings de Conexión en Código
Ningún archivo fuera de `config/env.ts` DEBE contener strings de conexión (`redis://`, `postgresql://`, `localhost:XXXX`) directamente.

## Scenarios

### Scenario 1 - Arranque sin REDIS_URL
```
GIVEN REDIS_URL no está en el entorno
WHEN el backend intenta iniciar
THEN el proceso lanza Error: "[ENV] Variable crítica faltante: REDIS_URL..."
AND el proceso termina con exit code 1
```

### Scenario 2 - Arranque con REDIS_URL configurado
```
GIVEN REDIS_URL=redis://redis:6379 en el entorno
WHEN el backend inicia
THEN la conexión Redis se establece normalmente sin logs de error
```

### Scenario 3 - Variables opcionales sin definir
```
GIVEN LOG_LEVEL no está en el entorno
WHEN el backend inicia
THEN usa el default "info" sin error (comportamiento inalterado)
```
