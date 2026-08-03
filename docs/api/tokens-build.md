# tokens.build

> Run the design-token build and return the compiled CSS variables and token artifacts. The build emits every brand and theme; the brand and theme inputs label the returned payload, they do not filter it. Use apply=true to write output files (default: dry-run, returns preview only).

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `brand` | `A` \| `B` | No | `"A"` | Brand label stamped into the built token payload's meta block. The token build itself emits every brand; this selects the label, not the palette. |
| `theme` | `light` \| `dark` \| `hc` | No | `"dark"` |  |
| `apply` | boolean | No | `false` |  |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `status` | `ok` \| `error` \| `invalid` | No |  |
| `notes` | string | No |  |
| `logs` | string[] | No |  |
| `artifacts` | any[] | Yes |  |
| `diagnosticsPath` | string | No |  |
| `transcriptPath` | string | Yes |  |
| `bundleIndexPath` | string | Yes |  |
| `structuredData` | object | No |  |
| `artifactsDetail` | object[] | No |  |
| `preview` | object | No |  |

## Error Codes

| Code | Description |
|------|-------------|
| `OODS-V001` | Input validation failed |
| `OODS-S001` | Internal server error |

## Example Request

```json
{}
```
