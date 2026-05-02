# Tareas: Limpieza Idempotente del Estado del CEO (Issue #151)

- [x] Modificar `backend/src/nodes/ceo.ts` para forzar `active_chief`, `next_node` a `undefined`, y `plan` a `[]` si `response.next_step === "finish"`.
- [x] Ejecutar la suite de tests para asegurar que no se rompa ninguna lógica de orquestación.
- [x] Opcionalmente, agregar una prueba en `test-full-autonomy` si existiera un test E2E manual para verificar que el bucle no ocurre.
