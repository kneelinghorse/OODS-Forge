# pipeline

> Execute the full design pipeline (compose -> validate -> render -> codegen) in a single call. It forwards draft, build, or release generation validation without downgrade and always discloses the applied validationReceipt plus target resolution provenance. The code step carries the versioned artifact without flattening, including exact dependencies and required consumer-supplied domain actions. Defaults to compact render mode (token CSS omitted, ~40% smaller). Supports optional validation/render skipping, accessibility checks, and schema persistence via save parameter. Returns schemaRefCreatedAt/schemaRefExpiresAt (default TTL: 30 minutes); use save to persist the schema. Release receipts explicitly report evidenceVerification:hash-bound-not-re-executed. References are format-checked and hash-bound, not re-executed. OODS-V162 reports missing evidence; OODS-V163 reports an artifact hash mismatch. Portable React/Vue generation uses an assembly-time readiness attestation bound to shipped package bytes and emits real artifacts without source or test files. Missing or tampered readiness evidence returns OODS-N015 without an artifact. Host repository generation retains direct readiness checks.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `object` | string | No |  | Object name from the OODS registry (e.g., Subscription, User). |
| `intent` | string | No |  | Natural-language description of the desired UI. |
| `context` | `detail` \| `list` \| `form` \| `timeline` \| `card` \| `inline` \| `workflow` | No |  | View context for object-aware composition. |
| `layout` | `dashboard` \| `form` \| `detail` \| `list` \| `card` \| `timeline` \| `landing` \| `auto` | No |  | Layout template to use. 'landing' is a content/marketing page (hero + sections + CTA), not bound to a data object. 'auto' infers the best template from intent keywords. |
| `preferences` | object | No |  |  |
| `preferences.theme` | string | No |  | Theme token (e.g., 'light', 'dark'). |
| `preferences.metricColumns` | integer | No |  | Number of metric columns for dashboard layout. |
| `preferences.fieldGroups` | integer | No |  | Number of field groups for form layout. |
| `preferences.tabCount` | integer | No |  | Number of tabs for detail layout. |
| `preferences.tabLabels` | string[] | No |  | Custom tab labels for detail layout. |
| `preferences.componentOverrides` | Record<string, string> | No |  | Slot-name to component-name overrides (e.g., { 'items': 'Table' }). |
| `actionMappings` | object[] | No |  | Sprint 88: Stage1 BridgeSummary action_mappings, flat verb-keyed entries. See docs/integration/stage1-oods-contract.md §2c. |
| `framework` | `react` \| `vue` \| `html` | No |  | Target framework for code generation. |
| `styling` | `inline` \| `tokens` \| `tailwind` | No |  | Styling strategy for code generation. |
| `profile` | `draft` \| `build` \| `release` | No |  | Validation profile forwarded unchanged to code.generate, including its workflow-state contract gate. build is the default runnable-artifact gate. |
| `releaseEvidence` | object | No |  | Hash-bound release evidence forwarded unchanged to code.generate. |
| `releaseEvidence.rendered` | _ref_ | No |  |  |
| `releaseEvidence.interaction` | _ref_ | No |  |  |
| `releaseEvidence.accessibility` | _ref_ | No |  |  |
| `releaseEvidence.theme` | _ref_ | No |  |  |
| `releaseEvidence.determinism` | _ref_ | No |  |  |
| `releaseEvidence.performance` | _ref_ | No |  |  |
| `save` | any | No |  | Optional schema save config. String for name-only, or { name, tags } for full control. |
| `options` | object | No |  |  |
| `options.skipValidation` | boolean | No |  | Skip the validate step (default false). |
| `options.skipRender` | boolean | No |  | Skip the render step (default false). |
| `options.checkA11y` | boolean | No |  | Enable a11y contrast checks in validate (default false). |
| `options.renderApply` | boolean | No |  | Render with apply=true to include HTML output (default true). |
| `options.compact` | boolean | No | `true` | When true (default), omit token CSS from render output and return tokenCssRef instead. Reduces response size by ~40%. |
| `options.typescript` | boolean | No |  | Alias: enable TypeScript output in code generation. |
| `options.styling` | `inline` \| `tokens` \| `tailwind` | No |  | Alias: styling strategy. Overridden by top-level styling if both provided. |
| `options.framework` | `react` \| `vue` \| `html` | No |  | Alias: target framework. Overridden by top-level framework if both provided. |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `validationReceipt` | _ref_ | Yes | Mandatory generation-profile disclosure. Pipeline preserves code.generate checks and accepted caller-supplied evidence envelopes, verifies the child receipt against the requested profile and artifact, and records target resolution provenance. |
| `schemaRef` | string | No | Schema reference returned by compose, reusable across tools. |
| `schemaRefCreatedAt` | string | No | ISO timestamp when the schemaRef was created. |
| `schemaRefExpiresAt` | string | No | ISO timestamp when the schemaRef expires. Use schema.save to persist before expiry. |
| `schemaRefTtlWarning` | object | No | Proactive warning when schemaRef TTL is approaching expiration (< 5 minutes remaining). |
| `compose` | object | Yes |  |
| `validation` | object | No |  |
| `render` | object | No |  |
| `code` | object | No |  |
| `saved` | object | No |  |
| `summary` | string | No | One-line natural language description of what was generated. |
| `metrics` | object | No | Quality metrics for the pipeline output. |
| `pipeline` | object | Yes |  |
| `error` | object | No |  |

## Error Codes

| Code | Description |
|------|-------------|
| `OODS-V001` | Input validation failed |
| `OODS-S001` | Internal server error |
| `OODS-V003` | Compose input is missing a usable intent or object |
| `OODS-V006` | Validation found a component outside the OODS registry |
| `OODS-V007` | Validation or code-generation schema/target contract failed |
| `OODS-V008` | Validation found duplicate node IDs |
| `OODS-V119` | Code generation found an unregistered component |
| `OODS-V162` | Code generation is missing required release evidence |
| `OODS-V163` | Release evidence artifact hash does not match generated artifact |
| `OODS-N003` | A pipeline SchemaRef was not found |
| `OODS-N004` | A pipeline SchemaRef expired |
| `OODS-N013` | HTML renderer unavailable; fallback output is forbidden at build or release confidence |
| `OODS-N015` | Component is unavailable for the requested React or Vue target |
| `OODS-N016` | Generated artifact dependency closure is invalid |
| `OODS-N017` | Code generation reported success without an artifact envelope |
| `OODS-C001` | Compose completed without returning a SchemaRef |
| `OODS-S004` | Compose could not load the requested object |
| `OODS-S005` | Compose could not load the component catalog |
| `OODS-S006` | HTML rendering failed during code generation |
| `OODS-S009` | A failed step omitted its structured issue, or code generation returned a missing, invalid, downgraded, or target-mismatched receipt/artifact |
| `OODS-S010` | Compose step threw an exception |
| `OODS-S011` | Validate step threw an exception |
| `OODS-S012` | Render step threw an exception |
| `OODS-S013` | Code-generation step threw an exception |
| `OODS-S014` | Save step threw an exception |

## Example Request

```json
{}
```
