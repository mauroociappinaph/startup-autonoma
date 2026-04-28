# Skill Registry

## User Skills
- branch-pr: PR creation workflow
- judgment-day: Parallel adversarial review
- sdd-apply: Implementation phase
- sdd-archive: Archiving phase
- sdd-design: Technical design
- sdd-explore: Exploration phase
- sdd-init: Initialization phase
- sdd-propose: Proposal phase
- sdd-spec: Specification phase
- sdd-tasks: Task breakdown
- sdd-verify: Verification phase
- skill-creator: New skill creation
- skill-registry: Registry maintenance

## Project Standards
- AGENTS.md: The Startup Source of Truth (Hierarchies, Laws, Structure)
- GEMINI.md: Project Overview and Development Conventions
- architecture.md: Technical Architecture Details

## Compact Rules
### General Engineering
- SRP & DRY: One component, one responsibility.
- Barrel Files: Use index.ts/index.py for clean exports.
- Strict Typing: NO `any`. Use Zod/Pydantic.
- gRPC: Use versioned contracts in /packages/protos.

### Agentic Patterns
- CoT XML: Use `<thought>`, `<plan>`, `<action>`, `<verification>`.
- Reasoning-First: Always save `reasoning` before actions.
- Idempotency: Workers must be safe to re-run.

### UI/Frontend
- Next.js 15 App Router.
- Tailwind CSS + shadcn/ui.
- NO deep relative imports.
