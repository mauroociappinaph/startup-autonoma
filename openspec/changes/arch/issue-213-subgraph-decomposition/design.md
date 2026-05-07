# Technical Design: Sub-Graph Orchestration

## Architecture Overview

Se implementa una arquitectura jerárquica utilizando `StateGraph` de LangGraph.js. El sistema se divide en:
1. **Orquestador Central (Root Graph)**: Controla el flujo de vida (Sentinel -> CEO -> Circuit Breaker).
2. **Sub-grafos de Dominio (Domain Graphs)**: Encapsulan la lógica de ejecución técnica.

## Component Design

### Root Graph (`backend/src/graph/index.ts`)
El grafo principal actúa como un hub de despacho.
- **Circuit Breaker**: Evalúa el presupuesto y decide si la misión continúa. Si hay un `active_chief` seteado por el CEO, despacha al sub-grafo correspondiente.
- **Nodos de Dominio**: Son instancias compiladas de otros `StateGraph` integradas como nodos.

### Software Domain (`backend/src/graph/domains/software/index.ts`)
- **Software Chief**: Nodo de control interno.
- **Workers**: Git, Test, Code Research, Code Write.
- **Internal Loop**: Chief -> Worker -> Chief.

### Business Domain (`backend/src/graph/domains/business/index.ts`)
- **Business Chief**: Nodo de control interno.
- **Workers**: Researcher, AI Engine, Persistence.

### Operations Domain (`backend/src/graph/domains/operations/index.ts`)
- **Operations Chief**: Nodo de control interno.
- **Workers**: Infrastructure, Security.

## Data Flow

1. El CEO analiza la misión y setea `active_chief = "software_chief"`.
2. El `circuit_breaker` detecta el flag y retorna el nombre del nodo del sub-grafo (`software_domain`).
3. LangGraph entra en el sub-grafo. El estado es compartido vía `AgentAnnotation`.
4. El sub-grafo se ejecuta hasta que el Chief decide `complete`.
5. El sub-grafo termina (`END`), lo que devuelve la ejecución al nodo siguiente en el grafo raíz (siempre el `circuit_breaker` por consistencia).

## Interface Standards

### Node Naming Mapping
| CEO/Chief Decision | Main Graph Node | Sub-Graph Node |
|--------------------|-----------------|----------------|
| `software_chief`   | `software_domain` | `software_chief` |
| `business_chief`   | `business_domain` | `business_chief` |
| `operations_chief` | `operations_domain`| `operations_chief` |
