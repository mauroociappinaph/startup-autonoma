# Interface & Control Strategy: CLI + Dashboard

La interfaz de la Startup Autónoma evoluciona de una CLI pura a un sistema híbrido **CLI + Dashboard Realtime**.

## 1. CLI (Punto de Entrada)
La CLI sigue siendo el lugar donde el humano da las órdenes iniciales.
- **Mirror Feedback:** El humano aprueba el prompt refinado en la CLI.
- **Direct Commands:** Comandos rápidos para ver estado o forzar terminación.

## 2. Dashboard (Monitoreo de Fase B) 🚧
Ubicado en `/frontend`, este panel Next.js 15 permite:
- **Visualización del Grafo:** Ver qué nodo de LangGraph está activo.
- **SSE Stream:** Un panel lateral que muestra los `[CEO_THOUGHT]`, `[BUSINESS_CHIEF_THOUGHT]`, etc., en tiempo real sin recargar la página.
- **HITL Center:** Botones de "Aprobar" o "Rechazar" cuando el grafo se pausa por un `interrupt_before`.

## 3. Human-in-the-Loop (HITL) Protocol
Puntos de interrupción obligatorios para seguridad:
- **Nivel Rojo:** Gasto de tokens masivo, contacto externo (emails), o deploy de infraestructura.
- **Notificación:** El backend emite un evento SSE y el dashboard se bloquea esperando la acción del usuario.

## 4. Patrones de Diseño UI
- **Atomic Design:** Componentes reutilizables para los reportes de los agentes.
- **Dark Mode by default:** Estética técnica y profesional.
- **Framer Motion:** Animaciones para las transiciones entre nodos del grafo.
