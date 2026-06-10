# object

> Grouped object-registry tool. Set `action` to list (filter OODS objects) or show (full object definition incl. composed traits and view extensions). Consolidates the former object.* tools with identical per-action behavior.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | `list` \| `show` | Yes |  | Selects the per-action contract: 'list' returns all domain objects with optional filters; 'show' returns the full composed definition for one object. |

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
  "action": "list"
}
```
