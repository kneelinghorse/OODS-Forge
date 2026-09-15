# design.compose

> Compose a complete UiSchema from a natural-language intent description. Returns schemaRef for reuse in validate/render/code.generate. schemaRef includes createdAt/expiresAt timestamps (default TTL: 30 minutes) and lives in the server process that issued it: a restarted client starts a new server that does not know earlier refs and returns OODS-N003 for them. Use schema.save to persist beyond TTL or across sessions. Every successful composition is recorded as a durable version (compositions/<compositionId>/versions/<n>.json beside the saved-schema store) and the result carries compositionId, version, parentVersion, operation and head; pass compositionId to record the result as that composition's next version, or options.transient to record nothing. design.preview opens any version at /preview/<compositionId>/<version>. preferences.regionOrder, preferences.fieldOrder and preferences.seed are the override surface edits re-compose through; the seed is recorded on the schema and rotates the deterministic sample data.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `intent` | string | Yes |  | Natural-language description of the desired UI (e.g., 'dashboard with metrics and sidebar', 'user registration form'). |
| `object` | string | Yes |  | Object name from the OODS registry (e.g., 'Subscription', 'User'). When provided, composition uses trait-driven component placement via view_extensions. |
| `context` | `detail` \| `list` \| `form` \| `timeline` \| `card` \| `inline` \| `workflow` | No |  | View context for object-aware composition. Determines which view_extensions are applied. When object is provided without layout, context infers the layout (detail→detail, list→list, form→form). workflow assembles list/detail/form/timeline screens with trait actions, routes, four UI states and generated application data. |
| `layout` | `dashboard` \| `form` \| `detail` \| `list` \| `card` \| `timeline` \| `landing` \| `auto` | No | `"auto"` | Layout template to use. 'landing' is a content/marketing page (hero + sections + CTA), not bound to a data object. 'auto' infers the best template from intent keywords. |
| `preferences` | object | No |  |  |
| `preferences.brand` | `A` \| `B` | No |  | Brand scope for data-bound charts; defaults to A. |
| `preferences.theme` | string | No |  | Theme token (e.g., 'light', 'dark'). |
| `preferences.metricColumns` | integer | No |  | Number of metric columns for dashboard layout. |
| `preferences.fieldGroups` | integer | No |  | Number of field groups for form layout. |
| `preferences.tabCount` | integer | No |  | Number of tabs for detail layout. |
| `preferences.tabLabels` | string[] | No |  | Custom tab labels for detail layout. |
| `preferences.componentOverrides` | Record<string, string> | No |  | Slot-name → component-name overrides (e.g., { 'items': 'Table' }). |
| `preferences.regionOrder` | string[] | No |  | The screen's regions (its direct children) by id in the desired order; regions not listed keep their relative order after the listed ones. Applied after composition; the composer never edits a schema by hand. |
| `preferences.fieldOrder` | Record<string, string[]> | No |  | Region id → field names in the desired order among sibling field nodes of that region (a field editor, a read-only row, or a slot placing a field component); fields not listed keep their relative order after the listed ones. |
| `preferences.seed` | string | No |  | Sample-data seed. Rotates the deterministic sample records (labels, names and derived values) generated for previews and workflow apps; recorded on the schema as `seed` and nothing else in the schema changes. |
| `options` | object | No |  |  |
| `options.validate` | boolean | No | `true` | Auto-validate the generated schema via the `repl` tool's `validate` action. |
| `options.topN` | integer | No | `3` | Number of component candidates to return per slot. |
| `options.transient` | boolean | No | `false` | Do not record a composition version; the result then carries no compositionId. For scratch compositions only. |
| `options.operation` | `recompose` \| `reorder-region` \| `swap-slot` \| `reorder-fields` \| `seed` | No |  | With compositionId: the lineage operation recorded on the new version; default recompose. design.preview action edit sets it. |
| `compositionId` | string | No |  | Record this composition as the next version of an existing composition (operation "recompose") instead of creating a new one. |
| `parentVersion` | integer | No |  | With compositionId: the version the new one derives from; default the latest. |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `status` | `ok` \| `error` | Yes | Whether composition succeeded. |
| `layout` | string | Yes | The layout template that was used. |
| `schema` | _ref_ | Yes | The generated UiSchema (with slot placeholders intact for agent customization). |
| `schemaRef` | string | No | Server-managed reference to the generated schema for reuse in validate/render/code.generate. |
| `schemaRefCreatedAt` | string | No | ISO timestamp when the schemaRef was created. |
| `schemaRefExpiresAt` | string | No | ISO timestamp when the schemaRef expires. |
| `compositionId` | string | No | The durable composition this result was recorded as; absent for transient compositions. Every version opens at /preview/<compositionId>/<version> on the preview host. |
| `version` | integer | No | The recorded version number (1 for a new composition). |
| `parentVersion` | integer \| null | No | The version this one derives from; null for the first. |
| `operation` | `compose` \| `recompose` \| `reorder-region` \| `swap-slot` \| `reorder-fields` \| `seed` | No | How this version was produced. |
| `head` | string \| null | No | The Forge build head that produced it; null from a source checkout. |
| `selections` | _ref_[] | Yes | Component selection results per slot. |
| `validation` | object | No |  |
| `warnings` | _ref_[] | Yes | Non-fatal issues during composition. |
| `errors` | _ref_[] | No | Fatal issues that prevented composition. |
| `objectUsed` | object | No |  |
| `meta` | object | No |  |

## Error Codes

| Code | Description |
|------|-------------|
| `OODS-V001` | Input validation failed |
| `OODS-S001` | Internal server error |
| `OODS-V006` | Unknown component during slot selection |
| `OODS-N001` | Object not found in registry |

## Example Request

```json
{
  "intent": "<intent>"
}
```
