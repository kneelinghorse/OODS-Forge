# schema

> Run one schema-store operation. Set `action` to one of save|load|list|delete. Consolidates the former schema.* tools with identical per-action behavior. Use action=save to persist a composed UiSchema beyond the 30-minute schemaRef TTL. Saved schemas expose monotonic versions and schemaRef identity, not ETags or conditional requests.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | `save` \| `load` \| `list` \| `delete` | Yes |  | Selects the schema-family operation to dispatch. |

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
  "action": "save"
}
```
