# design.preview

> Open a composition version as the generated React or Vue app actually running in a browser: an existing compositionId (and optional version) or an object and context composed now as a new composition. Generates one or both frameworks onto the version, seeds the deterministic field model, compiles each artifact once through the preview host and returns one URL per framework with the lineage (compositionId, version, parentVersion, operation, head), the schema hash and the compiled module digests; the page shows the lineage beside the running app with brand, theme and width controls, and brand and theme re-mount the app in place. The HTTP bridge hosts the preview in-process and the stdio adapter starts it on 127.0.0.1 for Claude Desktop, Claude Code and Cursor, so the extracted runtime bundle serves it with no Vite, npm install or browser automation. Typed limits: without a reachable host (a native server run on its own, a host reading another schema store root, or a platform without a bundled esbuild binary) the outcome is OODS-N021, retryable, with the host details in data; an unknown composition or version is OODS-N022. Writes only the version's artifacts and model; never saves or edits a schema. A running preview is an observation, not usability certification.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `compositionId` | string | Yes |  | An existing composition from design.compose; with no version, its latest version opens. |
| `version` | integer | No |  | The version of compositionId to open. |
| `object` | string | Yes |  | Object name from the OODS registry (e.g., 'Subscription', 'User'); with context, composes a new composition (version 1) and opens it. |
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
| `compositionId` | string | Yes |  |
| `version` | integer | Yes |  |
| `parentVersion` | integer \| null | Yes |  |
| `operation` | `compose` \| `recompose` \| `reorder-region` \| `swap-slot` \| `reorder-fields` \| `seed` | Yes |  |
| `head` | string \| null | Yes |  |
| `schemaHash` | string | Yes | Canonical hash of the version's composed schema. |
| `object` | string | Yes |  |
| `context` | string | Yes |  |
| `previewUrl` | string | Yes | The first compiled framework's page with lineage and controls; open it in a browser. |
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
  "preferences": {
    "theme": "dark",
    "brand": "B"
  }
}
```
