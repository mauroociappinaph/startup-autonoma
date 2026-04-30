# Proposal: fix(git) Performance Optimization

Optimizar las operaciones de Git (`pull`, `fetch`, `checkout`) mediante el empaquetado de objetos y configuración de parámetros de red y procesamiento.

## Problema
El comando `git pull origin develop` presenta una latencia inusual. La exploración inicial reveló que el repositorio tiene más de 5000 objetos sueltos (unpacked) y 0 packs, lo que obliga a Git a realizar un escaneo ineficiente de archivos individuales.

## Solución Propuesta
1.  **Empaquetado Agresivo**: Ejecutar `git gc --aggressive` para consolidar objetos sueltos en packfiles comprimidos.
2.  **Limpieza de Remotos**: Prunear ramas remotas obsoletas que puedan estar ensuciando el fetch.
3.  **Ajustes de Configuración**:
    - `fetch.parallel`: Habilitar descargas paralelas para submódulos y fetches remotos.
    - `core.commitGraph`: Habilitar el grafo de commits para acelerar el cálculo de logs y merges.
    - `gc.writeCommitGraph`: Asegurar que el grafo se actualice en cada GC.
4.  **Mantenimiento**: Agregar un script de mantenimiento en `scripts/git-maintenance.sh`.

## Riesgos
- El proceso de `git gc --aggressive` puede tardar unos minutos en ejecutarse la primera vez.
