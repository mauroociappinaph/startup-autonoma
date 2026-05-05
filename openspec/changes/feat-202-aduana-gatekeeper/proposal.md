# Proposal: Aduana Gatekeeper (Issue #202)

## 1. Intent
Resolver el cuello de botella en las aprobaciones de la Aduana automatizando el gatekeeping de Pull Requests. En lugar de que el humano revise PRs rotos, el CI validará el código y asignará dinámicamente las etiquetas de revisión.

## 2. Problem
Actualmente, los PRs creados por agentes o humanos no tienen un filtro automatizado que gestione las etiquetas de revisión en tiempo real. La Aduana pierde tiempo valioso abriendo PRs cuyo pipeline de tests o linter falla, aumentando el tiempo promedio de una issue en "needs-review" a más de 24 horas.

## 3. Solution
Implementar un job `aduana-gatekeeper` en el workflow de GitHub Actions (`ci.yml`) que dependa de la validación estructural.
- Si el CI pasa: Asigna `👀 status:needs-review` y remueve etiquetas de error.
- Si el CI falla: Asigna `⚠️ status:needs-changes`, remueve revisión y deja un comentario.

## 4. Risks
- Permisos de GITHUB_TOKEN insuficientes para escribir en Pull Requests (mitigado asegurando `permissions: pull-requests: write`).
