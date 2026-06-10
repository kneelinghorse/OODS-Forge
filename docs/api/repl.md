# repl

> Grouped Design Lab REPL tool. Set `action` to validate (check a UiSchema/patch against the DSL+registry) or render (produce HTML/CSS preview; apply=true to emit). Consolidates the former repl.* tools with identical per-action behavior.

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
