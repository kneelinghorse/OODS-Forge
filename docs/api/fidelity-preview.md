# fidelity.preview

> Render an Object Catalog manifest through one of the non-production HTML fidelity emitters (boxes-arrows, wireframe, review, branded-mockup). Supply EXACTLY ONE manifest source: a named server-resident `fixture` (allow-listed — no caller-supplied paths) or an inline `manifest` object (data only, never a path; must contain an `entities` array). Returns complete HTML ready to insert into a preview surface; `options` control the projection variant, brand overlay (branded-mockup only), review threshold, and the inline <style> block. Branded mockups resolve built A/B light-scope tokens; brand-a/brand-b are deprecated aliases supported for one release. Unknown brands return OODS-BM-002 instead of falling back. Portable callers must provide inline manifest data because named fixtures are not shipped.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `fidelityKind` | `boxes-arrows` \| `wireframe` \| `review` \| `branded-mockup` | Yes |  | Which HTML fidelity emitter to invoke. |
| `fixture` | string | No |  | Named server-resident Object Catalog fixture. Allow-listed at the handler — unknown names return OODS-FP-001. Mutually exclusive with `manifest`. |
| `manifest` | object | No |  | Inline Object Catalog manifest to render — an alternative to `fixture`. Data only; no file path is accepted, so this does not reopen the traversal surface the fixture allow-list closes. Must contain an `entities` array. Mutually exclusive with `fixture`. Malformed input returns OODS-FP-005. |
| `manifest.entities` | unknown[] | Yes |  | Object Catalog entities to render. |
| `options` | object | No |  |  |
| `options.variant` | string | No |  | Projection-variant selector passed through to the emitter (see s100-m03 selectVariant() / runPreEmit()). |
| `options.brandOverlay` | string | No |  | Built A/B light-scope brand for branded-mockup fidelity. Ignored by other fidelities. brand-a/brand-b are deprecated one-release aliases; unknown names return OODS-BM-002. |
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
  "fidelityKind": "boxes-arrows"
}
```
