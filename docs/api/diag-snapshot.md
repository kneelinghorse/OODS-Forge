# diag.snapshot

> Capture a diagnostic snapshot bundle of the current design system state for debugging and reproducibility. Always writes diagnostic receipt artifacts; apply is an ignored bridge-parity key. Does not rebuild tokens or run browser tests.

**Registration:** on-demand

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
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
