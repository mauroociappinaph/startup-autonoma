# Design: fix(core) CEO Domain Misalignment (#148)

## Cambios en `backend/src/nodes/ceo.ts`

### Matriz de Dominio (Prompt Update)
Se inyectará una sección de "DOMAIN GUARDRAILS" en el `system_prompt`.

```text
DOMAIN GUARDRAILS:
- SOFTWARE_CHIEF: Dueño absoluto de /src, /docs, y cualquier archivo .md.
- OPERATIONS_CHIEF: Dueño de /infra, docker-compose.yml y Dockerfile. PROHIBIDO escribir en /docs o modificar lógica de negocio.
- BUSINESS_CHIEF: Dueño de /market y análisis externos. NO toca código ni documentación técnica.
```

### Lógica de Verificación (Opcional)
Si el modelo persiste en fallar, se podría añadir una validación post-estructurada en el nodo, pero el refuerzo del prompt debería ser suficiente para un modelo `opus` o `sonnet`.

## Flujo de Trabajo
1. El CEO recibe la instrucción.
2. Compara el dominio de la tarea contra la `DOMAIN GUARDRAILS`.
3. Elige el Chief basándose en la ubicación de los archivos afectados.
