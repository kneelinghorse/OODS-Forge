# brand.apply

> Apply brand token overlays to canonical A/B source using alias strategy or the supported add/remove/replace subset of RFC 6902. Requires a delta object. apply=true writes source, runs both real token-build stages, and returns before/after SHA256, byte counts and captured build results. Build failure returns OODS-S019 with the last 40 output lines; source writes remain in place. Default dry-run changes no source. Portable bundle limit: canonical brand source is omitted, so even apply:false returns dependency-specific OODS-N020 at the adapter wire; source writes/builds require the host repository.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `brand` | `A` \| `B` | No | `"A"` | Target brand identifier. Must name a brand directory under packages/tokens/src/tokens/brands. |
| `delta` | any | Yes |  | Alias changes (object) or an array using the supported add/remove/replace subset of RFC 6902 when strategy=patch. |
| `strategy` | `alias` \| `patch` | No | `"alias"` | Alias strategy rewrites token values; patch applies the supported add/remove/replace subset of RFC 6902. |
| `preview` | object | No |  | Preview response controls (apply=false). |
| `preview.verbosity` | `full` \| `compact` | No | `"full"` | full includes structured before/after payloads; compact returns summary + hunks only. |
| `apply` | boolean | No | `false` |  |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `receipt` | object | Yes |  |
| `artifacts` | string[] | Yes |  |
| `diagnosticsPath` | string | No |  |
| `transcriptPath` | string | Yes |  |
| `bundleIndexPath` | string | Yes |  |
| `preview` | object | No |  |
| `artifactsDetail` | _ref_[] | No |  |

## Error Codes

| Code | Description |
|------|-------------|
| `OODS-V001` | Input validation failed |
| `OODS-S001` | Internal server error |

## Example Request

```json
{}
```
