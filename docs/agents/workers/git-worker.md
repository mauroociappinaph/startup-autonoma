# Git Worker: The Repository & Filesystem Specialist

El Git Worker es el brazo ejecutor técnico en el entorno de desarrollo local. Su misión es la manipulación precisa del código y el mantenimiento de la integridad del repositorio.

## Función y Responsabilidades
- **Code implementation:** Escribir y modificar archivos siguiendo las specs del Software Chief.
- **Repository Ops:** Manejar branches, commits, merges y pull requests.
- **Isolation:** Utilizar `git worktree` para trabajar en múltiples tareas sin colisiones de estado.

## Integración con el Grafo (LangGraph 2.0)
- **Rol:** Operativo / Ejecutor.
- **Output:** Reporte de cambios, IDs de commits y estado de la salud del repo.
- **Lugar de Ejecución:** `/backend/src/workers/agent.worker.ts`.

## Herramientas (Tools)
*Ubicadas en `/backend/src/tools/platform/git/`*
- `github_cli_wrapper`: Operaciones avanzadas de PRs e Issues.
- `fs_safe_writer`: Escritura de archivos con validación de sintaxis previa.
- `linter_executor`: Ejecución de ruff/eslint antes del commit.

- **Atomic Operations (SRP):** Cada tarea debe resultar en un cambio mínimo y unitario. Archivos de más de 300 líneas deben dividirse.
- **Barrel Files Enforcement:** Cada vez que el Worker crea un módulo, componente o utilidad nueva, TIENE LA OBLIGACIÓN de exportarlo desde el `index.ts` (Barrel file) correspondiente en el mismo PR.
- **Zero Pollution:** No dejar archivos temporales, repetir lógica (romper **DRY**) o arrastrar estados de git "sucios".
