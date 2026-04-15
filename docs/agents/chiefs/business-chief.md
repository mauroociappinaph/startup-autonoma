# Business Chief: The Product & Growth Lead

El Business Chief es el responsable de la tracción y el valor de mercado. Coordina a los Workers de marketing, ventas e investigación para asegurar que la startup sea competitiva.

## Estado Actual: ✅ OPERATIVO
Implementado como un nodo dinámico en LangGraph que recibe misiones del CEO y delega tareas técnicas al AI Engine o de investigación al Researcher.

## Función y Responsabilidades
- **Market Intelligence:** Supervisar el análisis de competencia y tendencias (delegado al Researcher).
- **Lead Pipeline:** Gestionar el flujo de prospectos desde la búsqueda hasta la calificación (delegado al AI Engine).
- **Value Validation:** Asegurar que los desarrollos del área de Software tengan un "Product-Market Fit" claro.

## Integración con el Grafo (LangGraph 2.0)
- **Rol:** Supervisor de Dominio de Negocio.
- **Nodo:** `business_chief_node`.
- **Comunicación:** Utiliza el esquema `BusinessChiefDecisionSchema` para decidir entre `delegate_to_researcher`, `delegate_to_lead_gen` o `complete`.
- **Handoffs:** Al delegar al AI Engine, inyecta un payload gRPC estructurado en los `additional_kwargs`.

## Estrategia de Memoria (Engram Business)
1. **ICP (Ideal Customer Profile):** Mantiene actualizado en Engram quién es el target para evitar research genérico.
2. **Competitive Map:** Registra debilidades de competidores detectadas por los Workers.
3. **Achievement Records:** Guarda hitos comerciales validados en el topic `achievement/business-chief-delivery`.

## Herramientas (Tools)
- `ai_engine_worker`: Nodo puente gRPC para ejecutar el `lead_gen_worker` en Python.
- `researcher_node`: Para búsquedas de mercado exhaustivas.

## Principios de Negocio
- **Data over Intuition:** Cada sugerencia al CEO debe estar respaldada por evidencia generada por workers.
- **Efficiency first:** Maximizar la tasa de conversión de leads minimizando el gasto de tokens.
