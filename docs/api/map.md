# map

> Grouped mapping-registry tool. Set `action` to one of apply|create|list|resolve|update|delete to select the operation; the remaining fields match that action's contract. Consolidates the former map.* tools with identical per-action behavior.

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
