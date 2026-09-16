# map

> Run one mapping-registry operation. Set `action` to one of apply|create|list|resolve|update|delete to select the operation; the remaining fields match that action's contract. Consolidates the former map.* tools with identical per-action behavior. Records and resolves mappings for external consumers; no composer or generator consumes them. preferred_terms and disambiguation_decisions are preserved and surfaced, not consumed by resolution.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | `apply` \| `create` \| `list` \| `resolve` \| `update` \| `delete` | Yes |  | Selects the per-action handler to invoke. |

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
  "action": "apply"
}
```
