# fidelity.preview

> MCP tool: fidelity.preview

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `fidelityKind` | `boxes-arrows` \| `wireframe` \| `review` \| `branded-mockup` | Yes |  | Which HTML fidelity emitter to invoke. |
| `fixture` | string | Yes |  | Named server-resident Object Catalog fixture. Allow-listed at the handler — unknown names return OODS-FP-001. |
| `options` | object | No |  |  |
| `options.variant` | string | No |  | Projection-variant selector passed through to the emitter (see s100-m03 selectVariant() / runPreEmit()). |
| `options.brandOverlay` | string | No |  | Brand overlay name for the branded-mockup fidelity. Ignored by other fidelities. Unknown names emit OODS-BM-002 and fall back to brand-a per s102-m02. |
| `options.reviewThreshold` | number | No |  | Threshold below which entities are flagged for review. Default 0.7. Ignored by non-review fidelities. |
| `options.includeStyles` | boolean | No | `true` | Inline <style> block toggle. Default true; set false to receive markup without CSS. |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `status` | `ok` \| `warning` \| `error` | Yes | ok = clean run; warning = non-fatal issues but html is valid; error = errors[] populated and html may be empty/partial. |
| `fidelityKind` | `boxes-arrows` \| `wireframe` \| `review` \| `branded-mockup` | Yes |  |
| `fixture` | string | Yes |  |
| `html` | string | Yes | Complete HTML output ready to insert into a preview surface (may include a <style> block when includeStyles is true). |
| `warnings` | object[] | Yes |  |
| `errors` | object[] | Yes |  |
| `meta` | object | Yes |  |

## Error Codes

| Code | Description |
|------|-------------|
| `OODS-V001` | Input validation failed |
| `OODS-S001` | Internal server error |

## Example Request

```json
{
  "fidelityKind": "boxes-arrows",
  "fixture": "<fixture>"
}
```
