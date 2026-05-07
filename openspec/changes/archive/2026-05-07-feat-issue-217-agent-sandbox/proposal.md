# Change Proposal: Sandbox Environment for Agent Execution (Issue #217)

## Problem
Currently, agent execution is partially sandboxed for tests, but there is no unified mechanism for running arbitrary terminal commands securely. Tools like `fs.ts` rely on simple path validation, which doesn't protect against OS-level attacks if an agent finds a way to execute code (e.g., via a vulnerability in a library).

## Goals
- Implement a unified `SandboxService` that handles all external process executions.
- Create a `terminal_tool` (or `run_command`) that allows agents to execute allowed CLI commands within a restricted Docker container.
- Ensure the sandbox has resource limits (CPU, RAM) and network isolation where possible.
- Provide clear visibility in logs/UI about what is running inside the sandbox vs host.

## Proposed Approach
1. **Refactor `SandboxService`**:
   - Add support for command whitelisting (regex-based).
   - Implement execution timeouts to prevent infinite loops.
   - Standardize error reporting.
2. **New `terminal_tool`**:
   - Give agents a way to run non-test commands (e.g., `git status`, `npm list`) safely.
   - All executions MUST go through the `sandboxService`.
3. **Integration**:
   - Ensure the `CEO` and `Software Chief` use the sandboxed terminal for any discovery or maintenance tasks.

## Risks
- **Performance**: Docker exec overhead.
- **Complexity**: Synchronizing the host filesystem with the container (already handled via volumes, but needs verification).
- **Tool Availability**: The sandbox container must have all necessary tools (git, npm, python) installed.

## User Review Required
> [!IMPORTANT]
> This change will make Docker a STRICT dependency for running certain agent tasks. We need to decide if we want a "host-fallback" mode for local development or if we enforce Docker for safety.
