# 🚀 Standard SDD Workflow (2026 Elite)

Este documento define el ciclo de vida de una tarea en el ecosistema de la Startup Autónoma. El cumplimiento de este flujo es obligatorio para mantener la integridad arquitectónica y la trazabilidad.

## Fase 1: Inicialización y Rama
1. **Verificación de Base**: Asegurar que la rama actual es `develop` y está actualizada.
   - `git checkout develop && git pull origin develop`
2. **Creación de Branch**: Crear una rama descriptiva vinculada a la issue.
   - `git checkout -b feat/issue-[ID]-[slug]`

## Fase 2: Ingeniería (SDD-FF)
1. **Ejecución de SDD**: Correr el comando `/sdd-ff`.
   - Genera: `proposal`, `spec`, `design`, `tasks`.
2. **Sincronización de GitHub**: Actualizar el body de la issue en GitHub con un link a la especificación técnica generada en `openspec/specs/`.

## Fase 3: Implementación (SDD-Apply)
1. **Ciclo de Construcción**: Ejecutar las tareas batch por batch.
2. **Commits Atómicos**: Por cada tarea completada (o batch funcional), realizar un commit siguiendo los Estándares de Git (Conventional Commits).
   - `feat(scope): [descripción de la tarea]`

## Fase 4: Validación y Calidad
1. **Verificación Técnica**: Correr `/sdd-verify`.
   - Debe pasar Tests unitarios/integración y Linters.
2. **Sincronización de Documentación**: Actualizar `AGENTS.md`, `architecture.md` y cualquier otro documento afectado.
3. **Smoke Test Funcional**: Ejecutar un flujo de punta a punta (ej: `test-full-autonomy.ts`) para verificar el comportamiento real del agente.

## Fase 5: Cierre y Merge
1. **Review Final**: El humano (o agente senior) valida el resultado.
2. **Merge a Develop**:
   - `git checkout develop && git merge --no-ff feat/issue-[ID]-[slug]`
3. ** Borrar rama remota y local  **:
   - `git push origin --delete feat/issue-[ID]-[slug]`
   - `git branch -d feat/issue-[ID]-[slug]`
   4. Hacer pull en develop
   - `git checkout develop && git pull origin develop`
5. **Cierre de Issue**: Cerrar la issue en GitHub referenciando el commit de merge.


