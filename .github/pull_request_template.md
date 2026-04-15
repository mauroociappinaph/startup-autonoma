## 🏗️ Resumen del PR

_Breve descripción de lo que construyó el GitWorker / IA..._

## 🛡️ Checklist del Software Chief (Auto-Validación)

Antes de que este código se unifique a `main` o `develop`, el Agente/Humano garantiza:

- [ ] **Leyes Sagradas Cumplidas**: No rompo DRY y exporto componentes desde un `index.ts` (Barrel).
- [ ] **Sin Super-Archivos**: Ningún archivo excede las 300 líneas (SRP protegido).
- [ ] **Cobertura de TDD**: Se adjuntaron tests unitarios (o E2E si aplica) y fueron validados en CLI exitosamente.
- [ ] **Linter Aprobado**: Pasó Prettier/Ruff y el pipeline CI (GitHub Actions) está en verde.
- [ ] **Path Aliases**: Está prohibido usar rutas relativas profundas (`../../`). Uso exclusivamente el estándar de Path Aliases (`@/tools/`, etc) para prevenir alucinaciones de ruta.

## 🎫 Ticket Asociado
Fixes # (Número de Issue)

## 📌 Contexto adicional / Notas
_(Si el agente alucinó con algo, o algún edge-case persistente)_
