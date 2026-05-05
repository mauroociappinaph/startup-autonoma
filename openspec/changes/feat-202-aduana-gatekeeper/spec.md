# Specifications: Aduana Gatekeeper (Issue #202)

## 1. Requirements
- **REQ-1**: El sistema debe detectar automáticamente si un Pull Request pasa los chequeos de `check-laws`, `lint`, y `test`.
- **REQ-2**: Si los chequeos son exitosos, el sistema debe asignar la etiqueta `👀 status:needs-review` y remover `⚠️ status:needs-changes`.
- **REQ-3**: Si los chequeos fallan, el sistema debe asignar la etiqueta `⚠️ status:needs-changes`, remover `👀 status:needs-review`, y emitir un comentario notificando los errores.

## 2. Scenarios
- **Scenario A (Success)**: Un Agente sube código que compila y pasa tests. El GitHub Action remueve las etiquetas previas y asigna `needs-review`. La Aduana entra, revisa y aprueba.
- **Scenario B (Failure)**: Un Agente sube código roto. El GitHub Action detecta el fallo en el job `validate`, rechaza la solicitud de revisión, etiqueta el PR con `needs-changes` y la Aduana ignora el PR hasta que sea corregido.
