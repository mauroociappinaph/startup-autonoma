# Tasks: Aduana Gatekeeper (Issue #202)

- [x] T1: Crear la rama `feat/issue-202-aduana-gatekeeper`.
- [x] T2: Crear etiqueta en GitHub `⚠️ status:needs-changes`.
- [x] T3: Modificar `.github/workflows/ci.yml`.
  - [x] Añadir job `aduana-gatekeeper`.
  - [x] Añadir permisos `pull-requests: write`.
  - [x] Lógica condicional para éxito (`needs-review`) y fallo (`needs-changes` + comment).
- [ ] T4: Commit atómico de la funcionalidad.
- [ ] T5: Merge a develop con `--no-ff`.
- [ ] T6: Clean up (borrar rama).
