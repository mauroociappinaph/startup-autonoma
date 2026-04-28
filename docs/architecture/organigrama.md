# Organigrama de la Startup Autónoma

Este documento define la estructura de mando y ejecución del ecosistema de agentes. La jerarquía es estricta para garantizar la alineación estratégica y la calidad técnica.

## 🗺️ Mapa Jerárquico Actualizado (2026)

```mermaid
graph TD
    User((👤 Usuario)) --> Mirror[🕵️ Mirror Agent]
    Mirror -- "Filtro & HITL" --> User
    Mirror -- "Prompt Refinado" --> CEO[🏢 CEO Agent]
    
    subgraph Chiefs [Capa de Coordinación]
        CEO -- "Delegación Dinámica (Enum)" --> SC[👨‍💼 Software Chief]
        CEO -- "Delegación Dinámica (Enum)" --> BC[💼 Business Chief]
        CEO -- "Delegación Dinámica (Enum)" --> OC[⚙️ Operations Chief]
    end
    
    subgraph Workers [Capa de Ejecución]
        SC --> GW[🛠️ Git Worker]
        SC --> RW[🔍 Research Worker]
        SC --> TR[🧪 Test Runner]
        
        BC --> AIW[🤖 AI Engine Worker]
        BC --> RW
        
        OC --> OW[🏗️ Operations Worker]
        OC --> SD[📊 Sequence Diagram]
    end
    
    subgraph Engine [Motor Externo]
        AIW -- "gRPC (Port 50051)" --> PY[🐍 Python AI-Engine]
        PY --> LGW[🎯 Lead Gen Worker]
        PY --> MAW[📊 Market Analyst]
    end
    
    GW -- Reporte --> SC
    RW -- Reporte --> SC/BC
    TR -- Reporte --> SC
    AIW -- Reporte --> SC/BC
    OW -- Reporte --> OC
    
    SC -- Consolidado --> CEO
    BC -- Consolidado --> CEO
    OC -- Consolidado --> CEO
    
    CEO -- "Resultado Final" --> User
```

## 🎭 Roles y Responsabilidades Clave

### 1. CEO Agent (The Dynamic Orchestrator)
- **Hito:** Ahora usa `CEOResponseSchema` con enums estrictos para evitar alucinaciones en la delegación.
- **Acción:** Mapea misiones a `software_chief` o `business_chief`.

### 2. Business Chief (The Growth Driver)
- **Hito:** Implementado para manejar el pipeline comercial.
- **Acción:** Genera payloads gRPC para el AI Engine pidiendo leads o análisis.

### 3. Operations Chief (The Infrastructure Guardian)
- **Hito:** Implementado para gestionar despliegues, salud del sistema y observabilidad.
- **Acción:** Ejecuta diagnósticos de infraestructura y genera diagramas de secuencia automáticos.

### 4. AI Engine Worker (The Python Bridge)
- **Hito:** Nodo genérico en el backend (Node.js) que se comunica con el AI-Engine (Python).
- **Acción:** Ejecuta tareas de larga duración como scraping sin bloquear el grafo principal.

---

## 🧠 Persistencia Semántica (Engram)
Todos los agentes guardan sus hitos en Engram. 
- `architecture/*`: Decisiones de diseño.
- `achievement/*`: Tareas completadas con éxito.
