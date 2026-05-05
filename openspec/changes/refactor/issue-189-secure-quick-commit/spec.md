# Spec: Secure Quick-Commit

## Requirements

### REQ-1: Staging Selectivo
El script DEBE usar `git diff --name-only --diff-filter=ACMR` para listar archivos modificados y nuevos, y `git ls-files --others --exclude-standard` para archivos sin trackear que no están en `.gitignore`.

### REQ-2: Sin Archivos Ignorados
El script NO DEBE stagear archivos que estén en `.gitignore`. El flag `--exclude-standard` garantiza esto.

### REQ-3: Guard de Lista Vacía
Si no hay archivos para stagear, el script DEBE mostrar un mensaje claro y salir sin error (exit 0) — puede que el usuario ya haya stageado manualmente.

### REQ-4: Transparencia
El script DEBE mostrar la lista de archivos que va a stagear antes de ejecutar el `git add`.

### REQ-5: Compatibilidad con Staging Manual
Si el usuario ya tiene archivos staged (`git diff --cached`), el script DEBE respetarlos y NO re-stagear todo.

## Scenarios

### Scenario 1 - Happy path
```
GIVEN archivos modificados sin ignorar
WHEN se ejecuta quick-commit
THEN se stagean solo esos archivos y se muestra la lista
```

### Scenario 2 - Archivos ya stageados
```
GIVEN el usuario ya hizo git add de ciertos archivos
WHEN se ejecuta quick-commit
THEN no se re-stagea nada, se usa lo que ya está en el index
```

### Scenario 3 - Sin cambios
```
GIVEN no hay archivos modificados ni staged
WHEN se ejecuta quick-commit  
THEN el script avisa y sale con código 0
```

### Scenario 4 - Solo archivos ignorados modificados
```
GIVEN solo hay archivos en .gitignore modificados (ej: .env, dist/)
WHEN se ejecuta quick-commit
THEN no se stagea ninguno y el script avisa que no hay cambios rastreables
```
