# tokens.build

> Return built design-token artifacts. brand/theme select resolved requested-scope JSON and CSS. Full CSS includes every built scope; TypeScript and Tailwind artifacts retain legacy A/light defaults. Use apply=true to write artifacts, building missing outputs with captured failures; default dry-run returns preview only.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `brand` | `A` \| `B` | No | `"A"` | Selects resolved values in the requested-scope JSON and CSS. Full CSS also includes every built scope; TypeScript and Tailwind artifacts retain legacy A/light defaults. |
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
