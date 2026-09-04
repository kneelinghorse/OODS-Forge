# code.generate

> Generate a versioned, content-addressed React, Vue, or HTML file-set artifact from a validated UiSchema tree. The success payload includes exact dependency versions and kinds plus a deterministic artifact.actions contract for every required consumer-supplied domain action; compatible occurrences are grouped by action name with portable parameters and every raising schema source. Legacy code/fileExtension/imports aliases remain for compatibility. Accepts schemaRef from design.compose; save it before the 30-minute reference expires.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `dslVersion` | string | No |  | DSL version to use for this request. Defaults to the current version (1.0). |
| `schema` | _ref_ | No |  | A validated UiSchema tree to generate code from. |
| `schemaRef` | string | No |  | Reference to a cached UiSchema returned by design.compose. |
| `framework` | `react` \| `vue` \| `html` | Yes |  | Target framework for code generation. HTML delegates to the `repl` tool's `render` action (document mode). |
| `options` | object | No | `{}` |  |
| `options.typescript` | boolean | No | `true` | When true, emit TypeScript prop types (React) or typed defineProps (Vue). Ignored for HTML. |
| `options.styling` | `inline` \| `tokens` \| `tailwind` | No | `"tokens"` | Styling strategy: inline style objects, design-token CSS variables, or Tailwind utility classes. |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `status` | `ok` \| `error` | Yes | Whether code generation succeeded. |
| `framework` | `react` \| `vue` \| `html` | Yes | The target framework that was used. |
| `artifact` | _ref_ | No | Primary versioned, content-addressed file-set payload. Required when status is ok. |
| `code` | string | Yes | Deprecated v0 compatibility alias for artifact.files[0].contents. Empty string on error. |
| `fileExtension` | string | Yes | Deprecated v0 compatibility alias for the primary generated file extension. |
| `imports` | string[] | Yes | Deprecated v0 compatibility alias. Use artifact.dependencies for exact versions and dependency kinds. |
| `warnings` | _ref_[] | Yes | Non-fatal issues encountered during generation. |
| `errors` | _ref_[] | No | Fatal issues that prevented code generation. |
| `meta` | object | No |  |

## Error Codes

| Code | Description |
|------|-------------|
| `OODS-V001` | Input validation failed |
| `OODS-S001` | Internal server error |
| `OODS-V005` | Unknown framework |
| `OODS-V006` | Unknown component (no emitter) |
| `OODS-N002` | Schema ref not found or expired |

## Example Request

```json
{
  "framework": "react"
}
```
