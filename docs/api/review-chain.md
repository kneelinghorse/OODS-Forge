# review.chain

> MCP tool: review.chain

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `fixture` | string | Yes |  | Named server-resident Object Catalog fixture. Allow-listed at the handler — unknown names return OODS-RC-001. |
| `policies` | _ref_ | Yes |  |  |
| `options` | object | No |  |  |
| `options.reviewThreshold` | number | No |  | Threshold below which entities are flagged for review by the queue and detail emitters. Default 0.7. |
| `options.lowestSignalsN` | integer | No |  | Top-N selector for per-entry lowestSignals in the queue artifact. Default 3. |
| `options.evidenceGapThreshold` | number | No |  | Signal-level threshold used by conflict-detail to classify signal gaps. Default 0.5. |
| `options.defaultAction` | _ref_ | No |  | Decision applied by review.resolve when no policy matches. Default 'defer'. |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `queue` | object | Yes | Review-queue artifact. Deep shape validated by review-queue.output.json. |
| `resolutions` | object[] | Yes | Per-entity policy resolutions from review.resolve. |
| `auditTrail` | object | Yes | review.resolve audit trail echoed verbatim. |
| `conflictDetails` | object[] | Yes | One entry per flaggedForReview entry in queue.entries. detail deep shape validated by conflict-detail.output.json. |
| `summary` | object | Yes | Apply-summary artifact. Deep shape validated by apply-summary.output.json. |
| `diagnostics` | object | Yes |  |

## Error Codes

| Code | Description |
|------|-------------|
| `OODS-V001` | Input validation failed |
| `OODS-S001` | Internal server error |

## Example Request

```json
{
  "fixture": "<fixture>"
}
```
