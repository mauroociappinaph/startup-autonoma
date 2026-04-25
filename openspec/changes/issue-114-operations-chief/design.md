# Design: Operations Chief Implementation (#114)

## Technical Approach

Se implementará el `OperationsChief` como un nodo de orquestación de infraestructura que delega tareas específicas a un nuevo `OperationsWorker`. La comunicación se basará en el paso de mensajes estructurados a través del `AgentStateType`. El `OperationsWorker` ejecutará comandos del sistema (Docker, NPM) utilizando una lista blanca de comandos permitidos para garantizar la seguridad.

## Architecture Decisions

### Decision: Safe Command Execution Toolset
**Choice**: Usar una lista blanca de comandos pre-definidos en lugar de permitir shell arbitraria.
**Alternatives considered**: Permitir `exec` libre con sanitización.
**Rationale**: Minimiza el riesgo de Shell Injection. El agente solo puede ejecutar lo que nosotros definimos como "seguro" (ej: `docker-compose ps`, `docker logs`).

### Decision: HITL for Modifying Actions
**Choice**: Forzar `requires_approval: true` en el `OperationsChief` para cualquier acción que no sea `monitor` o `audit_logs`.
**Alternatives considered**: Aprobación automática basada en confianza.
**Rationale**: Las operaciones de infraestructura pueden ser destructivas. La Fase C requiere un humano en el loop para validación de seguridad (HITL).

## Data Flow

    CEO ──→ OperationsChief ──→ OperationsWorker ──→ Host (Docker/Shell)
               │                     │
               └───── State Update ──┴──────────→ Dashboard (CoT)

1. El CEO identifica una misión de Ops.
2. El OperationsChief analiza la misión y genera una instrucción para el Worker.
3. El OperationsWorker ejecuta el comando y devuelve el stdout/stderr.
4. El OperationsChief resume el resultado y lo devuelve al CEO.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `backend/src/nodes/chiefs/operations_chief.ts` | Modify | Implementar lógica de delegación y ruteo. |
| `backend/src/nodes/workers/operations_worker.ts` | Create | Nodo ejecutor de comandos de infraestructura. |
| `backend/src/nodes/ceo.ts` | Modify | Actualizar system prompt para incluir el rol de Ops. |
| `backend/src/graph/index.ts` | Modify | Agregar el nuevo worker al grafo y configurar interrupciones. |
| `packages/shared/src/contracts/operations_worker.ts` | Create | Esquema de entrada/salida para el worker. |

## Interfaces / Contracts

```typescript
// packages/shared/src/contracts/operations_worker.ts
export const OperationsWorkerSchema = z.object({
  command: z.enum(["docker_ps", "docker_logs", "npm_build", "check_health"]),
  args: z.array(z.string()).optional(),
  reasoning: z.string()
});
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `OperationsWorker` | Mock de `exec` para validar que solo se llamen comandos permitidos. |
| Integration | `CEO` -> `OpsChief` | Validar ruteo correcto ante prompts de infraestructura. |
| E2E | `npm run test:autonomy` | Verificar que una misión de "status" complete el ciclo. |

## Migration / Rollout

No migration required. El nuevo Chief se activa automáticamente al actualizar el grafo y el prompt del CEO.

## Open Questions

- [ ] ¿Deberíamos permitir `docker-compose restart` sin aprobación en entornos de desarrollo?
- [ ] ¿El worker debe correr en el contenedor del backend o tener acceso al host vía socket? (Se asume acceso al socket de docker).
