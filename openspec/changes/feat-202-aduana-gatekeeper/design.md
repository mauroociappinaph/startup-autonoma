# Design: Aduana Gatekeeper (Issue #202)

## 1. Architecture
El sistema se implementará íntegramente mediante **GitHub Actions** para minimizar la carga operativa local y aprovechar la integración nativa de etiquetas y comentarios de GitHub.

- Modificación de `.github/workflows/ci.yml`.
- Uso de `github.event_name == 'pull_request'` para restringir el comportamiento.
- Ejecución condicional mediante `${{ needs.validate.result }}`.

## 2. API / Contracts
El script interactúa con la API de GitHub usando `gh pr edit` y `gh pr comment`.
- Requires: `permissions: pull-requests: write`.
- Environment Variable: `GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`.

## 3. Implementation Details
Se agrega un job `aduana-gatekeeper` con dos pasos secuenciales, mutuamente excluyentes (uno para success, otro para failure/cancelled), evaluando el resultado del job upstream `validate`.
El CLI oficial de GitHub (`gh`) es preferido sobre actions de terceros por razones de seguridad (supply chain) y rendimiento.
