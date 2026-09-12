# health

> Read server readiness, live registry/store counts and retained proof summaries. tokens lists brands, themes and scopes from the built css-variables-by-scope.json, plus defaultScope {brand, theme, source: env|default}; this is configured default metadata, never an observed consumer scope. Missing built scopes are reported as unavailable. includeChangelog and sinceVersion select the reported DSL changelog; request-level DSL version selection is not supported. productReality.viz reports the generated taxonomy counts: types, patterns, families, classified, coreCells, coreSurfaceComplete and typedGaps. A surface-complete cell has public pixels from an identity assigned to that cell; missing or invalid taxonomy yields null and degraded health.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `includeChangelog` | boolean | No | `false` | When true, include DSL version changelog in the response. |
| `sinceVersion` | string | No |  | When provided with includeChangelog, only return changelog entries since this version. |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `productReality` | object | Yes | Runtime, portable release, tool and visualization evidence summaries. Release identifies the measured bundle archive and 42 reference-application cells with artifact parity to the host; unavailable ledgers are null. |
| `status` | `ok` \| `degraded` | Yes |  |
| `server` | object | Yes |  |
| `registry` | object | Yes |  |
| `tokens` | object | Yes |  |
| `schemas` | object | Yes |  |
| `latency` | integer | Yes |  |
| `warnings` | string[] | No |  |
| `dslVersion` | string | No | Current DSL version of this server. |
| `changelog` | object[] | No | DSL version changelog entries, included when requested via includeChangelog input. |

## Error Codes

| Code | Description |
|------|-------------|
| `OODS-V001` | Input validation failed |
| `OODS-S001` | Internal server error |

## Example Request

```json
{}
```
