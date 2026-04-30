# Spec: fix(git) Performance Optimization

## Requerimientos
1.  **Reducción de Objetos Sueltos**: El conteo de objetos sueltos debe ser cercano a 0 tras la optimización.
2.  **Consolidación de Packs**: El tamaño total de `.git` debe reducirse o mantenerse, pero con el 99% de los objetos en packs.
3.  **Configuración Persistente**: Los cambios en `git config` deben ser locales al repositorio para no afectar otros proyectos del usuario.

## Métricas de Éxito
- Reducción del tiempo de `git status` y `git pull` (percepción subjetiva y medición de objetos).
- Presencia de un script de mantenimiento automatizable.

## Escenarios
- **Fetch Remoto**: Debe ejecutarse más rápido al no tener que verificar miles de referencias sueltas.
