# Spec: fix(core) CEO Domain Misalignment (#148)

## Requerimientos
1.  **Exclusividad de Documentación**: Toda tarea que implique leer o escribir archivos `.md` debe ser delegada al `SoftwareChief`.
2.  **Restricción de Operaciones**: El `OperationsChief` tiene prohibido realizar cambios en el sistema de archivos del repositorio, excepto en archivos de configuración específicos de infraestructura (ej: `docker-compose.yml`, `Dockerfile`) si se requiere mantenimiento.
3.  **Prioridad de Software**: Si una tarea tiene un componente técnico y uno de documentación, el CEO debe priorizar al `SoftwareChief` o dividir la tarea.

## Casos de Uso
- **Input**: "Documentá la arquitectura del sistema" -> **CEO**: Delegar a `SoftwareChief`.
- **Input**: "Subí los healthchecks y hacé un reporte" -> **CEO**: Delegar a `OperationsChief` (para el deploy) y luego a `SoftwareChief` (para el reporte en `/docs`).

## Criterios de Aceptación
- El CEO nunca debe elegir `operations_chief` para tareas que mencionen "docs", "documentación", "README" o ".md".
