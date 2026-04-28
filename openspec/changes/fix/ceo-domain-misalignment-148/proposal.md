# Proposal: fix(core) CEO Domain Misalignment (#148)

Corregir la lógica de delegación del CEO para evitar que asigne tareas de documentación técnica (Markdown/docs) al `OperationsChief`.

## Problema
El CEO está delegando tareas de creación de documentación al `OperationsChief`. El `OperationsWorker` asociado tiene restricciones de escritura en el directorio `/docs` por seguridad y separación de incumbencias, lo que causa fallos en la ejecución de la misión.

## Solución Propuesta
1.  **Refuerzo de Prompt**: Actualizar el `system_prompt` en `backend/src/nodes/ceo.ts` con una "Matriz de Dominio" explícita.
2.  **Inhibición de Delegación**: Añadir una instrucción negativa fuerte ("Negative Constraint") prohibiendo explícitamente a `OperationsChief` tocar cualquier archivo Markdown o el directorio `/docs`.
3.  **Aclaración de Roles**: Reafirmar que el `SoftwareChief` es el UNICO responsable de la persistencia de conocimiento técnico en el repositorio.

## Riesgos
- Que el CEO se vuelva demasiado rígido y no delegue tareas de infraestructura que incluyan documentación (ej: `README.md` de Docker). Se debe equilibrar la instrucción.
