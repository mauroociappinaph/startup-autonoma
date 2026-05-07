# Specification: Sandbox Environment (Issue #217)

## Requirements
- **R1: Command Isolation**: All terminal commands executed by agents must run inside a Docker container.
- **R2: Command Whitelisting**: Only a subset of safe commands should be allowed (e.g., `git`, `npm`, `ls`, `cat`, `grep`, `find`). Destructive commands like `rm` outside `/workspace/temp` should be blocked or audited.
- **R3: Timeout Enforcement**: No command should run for more than 60 seconds (configurable).
- **R4: Resource Limits**: The container should be limited to 1 CPU and 512MB RAM.
- **R5: Environment Sync**: The sandbox must have access to the same codebase as the host via volumes.

## Scenarios

### Scenario 1: Safe Command Execution
- **Given**: An agent wants to check the git status.
- **When**: The agent calls `run_command({ command: "git status" })`.
- **Then**: The command is executed inside the `startup-sandbox` container.
- **And**: The output is returned to the agent.

### Scenario 2: Blocked Malicious Command
- **Given**: An agent tries to delete the root directory.
- **When**: The agent calls `run_command({ command: "rm -rf /" })`.
- **Then**: The `SandboxService` blocks the command OR the container's restricted user prevents the execution.
- **And**: An error is returned indicating a security violation.

### Scenario 3: Resource Exhaustion Prevention
- **Given**: An agent runs a command that enters an infinite loop.
- **When**: The command exceeds the 60-second timeout.
- **Then**: The `SandboxService` kills the process and returns a timeout error.
