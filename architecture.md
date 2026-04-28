# 🏗️ Proyecto: Startup Autónoma - Arquitectura

## 📜 Principios Fundamentales
1. **Screaming Architecture:** La estructura grita su propósito (Backend Orquestador, Engine IA, Frontend Control).
2. **Jerarquía Estricta:** CEO -> Chiefs -> Workers.
3. **Persistencia Semántica:** Memoria de largo plazo vía Engram (PARA Method).
4. **Calidad de Elite:** Tipado estricto, Leyes Sagradas y Validación en CI/CD.
5. **Observability Architect:** Visibilidad total del flujo vía diagramas de secuencia y trazabilidad gRPC.

## 🗺️ Estructura del Repositorio (Actualizada Automáticamente)

```text
├── .atl/
│   └── skill-registry.md
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   ├── feature_request.yml
│   │   └── refactor_request.yml
│   ├── workflows/
│   │   ├── _dependabot-issue.yml
│   │   └── ci.yml
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
│   ├── .ruff_cache/
│   │   ├── 0.15.11/
│   │   │   ├── 17863837009432448284
│   │   │   ├── 3444622322250119880
│   │   │   ├── 606851975018145708
│   │   │   ├── 8144735202343255292
│   │   │   └── 9421679760194198113
│   │   ├── .gitignore
│   │   └── CACHEDIR.TAG
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── .gitkeep
│   │   ├── contracts/
│   │   │   ├── __init__.py
│   │   │   ├── .gitkeep
│   │   │   └── lead_gen.py
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
│   │   ├── .gitkeep
│   │   └── test_dummy.py
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── pyproject.toml
├── backend/
│   ├── docs/
│   │   └── architecture/
│   │       └── sequences/
│   │           └── sequence_1777389244400.mmd
│   ├── scratch/
│   │   ├── debug_regex.js
│   │   ├── debug_tests.ts
│   │   ├── git_debug_stdout.txt
│   │   └── test_mcp_integration.ts
│   ├── scripts/
│   │   ├── check-grpc-sync.ts
│   │   └── stress-test.ts
│   ├── src/
│   │   ├── agents/
│   │   │   └── .gitkeep
│   │   ├── config/
│   │   │   └── pricing.ts
│   │   ├── controllers/
│   │   │   ├── .gitkeep
│   │   │   ├── agentController.ts
│   │   │   ├── index.ts
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
│   │   │   ├── contextManager.ts
│   │   │   ├── diagramHelper.ts
│   │   │   ├── graphFormatter.ts
│   │   │   ├── index.ts
│   │   │   ├── logger.ts
│   │   │   ├── operationsHelper.ts
│   │   │   └── stateHelper.ts
│   │   ├── jobs/
│   │   │   ├── .gitkeep
│   │   │   ├── agentQueue.ts
│   │   │   ├── agentWorker.ts
│   │   │   ├── index.ts
│   │   │   └── janitorWorker.ts
│   │   ├── mcp_ports/
│   │   │   ├── .gitkeep
│   │   │   ├── engramPort.ts
│   │   │   ├── index.ts
│   │   │   └── toolRegistry.ts
│   │   ├── middleware/
│   │   │   ├── .gitkeep
│   │   │   └── tracingMiddleware.ts
│   │   ├── nodes/
│   │   │   ├── chiefs/
│   │   │   │   ├── business_chief.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── operations_chief.ts
│   │   │   │   └── software_chief.ts
│   │   │   ├── mirror/
│   │   │   │   ├── aduana_sentinel_node.ts
│   │   │   │   └── index.ts
│   │   │   ├── workers/
│   │   │   │   ├── ai_engine_worker_node.ts
│   │   │   │   ├── code_researcher_node.ts
│   │   │   │   ├── code_writer_node.ts
│   │   │   │   ├── codeResearcher.ts
│   │   │   │   ├── documentation_worker.ts
│   │   │   │   ├── git_worker_node.ts
│   │   │   │   ├── gitWorker.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── operations_worker_node.ts
│   │   │   │   ├── persistence_node.ts
│   │   │   │   ├── review_worker.ts
│   │   │   │   ├── security_worker.ts
│   │   │   │   └── test_runner_node.ts
│   │   │   ├── .gitkeep
│   │   │   ├── ceo.ts
│   │   │   ├── circuit_breaker.ts
│   │   │   ├── index.ts
│   │   │   ├── mirror.ts
│   │   │   ├── researcher.ts
│   │   │   └── security_blocked.ts
│   │   ├── routes/
│   │   │   ├── .gitkeep
│   │   │   ├── agentRoutes.ts
│   │   │   └── index.ts
│   │   ├── scripts/
│   │   │   ├── audit-e2e.ts
│   │   │   └── test-janitor.ts
│   │   ├── services/
│   │   │   ├── aiEngineClient.ts
│   │   │   ├── auditService.ts
│   │   │   ├── budgetService.ts
│   │   │   ├── eventBus.ts
│   │   │   ├── graphService.ts
│   │   │   ├── index.ts
│   │   │   ├── llmFactory.ts
│   │   │   ├── llmService.ts
│   │   │   ├── loggerService.ts
│   │   │   ├── projectService.ts
│   │   │   ├── sandboxService.ts
│   │   │   ├── telemetryService.ts
│   │   │   └── traceContext.ts
│   │   ├── skills/
│   │   │   └── .gitkeep
│   │   ├── state/
│   │   │   ├── .gitkeep
│   │   │   └── index.ts
│   │   ├── tests/
│   │   │   ├── .gitkeep
│   │   │   ├── aduana_sentinel_node.test.ts
│   │   │   ├── budget_usd.test.ts
│   │   │   ├── business_chief.test.ts
│   │   │   ├── ceo_agent.test.ts
│   │   │   ├── ceo_routing.test.ts
│   │   │   ├── code_researcher.test.ts
│   │   │   ├── context_manager.test.ts
│   │   │   ├── diagram_helper.test.ts
│   │   │   ├── engramPort.test.ts
│   │   │   ├── eventBus.test.ts
│   │   │   ├── fs_tools.test.ts
│   │   │   ├── git_worker.test.ts
│   │   │   ├── graphFormatter.test.ts
│   │   │   ├── graphService_hitl.test.ts
│   │   │   ├── health.test.ts
│   │   │   ├── llm_factory.test.ts
│   │   │   ├── mirror_node.test.ts
│   │   │   ├── operations_chief.test.ts
│   │   │   ├── operations_contract.test.ts
│   │   │   ├── operations_integration.test.ts
│   │   │   ├── operations_worker.test.ts
│   │   │   ├── operationsHelper.test.ts
│   │   │   ├── sequential_thinking.test.ts
│   │   │   ├── software_chief.test.ts
│   │   │   ├── state_helper.test.ts
│   │   │   ├── telemetry.test.ts
│   │   │   ├── test_runner_node.test.ts
│   │   │   ├── toolRegistry.test.ts
│   │   │   └── traceContext.test.ts
│   │   ├── tools/
│   │   │   ├── domain/
│   │   │   │   └── software/
│   │   │   │       └── testRunner.ts
│   │   │   ├── platform/
│   │   │   │   ├── engram_tool.ts
│   │   │   │   └── sequential_thinking_tool.ts
│   │   │   ├── .gitkeep
│   │   │   ├── fs.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── agent-job.types.ts
│   │   │   ├── ai-engine.types.ts
│   │   │   ├── business-chief.types.ts
│   │   │   ├── ceo.types.ts
│   │   │   ├── chief.types.ts
│   │   │   ├── code-researcher.types.ts
│   │   │   ├── code-writer.types.ts
│   │   │   ├── engram.types.ts
│   │   │   ├── git-worker.types.ts
│   │   │   ├── graph.types.ts
│   │   │   ├── index.ts
│   │   │   ├── jest-helpers.types.ts
│   │   │   ├── langgraph.types.ts
│   │   │   ├── llm.types.ts
│   │   │   ├── mcp.types.ts
│   │   │   ├── mirror.types.ts
│   │   │   ├── operations.types.ts
│   │   │   ├── researcher.types.ts
│   │   │   ├── software-chief.types.ts
│   │   │   ├── software-tools.types.ts
│   │   │   ├── state-helper.types.ts
│   │   │   ├── stream.types.ts
│   │   │   └── telemetry.ts
│   │   ├── workers/
│   │   │   └── .gitkeep
│   │   ├── index.ts
│   │   ├── test-business-workflow.ts
│   │   ├── test-full-autonomy.ts
│   │   ├── test-persistence.ts
│   │   ├── test-resilience.ts
│   │   ├── test-rewind-logic.ts
│   │   ├── test-run.ts
│   │   └── test-workflow.ts
│   ├── workspaces/
│   │   ├── e2e-audit-002/
│   │   ├── stress-test-1776895876969/
│   │   ├── stress-test-1776895990115/
│   │   └── test-project-001/
│   ├── .env
│   ├── .prettierrc
│   ├── debug_tests.log
│   ├── Dockerfile
│   ├── e2e_test_output.log
│   ├── e2e_test_unique.log
│   ├── eslint.config.js
│   ├── jest.config.js
│   ├── package.json
│   ├── test_output.log
│   ├── test-results.json
│   ├── test-run.log
│   ├── tsconfig.json
│   └── tsconfig.tsbuildinfo
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
│   │   │   ├── .gitkeep
│   │   │   ├── agents.ts
│   │   │   ├── client.ts
│   │   │   ├── index.ts
│   │   │   └── sse.ts
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
│   │   │   │   ├── FinancialTicker.tsx
│   │   │   │   ├── HITLPanel.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── OrchestrationGraph.tsx
│   │   │   │   ├── ReasoningFeed.tsx
│   │   │   │   ├── StatusIndicators.tsx
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
│   │   │   ├── utils.ts
│   │   │   └── xmlParser.ts
│   │   ├── hooks/
│   │   │   ├── .gitkeep
│   │   │   ├── index.ts
│   │   │   └── useAgentStream.ts
│   │   ├── services/
│   │   │   ├── agentProcessor.ts
│   │   │   └── index.ts
│   │   ├── store/
│   │   │   ├── .gitkeep
│   │   │   ├── index.ts
│   │   │   └── useAgentStore.ts
│   │   ├── types/
│   │   │   ├── local/
│   │   │   │   ├── CommandBar.types.ts
│   │   │   │   ├── HITLPanel.types.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── SystemHealth.types.ts
│   │   │   │   └── UI.types.ts
│   │   │   ├── .gitkeep
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── components.json
│   ├── Dockerfile
│   ├── next-env.d.ts
│   ├── next.config.js
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── tsconfig.tsbuildinfo
├── infra/
│   └── .gitkeep
├── openspec/
│   ├── changes/
│   │   ├── archive/
│   │   │   ├── 2026-04-24-fix-iteration-count-telemetry-127/
│   │   │   │   ├── design.md
│   │   │   │   ├── exploration.md
│   │   │   │   ├── proposal.md
│   │   │   │   ├── spec.md
│   │   │   │   └── tasks.md
│   │   │   ├── 2026-04-24-fix-state-rewind-ui-37/
│   │   │   │   ├── design.md
│   │   │   │   ├── exploration.md
│   │   │   │   ├── proposal.md
│   │   │   │   ├── spec.md
│   │   │   │   ├── tasks.md
│   │   │   │   └── walkthrough.md
│   │   │   ├── 2026-04-27-feat-124-mcp-tool-standardization/
│   │   │   │   └── specs/
│   │   │   │       └── mcp/
│   │   │   │           └── tool-registry/
│   │   │   ├── 2026-04-27-feat-125-sequential-thinking-tool/
│   │   │   │   ├── specs/
│   │   │   │   │   └── reasoning/
│   │   │   │   │       └── sequential-thinking/
│   │   │   │   ├── design.md
│   │   │   │   ├── exploration.md
│   │   │   │   ├── proposal.md
│   │   │   │   ├── tasks.md
│   │   │   │   └── verify-report.md
│   │   │   ├── 2026-04-27-feat-143-sse-security-streaming/
│   │   │   │   ├── specs/
│   │   │   │   │   └── security/
│   │   │   │   │       └── sse-event/
│   │   │   │   │           └── spec.md
│   │   │   │   ├── design.md
│   │   │   │   ├── proposal.md
│   │   │   │   └── tasks.md
│   │   │   ├── 2026-04-27-feat-150-observability-logger/
│   │   │   │   ├── specs/
│   │   │   │   │   └── observability/
│   │   │   │   │       └── logging/
│   │   │   │   │           └── spec.md
│   │   │   │   ├── design.md
│   │   │   │   ├── proposal.md
│   │   │   │   └── tasks.md
│   │   │   └── 2026-04-27-issue-114-operations-chief/
│   │   │       └── specs/
│   │   │           ├── core/
│   │   │           └── operations-chief/
│   │   ├── feat/
│   │   │   ├── budget-monitoring-35/
│   │   │   │   ├── specs/
│   │   │   │   │   └── observability/
│   │   │   │   │       └── logging/
│   │   │   │   │           └── spec.md
│   │   │   │   ├── design.md
│   │   │   │   ├── exploration.md
│   │   │   │   ├── proposal.md
│   │   │   │   └── tasks.md
│   │   │   ├── healthchecks-145/
│   │   │   │   ├── design.md
│   │   │   │   ├── proposal.md
│   │   │   │   ├── spec.md
│   │   │   │   └── tasks.md
│   │   │   └── operations-chief-114/
│   │   │       ├── design.md
│   │   │       ├── proposal.md
│   │   │       ├── spec.md
│   │   │       └── tasks.md
│   │   ├── feat-124-mcp-tool-standardization/
│   │   │   ├── specs/
│   │   │   │   └── mcp/
│   │   │   │       └── tool-registry/
│   │   │   │           └── spec.md
│   │   │   ├── design.md
│   │   │   ├── proposal.md
│   │   │   └── tasks.md
│   │   ├── feat-143-sentinel-sse/
│   │   │   ├── specs/
│   │   │   │   └── sse-streaming/
│   │   │   │       └── spec.md
│   │   │   ├── design.md
│   │   │   ├── proposal.md
│   │   │   ├── state.yaml
│   │   │   └── tasks.md
│   │   ├── fix/
│   │   │   └── ceo-domain-misalignment-148/
│   │   │       ├── design.md
│   │   │       ├── proposal.md
│   │   │       ├── spec.md
│   │   │       └── tasks.md
│   │   ├── issue-114-operations-chief/
│   │   │   ├── specs/
│   │   │   │   ├── core/
│   │   │   │   │   └── spec.md
│   │   │   │   └── operations-chief/
│   │   │   │       └── spec.md
│   │   │   ├── design.md
│   │   │   ├── proposal.md
│   │   │   ├── tasks.md
│   │   │   └── walkthrough.md
│   │   ├── issue-144-redis-janitor/
│   │   │   ├── specs/
│   │   │   │   └── infrastructure/
│   │   │   │       └── spec.md
│   │   │   ├── design.md
│   │   │   ├── proposal.md
│   │   │   ├── state.yaml
│   │   │   └── tasks.md
│   │   └── optimize-entry-flow/
│   │       ├── design.md
│   │       ├── proposal.md
│   │       ├── spec.md
│   │       ├── tasks.md
│   │       └── walkthrough.md
│   ├── specs/
│   │   ├── core/
│   │   │   ├── budget-control/
│   │   │   │   └── spec.md
│   │   │   └── spec.md
│   │   ├── observability/
│   │   │   └── logging/
│   │   │       └── spec.md
│   │   ├── reasoning/
│   │   │   └── sequential-thinking/
│   │   │       └── spec.md
│   │   └── security/
│   │       └── sse-event/
│   │           └── spec.md
│   └── config.yaml
├── packages/
│   ├── protos/
│   │   ├── src/
│   │   │   ├── generated/
│   │   │   │   ├── ai_engine/
│   │   │   │   │   ├── AIEngine.ts
│   │   │   │   │   ├── Empty.ts
│   │   │   │   │   ├── PingResponse.ts
│   │   │   │   │   ├── WorkerProgressUpdate.ts
│   │   │   │   │   ├── WorkerTaskRequest.ts
│   │   │   │   │   └── WorkerTaskResponse.ts
│   │   │   │   ├── google/
│   │   │   │   │   └── protobuf/
│   │   │   │   │       ├── ListValue.ts
│   │   │   │   │       ├── NullValue.ts
│   │   │   │   │       ├── Struct.ts
│   │   │   │   │       └── Value.ts
│   │   │   │   └── ai_engine.ts
│   │   │   ├── generated 2/
│   │   │   │   ├── ai_engine/
│   │   │   │   └── google/
│   │   │   └── ai_engine.proto
│   │   ├── generate-python.sh
│   │   └── package.json
│   └── shared/
│       ├── src/
│       │   ├── contracts/
│       │   │   ├── ceo.ts
│       │   │   ├── documentation_worker.ts
│       │   │   ├── index.ts
│       │   │   ├── operations_chief.ts
│       │   │   ├── operations_worker.ts
│       │   │   ├── researcher.ts
│       │   │   ├── review_worker.ts
│       │   │   └── security_worker.ts
│       │   ├── types/
│       │   │   ├── AgentNode.types.ts
│       │   │   ├── AgentState.types.ts
│       │   │   ├── AgentThought.types.ts
│       │   │   ├── BackendState.types.ts
│       │   │   ├── index.ts
│       │   │   ├── Project.types.ts
│       │   │   └── Store.types.ts
│       │   └── index.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── tsconfig.tsbuildinfo
├── protos/
│   └── ai_engine.proto
├── scripts/
│   ├── architecture-audit/
│   │   ├── eslint-plugin/
│   │   │   ├── rules/
│   │   │   │   └── no-deep-imports.js
│   │   │   ├── index.js
│   │   │   └── package.json
│   │   ├── rules/
│   │   │   ├── exported-types.rule.ts
│   │   │   ├── frontend-extensions.rule.ts
│   │   │   ├── index.ts
│   │   │   ├── max-lines.rule.ts
│   │   │   ├── no-any.rule.ts
│   │   │   ├── no-console.rule.ts
│   │   │   ├── no-deep-imports.rule.ts
│   │   │   ├── reasoning-first.rule.ts
│   │   │   └── strict-xml.rule.ts
│   │   ├── cache-manager.ts
│   │   ├── runner.ts
│   │   ├── structural-checks.ts
│   │   └── types.ts
│   ├── .gitkeep
│   ├── check-docker.js
│   ├── generate-architecture.js
│   ├── quick-commit.ts
│   ├── sync-project-structure.js
│   ├── verify-srp.js
│   └── verify-types-isolation.js
├── skills/
│   └── .gitkeep
├── types/
│   ├── .gitkeep
│   └── index.ts
├── .architecture-cache.json
├── .env.example
├── .gitignore
├── .opencodeignore.save
├── AGENTS.md
├── architecture.md
├── commitlint.config.js
├── docker-compose.yml
├── full_validation.log
├── GEMINI.md
├── package.json
├── README.md
├── tsconfig.json
└── turbo.json
```

---
*Este archivo se actualiza automáticamente en cada commit mediante un hook de Husky.*
