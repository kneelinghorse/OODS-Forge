# design.preview

> Open a public object/context as the generated React or Vue app actually running in a browser. Composes the screen, generates one or both frameworks, seeds the deterministic field model, stores the preview beside the saved-schema store and compiles each artifact once through the preview host; returns one URL per framework with the schema hash and the compiled module digests. The HTTP bridge hosts the preview in-process and the stdio adapter starts it on 127.0.0.1 for Claude Desktop, Claude Code and Cursor, so the extracted runtime bundle serves it with no Vite, npm install or browser automation. Typed limit: without a reachable host (a native server run on its own, a host reading another schema store root, or a platform without a bundled esbuild binary) the outcome is OODS-N021, retryable, with the host details in data. Writes only the preview record; never saves or edits a schema. A running preview is an observation, not usability certification.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `object` | string | Yes |  | Object name from the OODS registry (e.g., 'Subscription', 'User'). When provided, composition uses trait-driven component placement via view_extensions. |
| `context` | `detail` \| `list` \| `form` \| `timeline` \| `card` \| `inline` \| `workflow` | Yes |  | View context for object-aware composition. Determines which view_extensions are applied. When object is provided without layout, context infers the layout (detail→detail, list→list, form→form). workflow assembles list/detail/form/timeline screens with trait actions, routes, four UI states and generated application data. |
| `framework` | `react` \| `vue` \| `both` | No | `"both"` | Which generated app to compile and serve; both frameworks by default, each at its own URL. |
| `preferences` | object | No |  |  |
| `preferences.theme` | `light` \| `dark` \| `hc` | No | `"light"` | Theme the page mounts with (data-theme and the matching token CSS scope). |
| `preferences.brand` | `A` \| `B` | No | `"A"` | Brand the page mounts with (data-brand and the matching token CSS scope). |
| `preferences.metricColumns` | integer | No |  | Number of metric columns for dashboard layout. |
| `preferences.fieldGroups` | integer | No |  | Number of field groups for form layout. |
| `preferences.tabCount` | integer | No |  | Number of tabs for detail layout. |
| `preferences.tabLabels` | string[] | No |  | Custom tab labels for detail layout. |
| `preferences.componentOverrides` | Record<string, string> | No |  | Slot-name → component-name overrides (e.g., { 'items': 'Table' }). |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `status` | any | Yes |  |
| `schemaHash` | string | Yes | Canonical hash of the composed schema; the preview key is its first sixteen hex characters. |
| `key` | string | Yes |  |
| `previewUrl` | string | Yes | The first compiled framework's page; open it in a browser. |
| `previews` | object[] | Yes |  |
| `host` | object | Yes |  |
| `brand` | `A` \| `B` | Yes |  |
| `theme` | `light` \| `dark` \| `hc` | Yes |  |
| `recordPath` | string | Yes |  |
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
  "context": "detail",
  "framework": "react",
  "preferences": {
    "theme": "dark",
    "brand": "B"
  }
}
```
