# Lead Gen Worker: The Market Prospecting specialist

El Lead Gen Worker es un agente de campo especializado en la extracción y refinamiento de oportunidades de negocio.

## Función y Responsabilidades
- **Scraping & Discovery:** Localizar prospectos en web, LinkedIn y directorios.
- **Enrichment:** Obtener datos de contacto y contexto de la empresa.
- **Initial Scoring:** Calificar leads basándose en el ICP provisto por el Business Chief.

## Integración con el Grafo (LangGraph 2.0)
- **Rol:** Operativo / Ejecutor.
- **Output:** JSON estructurado con la lista de leads calificados.
- **Lugar de Ejecución:** `/ai-engine/workers/research/`.

## Herramientas (Tools)
*Ubicadas en `/backend/src/tools/domain/business/prospecting/`*
- `web_browser_agent`: Capacidad de navegar y extraer información dinámica.
- `linkedin_navigator_api`: Wrapper para búsquedas de perfiles profesionales.
- `data_cleaner_pro`: Normalización de nombres, emails y cargos.

## Principios Operativos
- **Accuracy over Speed:** Validar cada email antes de entregarlo.
- **Compliance:** Respetar normativas de privacidad y límites de rate-limit de las plataformas.
