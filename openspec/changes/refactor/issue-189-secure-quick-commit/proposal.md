# Proposal: Secure Quick-Commit - Controlled Git Staging

## Intent
Eliminar el `git add .` indiscriminado del script `quick-commit.ts` y reemplazarlo por un staging selectivo que solo incluya archivos trackeados modificados y nuevos archivos que sean parte del proyecto (no temporales, no archivos ignorados).

## Scope
- **Archivo afectado**: `scripts/quick-commit.ts`
- **Ley violada**: L1 (SRP) — el script hace un staging masivo sin validación
- **Riesgo**: commits con archivos temporales, `.env`, build artifacts, etc.

## Approach
1. Usar `git diff --name-only` + `git ls-files --others --exclude-standard` para construir una lista de archivos staged de forma selectiva.
2. Validar que la lista no esté vacía antes de proceder.
3. Mostrar al usuario qué archivos se van a stagear (transparencia).
4. Evitar stagear archivos en `.gitignore` usando `--exclude-standard`.

## Alternatives Considered
- **`git add -u`**: Solo agrega archivos ya trackeados. Descartado porque no incluye archivos nuevos del proyecto.
- **`--interactive`**: Demasiado manual para un script de velocidad. Descartado.
- **Whitelist de extensiones**: Frágil y difícil de mantener. Descartado.
