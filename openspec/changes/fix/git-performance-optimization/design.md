# Design: fix(git) Performance Optimization

## Comandos a Ejecutar

### 1. Mantenimiento de Objetos
```bash
git gc --prune=now --aggressive
```

### 2. Configuración Global/Local
```bash
git config --local fetch.parallel 0  # Usa el máximo posible de hilos
git config --local core.commitGraph true
git config --local gc.writeCommitGraph true
```

### 3. Limpieza de Red
```bash
git remote prune origin
```

## Estructura del Script de Mantenimiento
Se creará `scripts/git-maintenance.sh` con estas tareas agrupadas.
