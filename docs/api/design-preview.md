# design.preview

> Render a public object/context through the same local browser design loop used by pnpm design:loop render. Returns exact React/Vue receipts with screenshots, accessibility text, layout measurements, browser errors, and schema/artifact hashes. Defaults to both frameworks at 390/820/1440 px. Requires pnpm design:loop serve in this checkout; OODS-N019 explains how to start it when unavailable. Writes isolated local receipt artifacts only; never saves or edits a schema. This observation is not usability certification.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `object` | string | Yes |  | Object name from the OODS registry (e.g., 'Subscription', 'User'). When provided, composition uses trait-driven component placement via view_extensions. |
| `context` | `detail` \| `list` \| `form` \| `timeline` \| `card` \| `inline` \| `workflow` | Yes |  | View context for object-aware composition. Determines which view_extensions are applied. When object is provided without layout, context infers the layout (detail→detail, list→list, form→form). workflow assembles list/detail/form/timeline screens with trait actions, routes, four UI states and generated application data. |
| `framework` | `react` \| `vue` \| `both` | No | `"both"` |  |
| `widths` | integer[] | No | `[390,820,1440]` |  |
| `preferences` | object | No |  |  |
| `preferences.theme` | string | No |  | Theme token (e.g., 'light', 'dark'). |
| `preferences.metricColumns` | integer | No |  | Number of metric columns for dashboard layout. |
| `preferences.fieldGroups` | integer | No |  | Number of field groups for form layout. |
| `preferences.tabCount` | integer | No |  | Number of tabs for detail layout. |
| `preferences.tabLabels` | string[] | No |  | Custom tab labels for detail layout. |
| `preferences.componentOverrides` | Record<string, string> | No |  | Slot-name → component-name overrides (e.g., { 'items': 'Table' }). |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `status` | any | Yes |  |
| `schemaHash` | string | Yes |  |
| `receipts` | object[] | Yes | Exact receipts validated against scripts/design-loop/receipt.schema.json by the shared render leg. |
| `receiptPaths` | string[] | Yes |  |
| `durationMs` | number | Yes |  |

## Error Codes

| Code | Description |
|------|-------------|
| `OODS-V001` | Input validation failed |
| `OODS-S001` | Internal server error |

## Example Request

```json
{
  "object": "Subscription",
  "context": "list",
  "framework": "react"
}
```
