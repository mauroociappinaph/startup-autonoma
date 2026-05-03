# Exploración: Bug #152 - PROJECT_ROOT Incorrecto en fs.ts

## Problema
El worker de filesystem en `backend/src/tools/fs.ts` utiliza una definición estática de `PROJECT_ROOT` basada en `process.cwd()`:

```typescript
const PROJECT_ROOT = path.resolve(process.cwd(), ".."); 
```

Esto falla si el backend se ejecuta desde la raíz del monorepo (usando `npm run dev` que invoca `turbo`), ya que `..` subiría un nivel por encima del repositorio. Si se ejecuta desde la carpeta `backend/`, funciona correctamente para el monorepo.

## Hallazgos
- `process.cwd()` es volátil dependiendo de cómo se inicie el proceso.
- El sandboxing de `validatePath` depende de que `PROJECT_ROOT` sea siempre la raíz del monorepo.
- En `package.json` de la raíz, `dev:backend` hace `npm run dev --prefix backend`, lo cual usualmente no cambia el CWD a menos que el script de destino lo haga.

## Alternativas de Solución
1. **Detección dinámica**: Buscar un archivo marcador (como `package.json` con el nombre del monorepo o `.git`) hacia arriba.
2. **Variable de Entorno**: Definir `PROJECT_ROOT` en el `.env` y usar un fallback.
3. **Localización Relativa al Archivo**: Usar `import.meta.url` para encontrar la raíz basándose en la posición de `fs.ts` dentro de la estructura de carpetas.

## Recomendación
La opción 3 es la más robusta en entornos de desarrollo ya que no depende del CWD. Dado que `fs.ts` está en `backend/src/tools/fs.ts`, la raíz del monorepo está a 3 niveles arriba (`../../../`).

```typescript
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const PROJECT_ROOT = path.resolve(__dirname, "..", "..", "..");
```

## Próximos Pasos
- Verificar la ubicación exacta de `fs.ts` en todos los entornos.
- Crear un test que valide `validatePath` con diferentes rutas simuladas.
