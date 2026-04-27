# Tareas: Robustecimiento de Observabilidad (#150)

## Preparación e Infraestructura
- [x] Instalación de `winston` en el workspace de backend.
- [x] Crear `backend/src/services/loggerService.ts` con configuración multicanal.
- [x] Refactorizar `backend/src/helpers/logger.ts` para usar `LoggerService`.

## Integración y Refactor
- [ ] `[/]` Migrar `LLMService.ts` para usar niveles de severidad (`info`, `warn`, `error`) en el bucle de resiliencia.
- [ ] Auditar `backend/src/nodes/ceo.ts` y chiefs para reemplazar `console.log` residuales por `SacredLogger.info`.
- [ ] Implementar soporte de `LOG_LEVEL` en la inicialización del Logger.

## Verificación
- [ ] Crear test unitario `backend/src/tests/observability.test.ts` para validar ruteo de niveles.
- [ ] Ejecutar `audit-e2e.ts` y verificar visualmente el formato en consola.
- [ ] Confirmar que los errores críticos incluyen stack trace en el log.
