# Skill Registry

## Compact Rules

### Architecture & Engineering (from AGENTS.md)
- **SRP & DRY**: Every component does one thing.
- **Barrel Files**: Mandatory `index.ts` for exports.
- **Strict Typing**: No `any` allowed. Use Zod/Pydantic.
- **Structured Outputs**: Mandatory `llm.withStructuredOutput()`.
- **Reasoning-First**: Action must be preceded by `<thought>`.
- **Idempotency**: Workers must be idempotent.
- **Path Aliases**: Use `@/*`.
- **Strict XML**: Follow `<thought>`, `<plan>`, `<action>`, `<verification>`.

### Design System
- **Tailwind & shadcn/ui**: Mandatory for frontend. No inline CSS.

### Process
- **Conventional Commits**: `type(scope): message`.
- **Pipeline Local**: Pre-commit and pre-push validation mandatory.

## User Skills

| Skill | Trigger | Source |
|-------|---------|--------|
| `branch-pr` | Creating pull requests | Global |
| `issue-creation` | Creating GitHub issues | Global |
| `judgment-day` | Peer review request | Global |
| `sdd-apply` | Implementation phase | Global |
| `sdd-design` | Design phase | Global |
| `sdd-spec` | Specification phase | Global |
| `sdd-tasks` | Task breakdown phase | Global |
| `sdd-verify` | Verification phase | Global |
| `skill-creator` | Creating new skills | Global |
| `skill-registry` | Updating skill registry | Global |

## Project Context
- **Name**: Startup Autónoma
- **Stack**: NodeNext, TS, Python, Next.js 15, gRPC, LangGraph, Redis.
- **Primary Agents**: CEO, Software Chief, Business Chief.
