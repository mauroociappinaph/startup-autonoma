# Proposal: Protocolo Judgment Day para Aduana Sentinel (Issue #36)

## Intención
Refactorizar el `AduanaSentinelNode` para que deje de depender de un análisis lineal de un solo modelo y pase a operar mediante el protocolo adversario "Judgment Day". Esto mitigará riesgos de inyecciones sofisticadas al someter cada petición a un equipo rojo (Prosecutor) y un equipo azul (Defender).

## Alcance (Scope)
- **Modificación:** `backend/src/nodes/mirror/aduana_sentinel_node.ts`.
- **Testing:** `backend/src/tests/aduana_sentinel_judgment.test.ts`.
- **No incluido:** No se alterará el formato de emisión de métricas de telemetría más allá de sumarizarlas, ni se modificarán los agentes `CEO` o `Chiefs`.

## Enfoque Arquitectónico

### Lógica de Ejecución Paralela
El nodo utilizará `Promise.all` para lanzar simultáneamente dos consultas usando el método `LLMService.getStructuredData`.

1. **PROSECUTOR_PROMPT:** Instruye al modelo a encontrar vulnerabilidades activamente.
2. **DEFENDER_PROMPT:** Instruye al modelo a entender el contexto de forma legítima.

### Mecanismo de Desempate
- Si las salidas de ambos (`is_injection`) coinciden, el consenso se convierte en el veredicto oficial. Si el consenso es de inyección, se toma el `threat_level` más severo.
- Si las salidas difieren (Contradicción), se invocará de manera secuencial a un tercer modelo: el **JUDGE_PROMPT**. Este tomará los razonamientos previos y desempatará, con prioridad a la seguridad del sistema.

### Persistencia y Auditoría
Los costos (`cost`), latencia (`latency` máxima de la fase paralela + latencia de la fase secuencial si existiese) y uso de tokens se agregarán para reportarse al `EventBus` y mantener el tracking financiero exacto del sistema.
