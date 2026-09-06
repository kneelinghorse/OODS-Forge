# code.generate

> Generate a versioned, content-addressed React, Vue, or HTML file-set artifact from a validated UiSchema tree. Select draft, build, or release validation; build is the default runnable-artifact gate, and every response includes a validationReceipt naming applied policy, checks, omissions, and evidence disposition. Receipts produced after artifact construction also name that artifact's content hash. Release receipts retain accepted caller-supplied evidence references without claiming independent execution. The artifact includes exact dependencies and required consumer-supplied domain actions. Legacy code/fileExtension/imports aliases remain for compatibility. Accepts schemaRef from design.compose; save it before the 30-minute reference expires.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `dslVersion` | string | No |  | DSL version to use for this request. Defaults to the current version (1.0). |
| `schema` | _ref_ | No |  | A structurally valid UiSchema tree to generate code from. UiElement.state branches are checked against the canonical workflow-state vocabulary by the state-contract gate. |
| `schemaRef` | string | No |  | Reference to a cached UiSchema returned by design.compose. |
| `framework` | `react` \| `vue` \| `html` | Yes |  | Target framework for code generation. HTML delegates to the `repl` tool's `render` action (document mode). |
| `profile` | `draft` \| `build` \| `release` | No |  | Validation profile. draft reports non-structural target/contract gaps, including workflow-state contract gaps, as warnings; build is the default runnable-artifact gate; release additionally requires hash-bound evidence. |
| `releaseEvidence` | object | No |  | Evidence for release. All six named classes are required by the release gate and must bind to the generated artifact contentHash. |
| `releaseEvidence.rendered` | _ref_ | No |  |  |
| `releaseEvidence.interaction` | _ref_ | No |  |  |
| `releaseEvidence.accessibility` | _ref_ | No |  |  |
| `releaseEvidence.theme` | _ref_ | No |  |  |
| `releaseEvidence.determinism` | _ref_ | No |  |  |
| `releaseEvidence.performance` | _ref_ | No |  |  |
| `options` | object | No | `{}` |  |
| `options.typescript` | boolean | No | `true` | When true, emit TypeScript prop types (React) or typed defineProps (Vue). Ignored for HTML. |
| `options.styling` | `inline` \| `tokens` \| `tailwind` | No | `"tokens"` | React/Vue styling strategy: inline style objects, design-token CSS variables, or Tailwind utility classes. HTML uses document CSS; requesting Tailwind reports OODS-N018 as a draft warning or a build/release error. |

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
| `validationReceipt` | _ref_ | Yes | Mandatory disclosure of the applied profile, independent policy axes, checks performed, and checks not reached. When generation reaches an artifact, the receipt names its content hash; release receipts retain accepted caller-supplied evidence envelopes for auditability. |
| `errors` | _ref_[] | No | Fatal issues that prevented code generation. |
| `meta` | object | No |  |

## Error Codes

| Code | Description |
|------|-------------|
| `OODS-V001` | Input validation failed |
| `OODS-S001` | Internal server error |
| `OODS-V005` | No emitter is registered for the requested framework |
| `OODS-V007` | UiSchema structure, normalization, syntax, binding, prop, slot, or event contract failed |
| `OODS-V009` | Neither schema nor schemaRef was provided |
| `OODS-V119` | Schema contains an unregistered component |
| `OODS-V162` | Required release evidence is missing |
| `OODS-V163` | Release evidence artifact hash does not match generated artifact |
| `OODS-N003` | SchemaRef was not found |
| `OODS-N004` | SchemaRef has expired |
| `OODS-N013` | HTML target has no mapped renderer or generated fallback output |
| `OODS-N015` | Component is unavailable for the requested React or Vue target |
| `OODS-N016` | Generated artifact dependency closure is invalid |
| `OODS-S006` | HTML rendering failed |

## Example Request

```json
{
  "framework": "react"
}
```
