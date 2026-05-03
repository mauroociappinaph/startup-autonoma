# Diseño Técnico: Resolución de Raíz Robusta (Issue #152)

## Arquitectura de Solución
Se implementará una resolución de `PROJECT_ROOT` basada en la ubicación física del archivo `fs.ts`.

### Componentes Afectados
`backend/src/tools/fs.ts`

### Implementación
```typescript
import { fileURLToPath } from 'url';
import path from 'path';

// Obtenemos la ruta absoluta de este archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Subimos desde src/tools/ hasta la raíz del monorepo
// 1. tools -> src
// 2. src -> backend
// 3. backend -> root
const PROJECT_ROOT = path.resolve(__dirname, "..", "..", "..");
```

## Alternativa Descartada: Variable de Entorno
Se descartó depender únicamente de `.env` porque obligaría a todos los desarrolladores y entornos de CI a configurar manualmente la ruta absoluta, lo cual es propenso a errores. La resolución relativa al archivo es automática.

## Impacto en el Estado
No hay impacto en el `AgentStateType`. Es un cambio puramente de infraestructura de herramientas (tools).

## Pruebas de Resiliencia
Se verificará que `path.resolve` maneje correctamente los separadores de ruta en Mac/Linux (el SO actual es Mac).
