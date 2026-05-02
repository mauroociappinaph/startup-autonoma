# Tareas: Protocolo Judgment Day en Aduana Sentinel

- [x] Crear el prompt `PROSECUTOR_PROMPT`.
- [x] Crear el prompt `DEFENDER_PROMPT`.
- [x] Crear el prompt `JUDGE_PROMPT`.
- [x] Refactorizar `aduana_sentinel_node.ts` para ejecutar Prosecutor y Defender concurrentemente con `Promise.all`.
- [x] Implementar la lógica de resolución condicional para invocar al `Synthesis Judge` en caso de discrepancia.
- [x] Acumular el uso de tokens y costo combinados en `totalUsage` y `totalCost`.
- [x] Mantener el cálculo correcto del `maxLatency`.
- [x] Escribir suite de pruebas `aduana_sentinel_judgment.test.ts` con cobertura de 4 escenarios (2 consensos y 2 desempates del juez).
- [x] Ejecutar la validación completa en el backend (`npm run test`).
