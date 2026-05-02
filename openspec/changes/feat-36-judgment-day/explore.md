# Exploración: Protocolo Judgment Day para Aduana Sentinel (Issue #36)

## Contexto Actual
El `AduanaSentinelNode` es el filtro de seguridad (firewall) del sistema. Actualmente, evalúa si un input de usuario es malicioso (jailbreak, prompt injection) utilizando una única llamada al modelo de lenguaje (`LLMService`).
Si detecta amenaza, bloquea el flujo y manda al estado `security_blocked`.

## Problema Identificado
Una única llamada al LLM puede sufrir de "alucinaciones" (falsos positivos) o ser muy laxa frente a ataques sofisticados (falsos negativos). Además, los ataques modernos requieren un análisis contradictorio para desentrañar intenciones ocultas en prompts largos.

## Alternativas de Implementación

### Alternativa 1: Verificación Secuencial
El LLM procesa el input y si hay dudas, se reenvía a otro LLM.
- *Pros:* Ahorra tokens si el primer pase es obvio.
- *Contras:* Alta latencia. Si el primero falla silenciosamente, el segundo nunca se ejecuta.

### Alternativa 2: Verificación Paralela Estricta (AND)
Dos LLMs paralelos. Ambos deben marcar `is_injection = true` para bloquear.
- *Pros:* Baja tasa de falsos positivos (no se bloquea a un usuario legítimo fácilmente).
- *Contras:* Baja seguridad (un atacante que engañe a un solo LLM pasa el firewall).

### Alternativa 3: Protocolo "Judgment Day" Adversarial
Ejecutar dos agentes en paralelo:
- **Prosecutor (Red Team):** Obligado a encontrar vulnerabilidades (Alta sensibilidad a bloqueos).
- **Defender (Blue Team):** Obligado a encontrar justificaciones legítimas (Alta sensibilidad a pase).
Si ambos concuerdan, se toma esa decisión. Si difieren, se ejecuta un **Synthesis Judge** para desempatar.
- *Pros:* Máxima robustez. Elimina sesgos del prompt. Solo gasta más tokens cuando hay dudas genuinas.
- *Contras:* Requiere 2 o 3 llamadas por input. Aumento de latencia.

## Decisión de Exploración
La Alternativa 3 es la más alineada a la Issue #36. Asegura que el Aduana Sentinel opere con un nivel de paranoia paramétrico.
