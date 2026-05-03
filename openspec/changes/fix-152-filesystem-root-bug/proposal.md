# Propuesta: Arreglar Definición de PROJECT_ROOT en fs.ts (Issue #152)

## Intento
Corregir la resolución de la raíz del proyecto en las herramientas de filesystem para asegurar que el sandboxing funcione correctamente sin importar el directorio de trabajo actual (CWD).

## Alcance
- **Modificar**: `backend/src/tools/fs.ts`.
- **Afecta**: Todas las herramientas de filesystem (`list_dir`, `read_file`, `write_file`, `patch_file`).

## Enfoque Propuesto
Usar `import.meta.url` para derivar `PROJECT_ROOT` de forma relativa a la ubicación del archivo en el disco, en lugar de confiar en `process.cwd()`.

```typescript
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
// fs.ts está en backend/src/tools/
// Subimos 3 niveles: tools -> src -> backend -> root
const PROJECT_ROOT = path.resolve(__dirname, "..", "..", "..");
```

## Riesgos
- **Entornos Productivos**: Si el código se compila o se empaqueta de forma que la estructura de carpetas cambie (ej: `dist/`), la resolución relativa podría fallar.
- **Solución**: Agregar un chequeo que verifique la existencia de `package.json` o usar una variable de entorno `APP_ROOT` como prioridad.

## Plan de Verificación
1. **Tests Unitarios**: Crear `backend/src/tests/fs_root.test.ts` que intente listar la raíz usando la herramienta y verifique que no lance errores de acceso denegado.
2. **Validación de CWD**: Ejecutar el test desde la raíz del monorepo y desde la carpeta `backend/`.
