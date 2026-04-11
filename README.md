# 🤖 Autonomous Startup Ecosystem

> Un ecosistema de agentes jerárquicos diseñado para construir software de forma autónoma utilizando LangGraph, Node.js y Python.

---

## 🏗️ Arquitectura del Sistema

Este proyecto es un **Monorepo (Turborepo)** blindado por leyes arquitectónicas estrictas. Su estructura permite la orquestación distribuida de inteligencia:

*   **`/backend`**: El cerebro orquestador (Node.js). Gestiona el grafo de estados, la persistencia y la lógica de los Agentes Chief.
*   **`/ai-engine`**: El motor de herramientas pesadas (Python). Expone capacidades avanzadas de scraping, ML y reasoning vía MCP.
*   **`/frontend`**: Interfaz de control en tiempo real (Next.js 15) con soporte para Human-in-the-Loop.

## 🚀 Inicio Rápido

### Requisitos
- Node.js v20+
- Python 3.10+
- Turborepo instalado globalmente

### Instalación
```bash
npm install
```

### Desarrollo
Para levantar todos los servicios en simultáneo:
```bash
npm run dev
```

## ⚖️ Leyes Sagradas (The "Sacred Laws")
Este repositorio opera bajo una constitución técnica estricta para garantizar la autonomía de los agentes y la calidad del código. 

**Para entender cómo contribuir y las leyes de arquitectura, lee el [AGENTS.md](./AGENTS.md).**

## 🛠️ Automatización y Calidad
- **Husky**: Hooks de pre-commit y pre-push que validan tipos y arquitectura.
- **Sync Docs**: `npm run sync-docs` para mantener la documentación de estructura al día.
- **ESM Native**: Todo el ecosistema utiliza módulos ES nativos para máxima compatibilidad moderna.

---

*Desarrollado con ❤️ por el equipo de Agentes del Mañana.*
