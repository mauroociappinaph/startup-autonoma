# Technical Design: Agent Sandbox Implementation

## Architecture
The sandbox relies on a pre-existing Docker container (`startup-sandbox`) managed via `docker-compose.yml`.

### Components

#### 1. `SandboxService` (Refactored)
- **Method `execute(command, options)`**:
  - `command`: String to execute.
  - `options`: `{ timeout, workingDir, env }`.
- **Security Layer**: Pre-execution check against a `SAFE_COMMANDS_REGEX`.

#### 2. `terminal_tool` (New)
- **Location**: `backend/src/tools/platform/terminal_tool.ts`.
- **Functionality**: Wraps `sandboxService.execute`.
- **Audit**: Logs every execution to the `Operations Chief` trace.

#### 3. Docker Configuration
- **File**: `docker-compose.yml`.
- **Image**: A custom image based on `node:20-slim` or `node:20-alpine` with `git` and `python` installed.
- **User**: Runs as a non-root user (e.g., `node`) to minimize host impact even if a breakout occurs.

## Data Flow
1. Agent Node -> `terminal_tool`.
2. `terminal_tool` -> `SandboxService.execute`.
3. `SandboxService` -> `docker exec startup-sandbox <cmd>`.
4. Result -> Agent Node.

## Security Considerations
- **Non-root user**: The container user should not have sudo privileges.
- **Network**: The container should be on a separate bridge network with limited egress.
- **Filesystem**: The volume mount should be restricted to the project root.
