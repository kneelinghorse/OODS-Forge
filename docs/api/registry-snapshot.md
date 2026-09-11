# registry.snapshot

> Return the full registry state in one call: maps, traits, objects, etag, and generatedAt. Intended for reconciliation consumers that would otherwise need map.list plus N× map.resolve. Draft preferred_terms, disambiguation_decisions and capabilities are surfaced, not consumed by mapping resolution, composition or generation.

**Registration:** auto

## Input Parameters

_No parameters._

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `maps` | object[] | Yes |  |
| `traits` | Record<string, _ref_> | Yes |  |
| `objects` | Record<string, _ref_> | Yes |  |
| `etag` | string | Yes |  |
| `generatedAt` | string | Yes |  |
| `disambiguation_decisions` | object[] | No | Draft v1.4.0-gated review-decision events surfaced losslessly from the mapping doc. Omitted when none are present. |
| `preferred_terms` | object[] | No | Draft v1.4.0-gated canonical-term entities surfaced losslessly. Omitted when none are present. |
| `capabilities` | object[] | No | Draft v1.4.0-gated first-class capability entities surfaced losslessly. Omitted when none are present. |

## Error Codes

| Code | Description |
|------|-------------|
| `OODS-V001` | Input validation failed |
| `OODS-S001` | Internal server error |

## Example Request

```json
{}
```
