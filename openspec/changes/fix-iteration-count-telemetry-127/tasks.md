# Tareas: Robustecimiento de Estado y Telemetría (#127)

## Fase 1: Infraestructura
- [ ] 1.1 Crear el archivo `backend/src/helpers/stateHelper.ts` con la función `prepareNodeUpdate`.
- [ ] 1.2 Crear el test unitario `backend/src/tests/state_helper.test.ts` para validar el incremento de iteraciones y acumulación de costos.

## Fase 2: Refactorización de Nodos
- [ ] 2.1 Refactorizar `backend/src/nodes/ceo.ts`: Integrar el helper y eliminar hardcodes.
- [ ] 2.2 Refactorizar `backend/src/nodes/chiefs/software_chief.ts`: Integrar el helper y corregir reset de iteración.
- [ ] 2.3 Refactorizar `backend/src/nodes/chiefs/business_chief.ts`: Integrar el helper y corregir reset de iteración.

## Fase 3: Verificación Final
- [ ] 3.1 Ejecutar suite completa de tests: `npm run test --prefix backend`.
- [ ] 3.2 Verificar manualmente en logs el incremento del `iteration_count`.
- [ ] 3.3 Borrar archivos temporales de exploración/diseño (opcional al terminar).
