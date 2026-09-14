# code.generate

> Generate a versioned, content-addressed React, Vue, or HTML file-set artifact from a validated UiSchema tree. Select draft, build, or release validation; build is the default runnable-artifact gate, and every response includes a validationReceipt naming applied policy, checks, omissions, and evidence disposition. Receipts produced after artifact construction also name that artifact's content hash. Release receipts retain accepted caller-supplied evidence references without claiming independent execution. The artifact includes exact dependencies and required consumer-supplied domain actions. Legacy code/fileExtension/imports aliases remain for compatibility. Accepts schemaRef from design.compose; save it before the 30-minute reference expires. Release receipts explicitly report evidenceVerification:hash-bound-not-re-executed. References are format-checked and hash-bound, not re-executed. OODS-V162 reports missing evidence; OODS-V163 reports an artifact hash mismatch. Portable React/Vue generation uses an assembly-time readiness attestation bound to shipped package bytes and emits real artifacts without source or test files. Missing or tampered readiness evidence returns OODS-N015 without an artifact. Host repository generation retains direct readiness checks. Application options.theme accepts light, dark and hc, with options.brand A or B, for both the shell and embedded chart assets. Subscription/detail HC area SVG assets pass through the same public viz.render boundary and remain verbatim in React and Vue. Bound record-array charts support bar, line, area, scatter and heatmap with explicit sampleRows; trait titles, descriptions and units accompany generated static SVG. Invoice bar and Usage line are authored in detail and dashboard layouts. Relationship detail and workflow declare an edge-array force_graph over optional neighborhood rows, explicitly labelled synthetic. Source and target IDs produce sorted distinct nodes and row-ordered directed links; a true bidirectional flag adds the reverse link, with directed-pair deduplication and no invented values or groups. Missing or malformed edge fields fail closed. VizGraphPreview embeds the exact public SVG inside a named wrapper. React/Vue application output is supported. Static HTML tab panel trees preserve nested content and layout. Full Invoice/Usage detail HTML remains a typed OODS-V007 static-action limit: HTML has no runtime for domain actions such as Edit/Delete/View timeline. Owner: Forge code-generation maintainers, enforced by target-contracts.ts.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
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
| `options.theme` | `light` \| `dark` \| `hc` | No |  | Application and embedded chart theme. React/Vue app shells default to light and set the scope on html and body, including at mount. Unscoped HTML preserves the schema theme and existing repl.render document defaults. |
| `options.brand` | `A` \| `B` | No |  | Token brand shared by the generated shell and embedded charts. React/Vue app shells default to A. Unscoped HTML preserves the existing document default brand; an explicit HTML theme without a brand selects A. |
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
| `OODS-N013` | HTML renderer unavailable; fallback output is forbidden at build or release confidence |
| `OODS-N015` | Component is unavailable for the requested React or Vue target |
| `OODS-N016` | Generated artifact dependency closure is invalid |
| `OODS-S006` | HTML rendering failed |

## Example Request

```json
{
  "framework": "react"
}
```
