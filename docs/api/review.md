# review

> Grouped reconciliation-review tool. Set `action` to resolve (apply a policy bundle to an Object Catalog manifest) or chain (compose the full review-queue → resolve → conflict-detail → apply-summary artifacts). Consolidates the former review.* tools with identical per-action behavior.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | `resolve` \| `chain` | Yes |  | Which review operation to perform. resolve: apply a policy bundle to a manifest, producing per-entity decisions + audit trail. chain: compose the four C5 surfaces (queue → resolve → conflict-detail → apply-summary) against a server-resident fixture. |

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
  "action": "resolve"
}
```
