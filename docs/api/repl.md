# repl

> Run one Design Lab REPL operation. Set `action` to validate (check a UiSchema/patch against the DSL+registry) or render (produce HTML/CSS preview; apply=true to emit). Consolidates the former repl.* tools with identical per-action behavior. BRAND (s169 m04): pass brand:'A'|'B' to render a specific brand's palette; omit it for the previous behaviour, byte-identical. On dashboard.render the brand drives both the tokens inlined into the output.html export and the palette output.contrastScan grades, so what is painted and what is checked are always the same brand. Fragment output diagnoses ignored brand/output.tokenOverlay/output.skinOverlay with OODS-W001. Non-strict fragments expose OODS-W002 when OODS-V006 is reclassified per node. Document output applies scope options. validate.apply is an ignored bridge-parity key. Fragment depth and request-level dslVersion are not supported. output.payloadMode file writes the rendered document as index.html (or fragments.json and css.json) beside the saved-schema store (<store>/../payloads/repl.render-<digest>/) and returns a payload block of file references instead of html, fragments and css; a directory that cannot be written is OODS-S020.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | `render` \| `validate` | Yes |  | Selects the per-action handler. 'render' -> repl.render, 'validate' -> repl.validate. |

## Output Shape

_See tool response._

## Error Codes

| Code | Description |
|------|-------------|
| `OODS-V001` | Input validation failed |
| `OODS-S001` | Internal server error |

## Example Request

```json
{
  "action": "render"
}
```
