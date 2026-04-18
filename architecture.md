# 🏗️ Proyecto: Startup Autónoma - Arquitectura

## 📜 Principios Fundamentales
1. **Screaming Architecture:** La estructura grita su propósito (Backend Orquestador, Engine IA, Frontend Control).
2. **Jerarquía Estricta:** CEO -> Chiefs -> Workers.
3. **Persistencia Semántica:** Memoria de largo plazo vía Engram (PARA Method).
4. **Calidad de Elite:** Tipado estricto, Leyes Sagradas y Validación en CI/CD.

## 🗺️ Estructura del Repositorio (Actualizada Automáticamente)

```text
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   └── feature_request.yml
│   ├── workflows/
│   │   ├── _dependabot-issue.yml
│   │   ├── ci.yml
│   │   └── test.yml
│   ├── dependabot.yml
│   └── pull_request_template.md
├── .husky/
│   ├── _/
│   │   ├── .gitignore
│   │   ├── applypatch-msg
│   │   ├── commit-msg
│   │   ├── h
│   │   ├── husky.sh
│   │   ├── post-applypatch
│   │   ├── post-checkout
│   │   ├── post-commit
│   │   ├── post-merge
│   │   ├── post-rewrite
│   │   ├── pre-applypatch
│   │   ├── pre-auto-gc
│   │   ├── pre-commit
│   │   ├── pre-merge-commit
│   │   ├── pre-push
│   │   ├── pre-rebase
│   │   └── prepare-commit-msg
│   ├── commit-msg
│   ├── post-merge
│   ├── pre-commit
│   └── pre-push
├── .qwen/
│   ├── settings.json
│   └── settings.json.orig
├── .vscode/
│   └── extensions.json
├── .windsurf/
│   └── workflows/
│       └── sdd-new.md
├── ai-engine/
│   ├── .pytest_cache/
│   │   ├── v/
│   │   │   └── cache/
│   │   │       └── nodeids
│   │   ├── .gitignore
│   │   ├── CACHEDIR.TAG
│   │   └── README.md
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── .gitkeep
│   │   ├── contracts/
│   │   │   ├── __init__.py
│   │   │   └── .gitkeep
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── .gitkeep
│   │   │   └── grpc_server.py
│   │   ├── grpc_generated/
│   │   │   ├── __init__.py
│   │   │   ├── ai_engine_pb2_grpc.py
│   │   │   └── ai_engine_pb2.py
│   │   ├── helpers/
│   │   │   ├── __init__.py
│   │   │   └── .gitkeep
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   └── .gitkeep
│   │   ├── workers/
│   │   │   ├── __init__.py
│   │   │   ├── .gitkeep
│   │   │   └── lead_gen_worker.py
│   │   ├── __init__.py
│   │   └── main.py
│   ├── scripts/
│   │   └── generate_protos.py
│   ├── tests/
│   │   └── .gitkeep
│   ├── .env.example
│   ├── package.json
│   └── pyproject.toml
├── backend/
│   ├── src/
│   │   ├── agents/
│   │   │   └── .gitkeep
│   │   ├── contracts/
│   │   │   ├── ceo.ts
│   │   │   └── researcher.ts
│   │   ├── controllers/
│   │   │   ├── .gitkeep
│   │   │   ├── agentController.ts
│   │   │   └── systemController.ts
│   │   ├── db/
│   │   │   ├── .gitkeep
│   │   │   └── redis.ts
│   │   ├── graph/
│   │   │   ├── checkpoints/
│   │   │   │   └── SimpleRedisSaver.ts
│   │   │   ├── .gitkeep
│   │   │   ├── index.ts
│   │   │   └── state.ts
│   │   ├── helpers/
│   │   │   ├── .gitkeep
│   │   │   └── contextManager.ts
│   │   ├── jobs/
│   │   │   ├── .gitkeep
│   │   │   ├── agentQueue.ts
│   │   │   ├── agentWorker.ts
│   │   │   └── index.ts
│   │   ├── mcp_ports/
│   │   │   └── .gitkeep
│   │   ├── middleware/
│   │   │   └── .gitkeep
│   │   ├── nodes/
│   │   │   ├── chiefs/
│   │   │   │   ├── business_chief.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── software_chief.ts
│   │   │   ├── workers/
│   │   │   │   ├── ai_engine_worker_node.ts
│   │   │   │   ├── code_researcher_node.ts
│   │   │   │   ├── codeResearcher.ts
│   │   │   │   ├── git_worker_node.ts
│   │   │   │   ├── gitWorker.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── persistence_node.ts
│   │   │   │   └── test_runner_node.ts
│   │   │   ├── .gitkeep
│   │   │   ├── ceo.ts
│   │   │   ├── circuit_breaker.ts
│   │   │   ├── mirror.ts
│   │   │   └── researcher.ts
│   │   ├── routes/
│   │   │   ├── .gitkeep
│   │   │   └── agentRoutes.ts
│   │   ├── services/
│   │   │   ├── aiEngineClient.ts
│   │   │   ├── eventBus.ts
│   │   │   ├── graphService.ts
│   │   │   ├── llmFactory.ts
│   │   │   ├── llmService.ts
│   │   │   └── projectService.ts
│   │   ├── skills/
│   │   │   └── .gitkeep
│   │   ├── state/
│   │   │   └── .gitkeep
│   │   ├── tools/
│   │   │   ├── domain/
│   │   │   │   └── software/
│   │   │   │       └── testRunner.ts
│   │   │   ├── platform/
│   │   │   │   └── engram_tool.ts
│   │   │   ├── .gitkeep
│   │   │   ├── fs.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── agent-job.types.ts
│   │   │   ├── business-chief.types.ts
│   │   │   ├── ceo.types.ts
│   │   │   ├── chief.types.ts
│   │   │   ├── code-researcher.types.ts
│   │   │   ├── engram.types.ts
│   │   │   ├── git-worker.types.ts
│   │   │   ├── index.ts
│   │   │   ├── jest-helpers.types.ts
│   │   │   ├── llm.types.ts
│   │   │   ├── mirror.types.ts
│   │   │   ├── project.types.ts
│   │   │   ├── researcher.types.ts
│   │   │   ├── software-chief.types.ts
│   │   │   ├── software-tools.types.ts
│   │   │   └── state.types.ts
│   │   ├── workers/
│   │   │   └── .gitkeep
│   │   ├── index.ts
│   │   ├── test-business-workflow.ts
│   │   ├── test-persistence.ts
│   │   ├── test-run.ts
│   │   └── test-workflow.ts
│   ├── tests/
│   │   ├── .gitkeep
│   │   ├── business_chief.test.ts
│   │   ├── ceo_agent.test.ts
│   │   ├── code_researcher.test.ts
│   │   ├── concurrency_manual.ts
│   │   ├── context_manager.test.ts
│   │   ├── git_worker.test.ts
│   │   ├── llm_factory.test.ts
│   │   ├── mirror_node.test.ts
│   │   ├── software_chief.test.ts
│   │   └── test_runner_node.test.ts
│   ├── .env
│   ├── .prettierrc
│   ├── eslint.config.js
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   ├── agents/
│   │   ├── chiefs/
│   │   │   ├── business-chief.md
│   │   │   └── software-chief.md
│   │   ├── workers/
│   │   │   ├── git-worker.md
│   │   │   └── lead-gen-worker.md
│   │   ├── ceo.md
│   │   └── mirror.md
│   ├── architecture/
│   │   ├── communication-protocol.md
│   │   ├── human-in-the-loop-and-evals.md
│   │   ├── knowledge-retrieval.md
│   │   ├── llm-provider.md
│   │   ├── organigrama.md
│   │   ├── state-management.md
│   │   ├── system-overview.md
│   │   └── tool-development.md
│   ├── memory/
│   │   ├── PARA/
│   │   │   └── projects/
│   │   │       └── startup-autonoma/
│   │   │           ├── items.yaml
│   │   │           └── summary.md
│   │   └── engram-strategy.md
│   ├── ux/
│   │   └── cli-interface.md
│   └── vision.md
├── frontend/
│   ├── public/
│   │   └── .gitkeep
│   ├── src/
│   │   ├── api/
│   │   │   └── .gitkeep
│   │   ├── app/
│   │   │   ├── logs/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   ├── terminal/
│   │   │   │   └── page.tsx
│   │   │   ├── workspace/
│   │   │   │   └── page.tsx
│   │   │   ├── .gitkeep
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── CommandBar.tsx
│   │   │   │   ├── CustomAgentNode.tsx
│   │   │   │   ├── OrchestrationGraph.tsx
│   │   │   │   ├── ReasoningFeed.tsx
│   │   │   │   ├── StrategyCard.tsx
│   │   │   │   └── SystemHealth.tsx
│   │   │   ├── ui/
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   └── index.ts
│   │   │   └── .gitkeep
│   │   ├── helpers/
│   │   │   ├── .gitkeep
│   │   │   ├── index.ts
│   │   │   ├── useAgentStream.ts
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   │   └── .gitkeep
│   │   ├── store/
│   │   │   └── .gitkeep
│   │   ├── styles/
│   │   │   └── .gitkeep
│   │   ├── types/
│   │   │   ├── .gitkeep
│   │   │   ├── index.ts
│   │   │   └── ui.types.ts
│   │   └── index.ts
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── components.json
│   ├── next-env.d.ts
│   ├── next.config.js
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── tsconfig.tsbuildinfo
├── infra/
│   └── .gitkeep
├── protos/
│   └── ai_engine.proto
├── scripts/
│   ├── .gitkeep
│   ├── generate-architecture.js
│   ├── sync-project-structure.js
│   ├── verify-sacred-laws.js
│   └── verify-srp.js
├── skills/
│   └── .gitkeep
├── types/
│   ├── .gitkeep
│   └── index.ts
├── .gitignore
├── .opencodeignore.save
├── AGENTS.md
├── architecture.md
├── commitlint.config.js
├── GEMINI.md
├── package.json
├── README.md
├── tsconfig.json
└── turbo.json
```

---
*Este archivo se actualiza automáticamente en cada commit mediante un hook de Husky.*
