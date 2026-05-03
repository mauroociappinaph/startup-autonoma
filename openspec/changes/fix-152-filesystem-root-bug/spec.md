# Especificación: Arreglar PROJECT_ROOT (Issue #152)

## Requerimientos

### 1. Resolución Absoluta de Raíz
El sistema MUST identificar la raíz del monorepo de forma consistente independientemente de si el proceso se inicia desde `/` o desde `/backend`.

### 2. Sandboxing de Filesystem
La función `validatePath` MUST permitir el acceso a cualquier archivo dentro del monorepo (incluyendo `ai-engine/`, `frontend/`, `packages/`) y denegar el acceso a cualquier archivo fuera del mismo.

### 3. Compatibilidad con ESM
La solución MUST ser compatible con módulos ES (ESM), utilizando `import.meta.url` en lugar de `__dirname` global de CommonJS.

## Casos de Prueba (Scenarios)

### Escenario: Validación de Ruta Interna
- GIVEN un `PROJECT_ROOT` correctamente resuelto.
- WHEN se llama a `validatePath("package.json")`.
- THEN la función MUST retornar la ruta absoluta al package.json de la raíz.

### Escenario: Prevención de Path Traversal
- GIVEN un `PROJECT_ROOT` correctamente resuelto.
- WHEN se llama a `validatePath("../secrets.txt")`.
- THEN la función MUST lanzar un error de "Acceso denegado".

### Escenario: Acceso a otros Workspaces
- GIVEN un `PROJECT_ROOT` correctamente resuelto.
- WHEN se llama a `validatePath("ai-engine/requirements.txt")`.
- THEN la función MUST permitir el acceso y retornar la ruta absoluta correcta.
