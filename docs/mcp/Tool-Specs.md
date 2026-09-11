# MCP Tool Specs (v1.0)

This document is the operator-facing contract surface for the OODS Foundry MCP server: tool names, registration rules, and the expected input/output shapes (backed by the JSON schemas in `packages/mcp-server/src/schemas/`).

For exhaustive per-tool parameter tables across the full live tool surface, also use `docs/api/README.md`.

## Registration + enablement

Auto tools are registered by default (19 at the time of writing). On-demand tools are only registered when enabled (5 at the time of writing).

- Enable every on-demand tool: `MCP_TOOLSET=all`
- Enable a subset: `MCP_EXTRA_TOOLS=a11y.scan,diag.snapshot`

Registry source of truth: `packages/mcp-server/src/tools/registry.json` (copied to `dist/tools/registry.json` on build).

Removed in v1.0: `design.generate` (it was a stub and is no longer shipped).

## Project-level defaults (`.oodsrc`)

Place a `.oodsrc` JSON file in the project root to set default options for `pipeline`, `design.compose`, and `code.generate`. Explicit tool params always override `.oodsrc` values. A missing or invalid `.oodsrc` is silently ignored.

```json
{
  "framework": "vue",
  "styling": "tailwind",
  "typescript": false,
  "brand": "acme",
  "context": "detail",
  "layout": "dashboard",
  "preferences": {
    "theme": "dark",
    "metricColumns": 4,
    "fieldGroups": 2,
    "tabCount": 3,
    "tabLabels": ["Info", "Settings", "Advanced"]
  },
  "pipeline": {
    "checkA11y": true,
    "compact": false
  }
}
```

| Field | Type | Default | Consumed by |
|-------|------|---------|-------------|
| `framework` | `react` \| `vue` \| `html` | `react` | pipeline, code.generate |
| `styling` | `inline` \| `tokens` \| `tailwind` | `tokens` | pipeline, code.generate |
| `typescript` | boolean | `true` | code.generate |
| `brand` | string | — | reserved |
| `context` | `detail` \| `list` \| `form` \| `timeline` \| `card` \| `inline` \| `workflow` | — | design.compose |
| `layout` | `dashboard` \| `form` \| `detail` \| `list` \| `auto` | `auto` | design.compose |
| `preferences` | object | — | design.compose |
| `pipeline.checkA11y` | boolean | `false` | pipeline |
| `pipeline.compact` | boolean | `true` | pipeline |

Precedence: explicit param → `.oodsrc` value → hardcoded default.

## Cross-tool semantics

- `schemaRef` TTL: refs returned by `design.compose`, `pipeline`, and `schema.load` (and the `specRef` trio from `viz.render`) expire after 30 minutes. Persist work with `schema.save` before expiry if you need cross-session reuse.
- `apply`: write-capable tools default to dry-run/preview behavior. Set `apply: true` only when you want artifacts written or heavy outputs returned. `repl.render` returns HTML/fragments only when `apply: true`.
- `compact`: `pipeline` defaults to compact render output and returns `tokenCssRef` instead of inlining token CSS. `repl.render` keeps full token CSS by default; opt into compact mode with `output.compact: true`.
- Trait-name formats vary by tool family:
  - `catalog.list` and `map.*` use canonical structured-data trait names such as `Stateful`, `Labelled`, or `Priceable`
  - `object.list` accepts full or suffix-matched namespaced object traits such as `lifecycle/Stateful` or `Stateful`

## Transport

The MCP server speaks newline-delimited JSON over stdio.

Request:
```json
{ "id": "1", "tool": "catalog.list", "input": {} }
```

Response (success):
```json
{ "id": "1", "result": { "status": "ok" } }
```

Response (error):
```json
{ "id": "1", "error": { "code": "SCHEMA_INPUT", "message": "Input validation failed" } }
```

---

## Auto tool contracts (19 registry entries)

The 19 default entries come from `packages/mcp-server/src/tools/registry.json`. Every live entry has one grouped section below, with complete parameter tables linked under `docs/api/*`.

### `tokens.build`

Portable calls support dry-run preview/transcript only: apply:true needs omitted legacy tokens.ts and host build inputs.

- **Input schema**: `packages/mcp-server/src/schemas/tokens.build.input.json`
- **Output schema**: `packages/mcp-server/src/schemas/generic.output.json`
- **Policy**: designer, maintainer | writes `${BASE}/${DATE}/**` | timeout 60s | rate 30/min | concurrency 1
- **Purpose**: Return requested-scope JSON and CSS for `brand`/`theme`, full compiled CSS, and explicitly labelled legacy A/light TypeScript and Tailwind artifacts. Missing build outputs trigger both real build stages; failures return `OODS-S019`. Always emit a transcript + bundle index on success.

Example input:
```json
{ "brand": "A", "theme": "dark", "apply": false }
```

Example output:
```json
{
  "artifacts": [],
  "transcriptPath": "artifacts/current-state/2026-02-24/tokens.build/transcript.json",
  "bundleIndexPath": "artifacts/current-state/2026-02-24/tokens.build/bundle.json",
  "preview": {
    "summary": "Preview only: would return 5 token artifacts for brand A (dark theme).",
    "notes": [
      "artifact: tokens.dark.json",
      "artifact: tokens.css",
      "artifact: tokens.scope.css",
      "artifact: tokens.ts",
      "artifact: tokens.tailwind.json"
    ]
  }
}
```

Notes:
- `apply=true` writes token artifacts under the run directory; `apply=false` is preview-only.
- Preview responses include a summary of expected artifacts when `apply=false`.

---

[Complete input/output reference](../api/tokens-build.md).

### `structuredData.fetch`

- **Input schema**: `packages/mcp-server/src/schemas/structuredData.fetch.input.json`
- **Output schema**: `packages/mcp-server/src/schemas/structuredData.fetch.output.json`
- **Policy**: designer, maintainer | read-only | timeout 30s | rate 60/min | concurrency 4
- **Purpose**: Read structured datasets (`components`, `tokens`, `manifest`) with stable ETag support.

Example input:
```json
{ "dataset": "components", "ifNoneMatch": "deadbeef", "includePayload": true }
```

Versioned access:
```json
{ "dataset": "components", "version": "2026-02-20", "listVersions": false }
```

Example output (payload omitted when ETag matches):
```json
{
  "dataset": "components",
  "version": "2026-03-06",
  "generatedAt": "2026-03-06T02:51:49Z",
  "etag": "c4bfbbcca95bb631b5a528db5885161196ee357acacaf3de899e43b415be5608",
  "matched": true,
  "payloadIncluded": false,
  "path": "artifacts/structured-data/oods-components-2026-03-06.json",
  "manifestPath": "artifacts/structured-data/manifest.json",
  "sizeBytes": 472491,
  "schemaValidated": true,
  "meta": { "componentCount": 101, "traitCount": 41, "objectCount": 12, "domainCount": 1, "patternCount": 2 }
}
```

Notes:
- `version` (YYYY-MM-DD) requests a specific artifact version. Exact match preferred; nearest-available returned with a warning.
- `listVersions: true` returns available versions without payload.

---

[Complete input/output reference](../api/structuredData-fetch.md).

### `brand.apply`

Portable bundles omit canonical brand source; even apply:false returns a missing-source error.

- **Input schema**: `packages/mcp-server/src/schemas/brand.apply.input.json`
- **Output schema**: `packages/mcp-server/src/schemas/brand.apply.output.json`
- **Policy**: designer, maintainer | writes `${BASE}/${DATE}/**` | timeout 120s | rate 12/min | concurrency 1
- **Purpose**: Preview or apply governed token overlays (alias merge or RFC 6902 patch).

Example input (alias strategy preview):
```json
{
  "brand": "A",
  "strategy": "alias",
  "apply": false,
  "preview": { "verbosity": "compact" },
  "delta": { "typography": { "body": { "fontSize": 14 } } }
}
```

Example output (preview-only):
```json
{
  "artifacts": [],
  "transcriptPath": "artifacts/current-state/2026-02-24/review-kit/brand.apply/2026-02-24T05-00-00-000Z/transcript.json",
  "bundleIndexPath": "artifacts/current-state/2026-02-24/review-kit/brand.apply/2026-02-24T05-00-00-000Z/bundle.json",
  "preview": { "summary": "Updated 1 token value for brand A.", "notes": ["base: 1 updated token"] },
  "receipt": { "sourceWritten": false, "sourceFiles": [], "build": null }
}
```

Notes:
- `apply=true` writes canonical A/B source, runs both real token-build stages, and returns `receipt.sourceFiles` with before/after SHA256 and byte counts plus captured stdout/stderr/exit. Snapshots and diagnostics remain in the run directory. `apply=false` changes no source and returns `{sourceWritten:false,sourceFiles:[],build:null}`.
- Operator-only `MCP_BRAND_SOURCE_ROOT` selects a tokens package root containing `src/tokens/brands` and `scripts`; no caller path is accepted. Default: this repository’s `packages/tokens`.
- Build failure returns `OODS-S019` with the last 40 output lines and the receipt; source writes remain in place for inspection and repair. There is no automatic rollback.
- `preview.verbosity="compact"` omits full before/after payloads and specimens, returning summary + hunks only. Default is `full`.

---

[Complete input/output reference](../api/brand-apply.md).

### `brand.intake`

Validates the FORGE-SCALAR-DTCG-1 envelope without persistence. Fully accepted inline A/B documents with uniquely mapped themes return a consumable `delta` and `envelopeHash`. Brand creation and content-reference resolution are unavailable; `apply` is ignored bridge parity. Pass an accepted delta to `brand.apply` in a host repository.

[Complete input/output reference](../api/brand-intake.md).

### `catalog.list`

- **Input schema**: `packages/mcp-server/src/schemas/catalog.list.input.json`
- **Output schema**: `packages/mcp-server/src/schemas/catalog.list.output.json`
- **Policy**: designer, maintainer | read-only | timeout 30s | rate 60/min | concurrency 4
- **Purpose**: List component catalog entries derived from `artifacts/structured-data` exports.

Example input:
```json
{}
```

Example output (truncated, default summary + pagination):
```json
{
  "detail": "summary",
  "page": 1,
  "pageSize": 25,
  "returnedCount": 25,
  "totalCount": 109,
  "hasMore": true,
  "components": [
    {
      "name": "AddressCollectionPanel",
      "displayName": "AddressCollectionPanel",
      "categories": ["core"],
      "tags": ["address", "delivery", "location", "validation"],
      "contexts": ["detail"],
      "regions": ["detail", "form", "list", "timeline"],
      "traits": ["Addressable"]
    }
  ],
  "generatedAt": "2026-09-10T20:01:35Z",
  "stats": { "componentCount": 109, "traitCount": 41 }
}
```

Notes:
- The `2026-09-10` export retains 109 obligations and 41 traits: 75 React/Vue implementations, 109 HTML mappings, 75 verified accessibility and theme rows; interaction is 24 verified and 51 explicitly not applicable. The remaining 34 rows are unavailable with reasons. These cells come from the generated capability ledger; classifications remain proposed and `approvedRuntimeCensus` stays null.
- `status` and its filter retain legacy static-HTML mapping semantics: `stable` means mapped, `planned` means fallback. They do not advertise React/Vue availability or accessibility/theme/interaction maturity. Read each `productReality.surfaces` entry and its evidence.
- Optional additive `obligationScope` exposes accepted retain-109 decision #1788 independently of historical per-row classification proposals. Its `approvedRuntimeCensus` is null: the old 98 split is unapproved. Missing runtime code does not exclude an ID. Existing filters, pagination and status values are unchanged; strict clients should accept the documented additive output field after reconnecting.
- Unfiltered calls default to `detail: "summary"` with pagination (`pageSize: 25`). Use `page`/`pageSize` to navigate.
- To opt into full detail (props, slots, code references), set `detail: "full"` explicitly. Filtered calls default to full detail for backward compatibility.
- Trait filters use canonical structured-data trait names such as `Stateful`, `Priceable`, or `Addressable`.
- When `trait` yields zero results, responses include `suggestions.traits` with nearest valid trait names (case-insensitive + typo tolerance).

Example input (explicit full detail):
```json
{ "detail": "full", "category": "core" }
```

---

[Complete input/output reference](../api/catalog-list.md).

### `code.generate`

Portable React/Vue generation returns OODS-N015 because readiness source/test/declaration references are not shipped; host generation remains supported.

Subscription detail declares a read-only `VizAreaPreview.chart` over
`last_payment_at`, `next_payment_due_at`, and `amount / minorUnits`. This public
UiSchema declaration is rendered through `viz.render` during generation using
the compose theme and brand (default light/A). React and Vue receive an optional
typed `svg` prop with a seed default; workflows include one hashed static SVG
asset per seed record, selected by record id. These sample charts stay fixed
when the local record is edited; consumers can supply a replacement SVG.
Generated applications require no visualization runtime. The component embeds
the SVG verbatim in a labelled figure and retains the existing placeholder when
`svg` is omitted. Its passive SVG boundary rejects scripts, style blocks or
attributes, and external references.

- **Input schema**: `packages/mcp-server/src/schemas/code.generate.input.json`
- **Output schema**: `packages/mcp-server/src/schemas/code.generate.output.json`
- **Policy**: designer, maintainer | read-only | timeout 30s | rate 60/min | concurrency 4
- **Purpose**: Generate a versioned, content-addressed file-set artifact from a validated UiSchema. Supports React/TSX, Vue SFC, and HTML output. `artifact.actions` declares every required consumer-supplied domain action; compatible occurrences share one action entry and retain all raising schema sources.

Example input:
```json
{
  "schema": {
    "version": "2026.02",
    "screens": [
      {
        "id": "screen_main",
        "component": "Stack",
        "children": [
          { "id": "heading", "component": "Text", "props": { "content": "Welcome" } },
          { "id": "cta", "component": "Button", "props": { "label": "Get Started" } }
        ]
      }
    ]
  },
  "framework": "react",
  "options": { "typescript": true, "styling": "tokens" }
}
```

Example input (schemaRef shorthand):
```json
{
  "schemaRef": "compose-abc123",
  "framework": "react",
  "options": { "typescript": true, "styling": "tokens" }
}
```

Example output:
```json
{
  "status": "ok",
  "framework": "react",
  "artifact": {
    "schemaVersion": "1.0.0",
    "framework": "react",
    "files": [
      {
        "path": "src/GeneratedUI.tsx",
        "contents": "import React from 'react';\n...",
        "contentHash": "sha256:<64 lowercase hexadecimal characters>"
      }
    ],
    "dependencies": [
      { "name": "@oods/component-styles", "version": "0.1.0", "kind": "dependency" },
      { "name": "@oods/components-react", "version": "0.1.0", "kind": "dependency" },
      { "name": "react", "version": "19.2.0", "kind": "peerDependency" },
      { "name": "react-dom", "version": "19.2.0", "kind": "peerDependency" }
    ],
    "actions": [
      {
        "name": "handleRowActivate",
        "parameters": [{ "name": "rowId", "type": "string" }],
        "sources": [{ "nodeId": "subscriptions", "component": "Table", "event": "onRowActivate" }]
      }
    ],
    "contentHash": "sha256:<64 lowercase hexadecimal characters>"
  },
  "code": "import React from 'react';\n...",
  "fileExtension": ".tsx",
  "imports": ["react", "@oods/components-react", "@oods/component-styles/css"],
  "warnings": [],
  "validationReceipt": {
    "profile": "build",
    "defaulted": true,
    "rationale": "Build is the default minimum gate for a runnable artifact: target, bindings, dependencies, and fallbacks must resolve.",
    "axes": {
      "scope": "generated-artifact",
      "enforcement": "blocking",
      "fallback": "forbidden",
      "target": { "requested": "react", "resolved": "react", "source": "explicit" }
    },
    "checks": ["schema-structure", "component-registry", "target-readiness", "normalization-fidelity", "binding-contract", "props-contract", "slots-contract", "events-contract", "dependency-closure", "fallback-policy"],
    "notChecked": [
      "rendered-evidence", "interaction-evidence", "accessibility-evidence",
      "theme-evidence", "determinism-evidence", "performance-evidence",
      "certification-evidence"
    ],
    "evidence": {
      "required": [], "provided": [], "missing": [], "mismatched": [], "accepted": [], "notApplicable": [],
      "artifactContentHash": "sha256:<same value as artifact.contentHash>"
    }
  },
  "meta": { "nodeCount": 3, "componentCount": 3, "unknownComponents": [] }
}
```

Input fields:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `schema` | UiSchema | Yes (unless `schemaRef` provided) | A validated UiSchema tree |
| `schemaRef` | string | No | Cached schema reference from `design.compose` |
| `framework` | `"react"` \| `"vue"` \| `"html"` | Yes | Target framework |
| `profile` | `"draft"` \| `"build"` \| `"release"` | No (default `"build"`) | Named validation profile |
| `releaseEvidence` | object | Required by the release gate | Passed rendered, interaction, accessibility, theme, determinism, and performance evidence; every item names the generated artifact contentHash |
| `options.typescript` | boolean | No (default `true`) | Emit TypeScript types (React/Vue). Ignored for HTML. |
| `options.styling` | `"inline"` \| `"tokens"` \| `"tailwind"` | No (default `"tokens"`) | Styling strategy: inline style objects, design-token CSS variables, or Tailwind utility classes |

Output fields:
| Field | Type | Description |
|-------|------|-------------|
| `status` | `"ok"` \| `"error"` | Generation result |
| `framework` | string | The framework used |
| `artifact` | object | Primary success payload: schemaVersion, deterministically ordered files with hashes, exact dependencies with kinds, required domain actions with raising sources, and artifact contentHash |
| `code` | string | Deprecated v0 alias for `artifact.files[0].contents`; retained through artifact schema v1 |
| `fileExtension` | string | Deprecated v0 alias for the primary file extension; retained through artifact schema v1 |
| `imports` | string[] | Deprecated v0 package-specifier alias; retained through artifact schema v1 |
| `warnings` | codegenIssue[] | Non-fatal issues |
| `validationReceipt` | object | Always-present applied profile, independent scope/enforcement/fallback/target axes, attempted checks, not-checked checks, and evidence disposition; after artifact construction it also names that artifact's content hash |
| `errors` | codegenIssue[] | Fatal issues (code will be empty) |
| `meta` | object | nodeCount, componentCount, unknownComponents |

`artifact` is required on successful responses and absent on errors. Its content hash covers the
files, dependencies, and action contract. Dependency entries use exact semantic versions—never
workspace aliases, ranges, repository paths, or inferred package names.
`pipeline.code.artifact` carries the same envelope without flattening it; `pipeline.code.output`
remains the deprecated v0 source alias for compatibility.
The binding classification and framework-specific injection rules are defined in
[Typed action protocol](./Typed-Action-Protocol.md).

Validation profiles are deliberately not one overloaded strictness flag:

| Profile | Scope | Enforcement | Fallback policy | Additional claim |
|---------|-------|-------------|-----------------|------------------|
| `draft` | structural | advisory for known target/contract gaps | visible | Exploratory output; warnings keep unsupported targets, fallbacks, or lossy normalization visible. Invalid input and unsafe or unemittable code still block. |
| `build` (default) | generated artifact | blocking | forbidden | Runnable target, canonical props/slots/events, exact dependency closure, and no HTML fallback markers. |
| `release` | release evidence | blocking | forbidden | All build checks plus six passed, hash-bound evidence classes: rendered, interaction, accessibility, theme, determinism, and performance. |

For current generated UI targets there is no applicable artifact-certification adapter, so the
server records `certification` in `validationReceipt.evidence.notApplicable` with a stable
rationale; callers cannot self-declare that exception. `checks` contains only checks actually
attempted before return, while `notChecked` names every profile check not reached on both success
and error responses. `normalization-fidelity` reports whether compatibility normalization can retain
the input tree; findings are visible warnings in draft and block build/release before lossy output can
claim runnable confidence. After artifact construction,
`validationReceipt.evidence.artifactContentHash` names that exact artifact; successful responses
also expose the same value as `artifact.contentHash`. Release receipts retain each caller-supplied
evidence envelope in canonical class order under `evidence.accepted` (class, status, artifact hash,
and reference). Release receipts carry `evidenceVerification: "hash-bound-not-re-executed"`: references are format-checked and hash-bound, not re-executed or resolved. OODS-V162/V163 repeat this limit. Pipeline
forwards `profile` and `releaseEvidence` unchanged, retains the code-generation receipt, and
adds target-resolution provenance (`explicit`, `options-alias`, `.oodsrc`, or default).

---

[Complete input/output reference](../api/code-generate.md).

### `design.compose`

`{ "object": "Subscription", "context": "workflow" }` composes the existing list,
detail, form and timeline screens with routes `/`, `/:id`, `/:id/edit` and
`/:id/timeline`. Each screen has loading, empty, error and success branches.
The `workflow` block records object identity, screen declarations, transitions,
canonical states and trait-derived data parameters. Cancellable supplies Cancel
on detail/form; Timestampable supplies View timeline on detail in every context
composition. The assembler reuses those bindings.

Pass the schema or schemaRef to `code.generate` with `framework: "react"` or
`"vue"`, `profile: "build"` and `options.typescript: true` (the default). The
returned `artifact.files` contains App, four screen components, a shared typed
action contract, an in-memory store, deterministic sample data, entry point,
styles, tsconfig and package manifest. Preserve every file at its declared path;
install the exact declared dependencies and run `npm run dev` or `npm run build`.
OODS packages must be available from your configured registry or reviewed local
tarballs. Workflow JavaScript-only output is rejected explicitly.

The generated app owns local navigation and action implementations. It supports
search, status filtering, sorting, pagination, editing, cancellation with history,
and reversible archive. It starts with ten deterministic records; `?mode=empty`
and `?mode=error` exercise data states, and `?latency=400` controls simulated
latency. Error screens provide retry. Data lasts for the application session;
URL routing and persistent storage are follow-on work. The generated `src/ssr.tsx`
(React) or `src/ssr.ts` (Vue) exports `renderApp(options)`; the generated main
entry hydrates existing root markup and mounts an empty root. The workflow data
contract carries declared timestamp events and cancellation reason policy so
sample records and native Save follow the object traits. The six existing contexts
continue returning their single-screen artifact contract.

- **Input schema**: `packages/mcp-server/src/schemas/design.compose.input.json`
- **Output schema**: `packages/mcp-server/src/schemas/design.compose.output.json`
- **Policy**: designer, maintainer | read-only | timeout 30s | rate 60/min | concurrency 4
- **Purpose**: Generate a complete UiSchema from a natural-language intent description using layout templates and a deterministic component selection engine.

Example input:
```json
{
  "intent": "dashboard with metrics and sidebar navigation",
  "layout": "auto",
  "options": { "validate": true, "topN": 3 }
}
```

Example output:
```json
{
  "status": "ok",
  "layout": "dashboard",
  "schema": { "version": "2026.02", "screens": ["..."] },
  "schemaRef": "compose-abc123",
  "schemaRefCreatedAt": "2026-03-04T02:00:00Z",
  "schemaRefExpiresAt": "2026-03-04T02:30:00Z",
  "selections": [
    {
      "slotName": "metrics",
      "intent": "metrics display",
      "selectedComponent": "MetricCard",
      "confidence": 0.92,
      "confidenceLevel": "high",
      "explanation": "MetricCard was selected for slot \"metrics\" because Direct intent match for metrics. Confidence is high (0.92).",
      "candidates": [
        { "name": "MetricCard", "confidence": 0.92, "reason": "Direct intent match for metrics" },
        { "name": "StatSummary", "confidence": 0.78, "reason": "Summary statistics display" }
      ]
    }
  ],
  "validation": { "status": "ok", "errors": [], "warnings": [] },
  "warnings": [],
  "meta": {
    "intentParsed": "dashboard with metrics and sidebar navigation",
    "layoutDetected": "dashboard",
    "slotCount": 4,
    "nodeCount": 8,
    "intelligence": {
      "compositionConfidence": 0.84,
      "lowConfidenceSlotNames": ["sidebar"]
    }
  }
}
```

Input fields:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `intent` | string | Yes | Natural-language description of the desired UI |
| `layout` | `"dashboard"` \| `"form"` \| `"detail"` \| `"list"` \| `"auto"` | No (default `"auto"`) | Layout template. `auto` infers from intent keywords. |
| `preferences.theme` | string | No | Theme token |
| `preferences.metricColumns` | integer 1-12 | No | Dashboard metric columns |
| `preferences.fieldGroups` | integer 1-20 | No | Form field groups |
| `preferences.tabCount` | integer 1-10 | No | Detail tab count |
| `preferences.tabLabels` | string[] | No | Custom tab labels |
| `preferences.componentOverrides` | object | No | Slot-name to component-name overrides |
| `options.validate` | boolean | No (default `true`) | Auto-validate via `repl.validate` |
| `options.topN` | integer 1-10 | No (default `3`) | Component candidates per slot |

Output fields:
| Field | Type | Description |
|-------|------|-------------|
| `status` | `"ok"` \| `"error"` | Composition result |
| `layout` | string | Layout template used |
| `schema` | UiSchema | Generated schema |
| `schemaRef` | string | Cached schema reference for reuse in validate/render/code.generate |
| `schemaRefCreatedAt` | string | ISO timestamp when schemaRef was created |
| `schemaRefExpiresAt` | string | ISO timestamp when schemaRef expires |
| `selections` | slotSelection[] | Component selection results per slot |
| `validation` | object | Auto-validation result (`ok` / `invalid` / `skipped`) |
| `warnings` | issue[] | Non-fatal issues |
| `meta` | object | intentParsed, layoutDetected, slotCount, nodeCount |

Selection explainability:
- `selections[].confidenceLevel` gives a quick `high` / `medium` / `low` review band.
- `selections[].explanation` summarizes the winning rationale in plain language.
- `selections[].reviewHint` appears on low-confidence selections and points to `preferences.componentOverrides` as the escape hatch.

Override guidance:
- Use `preferences.componentOverrides` when you want to pin a specific slot after a low-confidence selection; overrides are slot-scoped and leave default ranking intact for every other slot.
- Copyable example: `{ "object": "Subscription", "context": "detail", "preferences": { "componentOverrides": { "tab-0": "Card" } } }`

---

[Complete input/output reference](../api/design-compose.md).

### `design.preview`

Capture an object/context (including workflow) using the running local design loop. Optional framework is react, vue or both; widths default to 390/820/1440. Preferences are the public compose preferences. The tool invokes the same render command and returns validated receipts with screenshot paths, accessibility text, layout measurements, browser errors and schema/artifact hashes. It writes isolated receipt files and never saves a schema.

Start the loop in this checkout with `pnpm design:loop serve`. An unavailable or starting server returns retryable `OODS-N019` before creating partial output. See [the generated API contract](../api/design-preview.md) and [the runnable instructions](../../scripts/design-loop/README.md).

[Complete input/output reference](../api/design-preview.md).

### `pipeline`

Portable React/Vue generation fails at codegen with OODS-N015 because readiness source/test/declaration references are not shipped; no artifact is claimed.

Runs compose, validate, render and code generation, optionally saving by name. Fresh schema references are forwarded unchanged. Framework/profile/options follow the explicit/default precedence above. Release receipts say `evidenceVerification: "hash-bound-not-re-executed"`; supplied proof references are not independently executed.

[Complete input/output reference](../api/pipeline.md).

### `health`

Reports live readiness, component/trait/object counts, saved schemas, and validated runtime/tool-ledger summaries. `productReality.viz` reports the generated taxonomy's type, pattern, family, classification and Core Analytics Profile counts; surface-complete cells require public pixels from an identity assigned to that cell, while gaps have explicit reasons. Missing or invalid taxonomy returns null and degrades health. `tokens` lists built scopes and a labelled configured `defaultScope`; it does not observe a consumer. Missing subsystems degrade health explicitly.

[Complete input/output reference](../api/health.md).

### `registry.snapshot`

- **Input schema**: `packages/mcp-server/src/schemas/registry.snapshot.input.json`
- **Output schema**: `packages/mcp-server/src/schemas/registry.snapshot.output.json`
- **Status**: Contract + implementation landed in Sprint 90 (`s90-m03`). Registration across every surface happens in `s90-m05`.
- **Purpose**: Return the full OODS registry state in one call for reconciliation consumers that would otherwise need `map.list` plus N× `map.resolve`.

Example input:
```json
{}
```

Example output:
```json
{
  "maps": [
    {
      "id": "material-button",
      "externalSystem": "material",
      "externalComponent": "Button",
      "oodsTraits": ["Stateful", "Labelled"],
      "confidence": "manual"
    }
  ],
  "traits": {
    "Addressable": {
      "name": "Addressable",
      "version": "1.0.0",
      "description": "Canonical multi-role address trait.",
      "category": "core",
      "tags": ["address"],
      "contexts": ["detail", "form"],
      "objects": ["Organization", "User"],
      "source": "traits/core/Addressable.trait.yaml"
    }
  },
  "objects": {
    "User": {
      "name": "User",
      "version": "1.0.0",
      "domain": "core.identity",
      "description": "Canonical user object.",
      "tags": ["identity"],
      "traits": [
        { "reference": "core/Identifiable", "alias": "UserIdentity", "parameters": {} }
      ],
      "fields": ["user_id", "email"],
      "source": "objects/core/User.object.yaml"
    }
  },
  "etag": "6d6224a2293e24fcefff2060dc60d8b3cf516af14f8d8f7344e3d5d726b7d0d6",
  "generatedAt": "2026-04-16T00:00:00.000Z"
}
```

Notes:
- `maps` come from `artifacts/structured-data/component-mappings.json`.
- `traits` and `objects` are keyed by name and sourced from the published structured-data components artifact (`artifacts/structured-data/oods-components-*.json` via the same resolution path used by `structuredData.fetch`).
- `generatedAt` is the latest source timestamp across the mappings doc and components artifact, so it stays stable until one of the underlying sources changes.
- `etag` is a stable SHA256 hash over the assembled snapshot payload (with `generatedAt` excluded from the hash calculation by the shared structured-data etag logic).

Output fields:
| Field | Type | Description |
|-------|------|-------------|
| `maps` | array | Full component mapping registry |
| `traits` | object | Trait catalog keyed by trait name |
| `objects` | object | Object catalog keyed by object name |
| `etag` | string | Stable hash of the assembled snapshot payload |
| `generatedAt` | string | Latest underlying source timestamp contributing to the snapshot |

---

[Complete input/output reference](../api/registry-snapshot.md).

### `viz.render`

- **Input schema**: `packages/mcp-server/src/schemas/viz.render.input.json`
- **Output schema**: `packages/mcp-server/src/schemas/viz.render.output.json`
- **Policy**: designer, maintainer | read-only (no writes) | timeout 30s | rate 60/min | concurrency 4
- **Purpose**: Turn inline data `rows` (or a cached `datasetRef`) into a real, renderable Vega-Lite spec via the headless `@oods/viz-core` engine. Supply `chartType` + `encodings` for explicit mode, or omit `chartType` to let the recommender pick one from inferred field profiles (suggest mode). Set `output.echarts: true` to also return an ECharts option. Supports 13 chart types: 5 tabular (`bar`, `line`, `area`, `scatter`, `heatmap`) in both suggest and explicit mode, plus 8 explicit-only (`treemap`, `sunburst`, `sankey`, `force_graph`, `chord`, `choropleth`, `bubble_map`, `flow_map`).
- **Compact note**: Mirrors `repl.render`/`pipeline` — `output.compact` defaults to `true`, which omits the full token CSS and returns a `tokenCssRef` (fetch the CSS via `tokens.build`); set `output.compact: false` to inline it.

Example input (explicit mode):
```json
{
  "rows": [
    { "region": "North", "quarter": "2024-01", "revenue": 120000 },
    { "region": "South", "quarter": "2024-01", "revenue": 135000 }
  ],
  "chartType": "bar",
  "encodings": { "x": "region", "y": { "field": "revenue", "aggregate": "sum" } }
}
```

Example input (suggest mode — omit `chartType`, the recommender chooses):
```json
{
  "rows": [
    { "quarter": "2024-01", "revenue": 120000 },
    { "quarter": "2024-02", "revenue": 128000 }
  ]
}
```

Example input (ECharts opt-in + inline token CSS):
```json
{
  "rows": [{ "x": "A", "y": 1 }, { "x": "B", "y": 3 }],
  "chartType": "line",
  "encodings": { "x": "x", "y": "y" },
  "output": { "echarts": true, "compact": false }
}
```

Example input (cached `datasetRef` instead of inline rows):
```json
{
  "datasetRef": "viz-render-dataset-abc123",
  "chartType": "scatter",
  "encodings": { "x": "revenue", "y": "units" }
}
```

Example output (compact, explicit mode — abbreviated):
```json
{
  "status": "ok",
  "mode": "explicit",
  "chartType": "bar",
  "spec": {
    "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
    "data": { "values": [{ "region": "North", "quarter": "2024-01", "revenue": 120000 }] },
    "mark": { "type": "bar" },
    "encoding": {
      "x": { "field": "region", "type": "ordinal" },
      "y": { "field": "revenue", "type": "quantitative", "aggregate": "sum" }
    }
  },
  "a11yDescription": "Bar chart of sum of revenue by region.",
  "tokenCssRef": "tokens.build",
  "specRef": "viz-render-9f1c…",
  "warnings": [],
  "output": { "compact": true },
  "meta": { "renderer": "vega-lite", "mark": "MarkBar", "rowCount": 2, "fields": ["region", "quarter", "revenue"] }
}
```

Notes:
- **Data path**: provide exactly one of `rows` (primary; inline, a few hundred rows is the sweet spot) or `datasetRef` (a previously cached dataset on the schemaRef-style TTL cache). In Phase 0 there is no `datasetRef` producer beyond the value cache, so inline `rows` is the main path.
- **Explicit vs suggest**: when `chartType` is set, `encodings` with at least `x` and `y` is required. Omit `chartType` to enter suggest mode, where field profiles are inferred and the recommender returns a `suggestion` (`{ patternId, score }`) alongside `inferredFields` in `meta`.
- **Output controls**: `output.compact` (default `true`) returns `tokenCssRef` instead of inlining token CSS; `output.echarts` (default `false`) also returns `echartsSpec`; `output.includeNormalizedSpec` (default `false`) also returns the intermediate `NormalizedVizSpec` IR.
- **Renderability**: the `spec` is a compiled Vega-Lite spec that passes `vl.compile` + `vega.parse` (locked by the render-fidelity goldens), with the input rows bound into `data.values` — a consumer (e.g. Workbench) renders it; the server does not SSR.
- `specRef`/`specRefCreatedAt`/`specRefExpiresAt`: a TTL reference trio for pipeline reuse.
- Full parameter/output tables: [viz.render](../api/viz-render.md).

---

[Complete input/output reference](../api/viz-render.md).

### `dashboard.render`

Renders shared datasets into KPI/chart panels and deterministic self-contained HTML. Governed measure refs resolve by default; unknown refs yield OODS-V130 and missing fields OODS-V137. Explicit `resolveMeasures:false` disables resolution. Failed panels remain visible. Public panel schemas admit eleven chart types; chord/flow_map remain excluded (#881).

[Complete input/output reference](../api/dashboard-render.md).

### `artifact.certify`

Grades the normalized IR returned by `viz.render`, with the same data operand for ECharts-primary families. Returns per-check accessibility, determinism, contrast and accuracy evidence; five Cartesian families can be certified and eight advanced families remain explicitly uncertified. HTML is rejected with OODS-V126. Scope is A/B and light/dark; HC chart pixels are unsupported.

[Complete input/output reference](../api/artifact-certify.md).

### `fidelity.preview`

Renders an inline Object Catalog manifest or a named host fixture at boxes-and-arrows, wireframe, review or branded-mockup fidelity. Branded mockups use built A/B light tokens. Deprecated brand-a/brand-b aliases warn for one release. Portable bundles require inline manifests because named fixtures are omitted. This is a preview, not production UI or independent review approval.

[Complete input/output reference](../api/fidelity-preview.md).

### `map`

Grouped actions: apply, create, list, resolve, update, delete. Every request carries `action`. Records and resolves external mappings; no composer or generator consumes them. Draft preferred terms and disambiguation decisions are surfaced, not consumed.

#### `map.create`

- **Input schema**: `packages/mcp-server/src/schemas/map.create.input.json`
- **Output schema**: `packages/mcp-server/src/schemas/map.create.output.json`
- **Policy**: designer, maintainer | writes `artifacts/structured-data/component-mappings.json` | timeout 30s | rate 30/min | concurrency 1
- **Purpose**: Create a component-to-trait mapping for an external design system component.

Example input:
```json
{
  "externalSystem": "material",
  "externalComponent": "Button",
  "oodsTraits": ["Stateful", "Labelled"],
  "propMappings": [
    { "externalProp": "variant", "oodsProp": "appearance", "coercion": { "type": "enum", "mapping": { "contained": "primary", "outlined": "secondary", "text": "ghost" } } },
    { "externalProp": "disabled", "oodsProp": "disabled", "coercion": { "type": "identity" } }
  ],
  "confidence": "manual",
  "metadata": { "author": "design-team", "notes": "Verified against Material UI v5 API" },
  "apply": true
}
```

Example output:
```json
{
  "status": "ok",
  "mapping": {
    "id": "material-button",
    "externalSystem": "material",
    "externalComponent": "Button",
    "oodsTraits": ["Stateful", "Labelled"],
    "propMappings": ["..."],
    "confidence": "manual",
    "metadata": {
      "createdAt": "2026-02-28T00:00:00Z"
    }
  },
  "etag": "a1b2c3...",
  "applied": true,
  "warnings": []
}
```

Notes:
- When `apply` is `false` (or omitted), the mapping is not persisted and `applied` is `false`. The response includes a dry-run warning.
- When `status` is `"error"`, an `errors` object is returned with `message` + `details` (field-level entries matching `formatValidationErrors()`).
- `oodsTraits` should use canonical structured-data trait names such as `Stateful`, `Labelled`, or `Priceable`. Discover valid values via `structuredData.fetch` or `catalog.list`.

Input fields:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `externalSystem` | string | Yes | External design system name |
| `externalComponent` | string | Yes | Component name in the external system |
| `oodsTraits` | string[] | Yes | OODS traits this component maps to |
| `propMappings` | array | No | Property translations with optional coercion |
| `propMappings[].coercion.type` | `"enum"` \| `"boolean_to_string"` \| `"template"` \| `"identity"` | No | Coercion strategy |
| `confidence` | `"auto"` \| `"manual"` | No (default `"manual"`) | Mapping provenance |
| `metadata` | object | No | Optional metadata object |
| `metadata.author` | string | No | Author of the mapping |
| `metadata.notes` | string | No | Free-text notes about the mapping |
| `apply` | boolean | No | Write to disk when true |

---

#### `map.apply`

- **Input schema**: `packages/mcp-server/src/schemas/map.apply.input.json`
- **Output schema**: `packages/mcp-server/src/schemas/map.apply.output.json`
- **Status**: Contract frozen in Sprint 90 (`s90-m01`). Implementation lands in `s90-m02`.
- **Purpose**: Consume a Stage1 `reconciliation_report.json` and route each verdict into `create`, `patch`, `skip`, `conflict`, or `queued` (below-confidence review) buckets before any registry mutation.

Example input (inline report):
```json
{
  "minConfidence": 0.75,
  "report": {
    "kind": "reconciliation_report",
    "schema_version": "1.1.0",
    "generated_at": "2026-04-16T15:06:35.268Z",
    "target": { "id": "stage1-linear-smoke", "url": "https://linear.app/" },
    "candidate_objects": [
      {
        "object_id": "obj-issue-row",
        "name": "Issue Row",
        "role": "row",
        "confidence": 0.88,
        "recommended_oods_traits": ["Listable", "Sortable"],
        "action": "patch",
        "reasoning": "Existing row mapping is close but missing sorting capability.",
        "verdict_reasoning": "Existing map lacks Sortable and needs notes updated for the current evidence set.",
        "existing_map_id": "linear-issue-row",
        "diff": {
          "added_traits": ["Sortable"],
          "removed_traits": [],
          "changed_fields": [
            { "field": "oodsTraits", "from": ["Listable"], "to": ["Listable", "Sortable"] }
          ]
        }
      }
    ],
    "manifest": {
      "inputs": {
        "oods_registry_fetch": {
          "source": "transport",
          "entries_count": 42,
          "warnings": []
        }
      }
    },
    "reconciliation_summary": {
      "mode": "reconciliation",
      "existing_map_count": 42,
      "verdict_counts": { "create": 2, "patch": 1, "skip": 1, "conflict": 1 }
    }
  }
}
```

Example input (`reportPath` variant):
```json
{
  "apply": true,
  "minConfidence": 0.75,
  "reportPath": "packages/mcp-server/test/fixtures/reconciliation-report-v1.1.0.json"
}
```

Example output:
```json
{
  "applied": [
    {
      "objectId": "obj-command-menu",
      "name": "Command Menu Trigger",
      "action": "create",
      "confidence": 0.94,
      "recommendedOodsTraits": ["Stateful", "Labelled"],
      "mappingId": "linear-command-menu-trigger",
      "reason": "No matching external component in the OODS registry snapshot.",
      "persisted": false
    }
  ],
  "skipped": [
    {
      "objectId": "obj-billing-plan-card",
      "name": "Billing Plan Card",
      "action": "skip",
      "confidence": 0.97,
      "recommendedOodsTraits": ["Priceable", "Stateful"],
      "existingMapId": "linear-billing-plan-card",
      "mappingId": "linear-billing-plan-card",
      "reason": "Existing mapping already matches name, system, and trait set.",
      "persisted": false
    }
  ],
  "queued": [
    {
      "objectId": "obj-experimental-badge",
      "name": "Experimental Badge",
      "action": "create",
      "confidence": 0.61,
      "threshold": 0.75,
      "queueReason": "below_confidence",
      "recommendedOodsTraits": ["Labelled", "Stateful"],
      "reason": "Candidate remains actionable but should queue for review at the default minConfidence."
    }
  ],
  "conflicted": [
    {
      "objectId": "obj-workspace-switcher",
      "name": "Workspace Switcher",
      "action": "conflict",
      "confidence": 0.82,
      "existingMapId": "linear-workspace-switcher",
      "reason": "Existing mapping classifies this control as Stateful rather than Navigable."
    }
  ],
  "errors": [],
  "diff": {
    "create": 1,
    "patch": 1,
    "skip": 1,
    "conflict": 1,
    "queued": 1,
    "changedFields": ["oodsTraits", "metadata.notes"],
    "addedTraits": ["Sortable"],
    "removedTraits": []
  },
  "conflictArtifactPath": ".oods/conflicts/2026-04-16T15-06-35.268Z-stage1-linear-smoke.json",
  "etag": "6d6224a2293e24fcefff2060dc60d8b3cf516af14f8d8f7344e3d5d726b7d0d6"
}
```

Notes:
- Accepts exactly one of `report` or `reportPath`.
- `apply` defaults to `false`; dry-run is the default contract for this mutation tool.
- `minConfidence` defaults to `0.75`. Candidates below the threshold route to `queued` instead of mutating the registry.
- Stage1’s shipped v1.1.0 contract uses `candidate_objects[].action` (not `verdict`). Valid values: `create`, `patch`, `skip`, `conflict`.
- Patch diffs are frozen to the real Stage1 field names: `diff.added_traits`, `diff.removed_traits`, `diff.changed_fields`.
- `manifest.inputs.oods_registry_fetch.source` is preserved so agents can detect `empty-fallback` reconciliation runs before trusting the results.
- `alternate_interpretations[]` and `alternate_verbs[]` accept both the new typed object form and the legacy `string[]` form for backward compatibility.

Input fields:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `apply` | boolean | No (default `false`) | Persist registry mutations when `true`; otherwise return a dry-run plan |
| `minConfidence` | number | No (default `0.75`) | Queue sub-threshold candidates instead of applying them |
| `report` | object | Yes, unless `reportPath` is provided | Inline Stage1 reconciliation report payload |
| `reportPath` | string | Yes, unless `report` is provided | Filesystem path to a reconciliation report artifact |

Output fields:
| Field | Type | Description |
|-------|------|-------------|
| `applied` | array | `create` / `patch` candidates selected for application; each row carries `persisted` to distinguish dry-run vs. apply |
| `skipped` | array | Candidates whose Stage1 action is `skip` |
| `queued` | array | Candidates held for review because `confidence < minConfidence` |
| `conflicted` | array | Candidates with `action: "conflict"` that must not auto-apply |
| `errors` | array | Per-candidate application failures without throwing away the whole report |
| `diff` | object | Aggregate counts plus flattened `changedFields`, `addedTraits`, and `removedTraits` for agent inspection |
| `conflictArtifactPath` | string | Planned or written conflict-artifact path when conflicts or below-confidence items exist |
| `etag` | string | Registry etag after routing; lets agents detect drift between dry-run and apply |

---

#### `map.list`

- **Input schema**: `packages/mcp-server/src/schemas/map.list.input.json`
- **Output schema**: `packages/mcp-server/src/schemas/map.list.output.json`
- **Policy**: designer, maintainer | read-only | timeout 30s | rate 60/min | concurrency 4
- **Purpose**: List component-to-trait mappings, optionally filtered by external system.

Example input:
```json
{ "externalSystem": "material" }
```

Paginated example:
```json
{ "externalSystem": "material", "limit": 100, "cursor": "material-button" }
```

Example output:
```json
{
  "mappings": [
    { "id": "material-button", "externalSystem": "material", "externalComponent": "Button", "oodsTraits": ["Stateful", "Labelled"], "..." : "..." }
  ],
  "totalCount": 3,
  "stats": { "mappingCount": 3, "systemCount": 1 },
  "etag": "a1b2c3...",
  "nextCursor": "material-card"
}
```

Notes:
- Omitting both `cursor` and `limit` preserves the legacy full-list behavior.
- Pagination is id-sorted and cursor-based. `nextCursor` is the last mapping id returned on the current page.
- When pagination is requested (`cursor` or `limit` present), the default page size is `100` and the max page size is `500`.

---

#### `map.resolve`

- **Input schema**: `packages/mcp-server/src/schemas/map.resolve.input.json`
- **Output schema**: `packages/mcp-server/src/schemas/map.resolve.output.json`
- **Policy**: designer, maintainer | read-only | timeout 30s | rate 60/min | concurrency 4
- **Purpose**: Resolve an external component to its OODS trait mapping with flattened prop translations.

Example input:
```json
{ "externalSystem": "material", "externalComponent": "Button" }
```

Example output (found):
```json
{
  "status": "ok",
  "mapping": { "id": "material-button", "..." : "..." },
  "propTranslations": [
    { "externalProp": "variant", "oodsProp": "appearance", "coercionType": "enum", "coercionDetail": { "type": "enum", "mapping": { "contained": "primary", "outlined": "secondary" } } },
    { "externalProp": "disabled", "oodsProp": "disabled", "coercionType": "identity", "coercionDetail": { "type": "identity" } }
  ]
}
```

Example output (not found):
```json
{
  "status": "not_found",
  "message": "No mapping found for material/TextField"
}
```

Notes:
- Successful lookups return `status: "ok"` with `mapping` + `propTranslations`; only misses return `status: "not_found"`.
- `coercionType` values mirror the runtime coercion model: `enum`, `boolean_to_string`, `template`, or `identity`.

---

#### `map.delete`

- **Input schema**: `packages/mcp-server/src/schemas/map.delete.input.json`
- **Output schema**: `packages/mcp-server/src/schemas/map.delete.output.json`
- **Policy**: designer, maintainer | writes `artifacts/structured-data/component-mappings.json` | timeout 30s | rate 30/min | concurrency 1
- **Purpose**: Delete a component-to-trait mapping by id.

Example input:
```json
{ "id": "material-button" }
```

Example output (deleted):
```json
{
  "status": "ok",
  "deleted": {
    "id": "material-button",
    "externalSystem": "material",
    "externalComponent": "Button"
  },
  "etag": "a1b2c3..."
}
```

Example output (not found):
```json
{
  "status": "error",
  "message": "No mapping found with id 'material-button'. Use map.list to see available mappings."
}
```

---

#### `map.update`

`{ "action": "update", "id": "mapping-id", "updates": { "notes": "Updated context" } }` updates an existing external mapping. Trait names remain canonical.

[Complete input/output reference](../api/map.md).

### `schema`

Grouped actions: `save`, `load`, `list`, `delete`. Save a live `schemaRef` by name with author/tags; load returns a fresh reference. Re-saving increments a monotonic version and preserves createdAt. List filters object/context/tags. Delete removes the named record. These actions use versions/reference identity, not ETags or conditional requests. `apply` is accepted for bridge parity and ignored by each action: save/delete persist on invocation.

[Complete input/output reference](../api/schema.md).

### `object`

Grouped actions: `list`, `show`. List the eleven real object definitions, optionally filtering domain or trait. Show composes schema/traits and view extensions, with an optional context filter. Unknown names return OODS-N005. This is registry inspection; it does not save or mutate an object.

[Complete input/output reference](../api/object.md).

### `repl`

Grouped actions: render and validate. Every request carries `action`; per-action examples below show the remaining body. Validate `apply` is ignored bridge parity.

#### `repl.validate`

- **Input schema**: `packages/mcp-server/src/schemas/repl.validate.input.json`
- **Output schema**: `packages/mcp-server/src/schemas/repl.validate.output.json`
- **Policy**: designer, maintainer | read-only | timeout 30s | rate 60/min | concurrency 4
- **Purpose**: Validate UiSchema trees structurally and optionally check WCAG accessibility.

Example input (mode=`full`):
```json
{
  "mode": "full",
  "schema": {
    "version": "2026.02",
    "dsVersion": "2026-02-24",
    "theme": "dark",
    "screens": [
      {
        "id": "screen_home",
        "component": "Stack",
        "children": [{ "id": "title", "component": "Text", "props": { "content": "Hello" } }]
      }
    ]
  }
}
```

Example input (schemaRef shorthand):
```json
{
  "mode": "full",
  "schemaRef": "compose-abc123"
}
```

Example input (mode=`patch`, node patch):
```json
{
  "mode": "patch",
  "baseTree": { "version": "2026.02", "screens": [ { "id": "screen_home", "component": "Stack", "children": [] } ] },
  "patch": { "nodeId": "screen_home", "path": "component", "value": "Card" }
}
```

Example input (mode=`patch`, JSON Patch array):
```json
{
  "mode": "patch",
  "baseTree": { "version": "2026.02", "screens": [ { "id": "screen_home", "component": "Stack", "children": [] } ] },
  "patch": [
    { "op": "replace", "path": "/screens/0/component", "value": "Card" }
  ]
}
```

With accessibility checks:
```json
{
  "mode": "full",
  "checkA11y": true,
  "schema": { "..." : "..." }
}
```

Example output:
```json
{
  "status": "ok",
  "mode": "full",
  "dslVersion": "2026.02",
  "registryVersion": "2026-02-24",
  "errors": [],
  "warnings": [],
  "meta": { "screenCount": 1, "nodeCount": 2 }
}
```

Notes:
- `checkA11y: true` runs 18 WCAG contrast rules after structural validation passes. Failures appear as `A11Y_CONTRAST` warnings with contrast ratio, WCAG level, and fix hints.
- `schemaRef` can be passed instead of `schema` when using a cached schema from `design.compose`.
- In `patch` mode, `baseTree` is required. Patch payloads accept JSON Patch arrays or node patch objects/arrays. Malformed patch requests return path-level errors with a valid patch example in `hint`.

---

#### `repl.render`

- **Input schema**: `packages/mcp-server/src/schemas/repl.render.input.json`
- **Output schema**: `packages/mcp-server/src/schemas/repl.render.output.json`
- **Policy**: designer, maintainer | writes `${BASE}/${DATE}/**` | timeout 30s | rate 60/min | concurrency 4
- **Purpose**: Render UiSchema trees to HTML. Supports document mode (self-contained page) and fragment mode (per-component HTML + CSS map).
- **Preview note**: HTML/fragments payloads are returned only when `apply: true`; otherwise responses are metadata-only previews.

Example input (mode=`patch`, node-targeted patch):
```json
{
  "mode": "patch",
  "baseTree": {
    "version": "2026.02",
    "screens": [{ "id": "screen_home", "component": "Stack", "children": [{ "id": "title", "component": "Text" }] }]
  },
  "patch": [{ "nodeId": "title", "path": "component", "value": "ArchiveEvent" }]
}
```

Example input (schemaRef shorthand):
```json
{
  "mode": "full",
  "schemaRef": "compose-abc123",
  "apply": true
}
```

Fragment mode:
```json
{
  "mode": "full",
  "apply": true,
  "output": { "format": "fragments" },
  "schema": { "...": "..." }
}
```

Example output:
```json
{
  "status": "ok",
  "mode": "patch",
  "dslVersion": "2026.02",
  "registryVersion": "2026-02-24",
  "errors": [],
  "warnings": [],
  "appliedPatch": true,
  "preview": {
    "screens": ["screen_home"],
    "routes": [],
    "activeScreen": "screen_home",
    "summary": "Render ready for 1 screen"
  }
}
```

Notes:
- Document mode wraps output in a self-contained HTML page with inlined token CSS.
- HTML and fragment payloads are returned only when `apply: true`; otherwise responses are metadata-only previews.
- Fragment mode returns per-component HTML fragments with `cssRefs` for CSS extraction (requires `apply: true`).
- Unknown components in non-strict fragment mode produce per-node errors without blocking sibling rendering; OODS-W002 explicitly reports this V006 reclassification.
- Fragment mode reports ignored `brand`, `output.tokenOverlay`, and `output.skinOverlay` options together in OODS-W001. Use document mode to apply them.
- Request `dslVersion` and `output.depth` were removed because they were not consumed. UiSchema `version` and response version metadata remain; validate `apply` remains an explicitly ignored bridge-parity key.
- `schemaRef` can be passed instead of `schema` when using a cached schema from `design.compose`.
- Patch mode requires both `baseTree` and `patch`.

---

[Complete input/output reference](../api/repl.md).

## On-demand tool contracts (5 registry entries)

The 5 on-demand entries come from `packages/mcp-server/src/tools/registry.json`.

### `diag.snapshot`

- **Input schema**: `packages/mcp-server/src/schemas/generic.input.json`
- **Output schema**: `packages/mcp-server/src/schemas/generic.output.json`
- **Policy**: designer, maintainer | writes `${BASE}/${DATE}/**` | timeout 120s | rate 12/min | concurrency 1
- **Purpose**: Emit a diagnostics JSON artifact bundle for the current repo state.

Example input:
```json
{ "apply": true }
```

---

[Complete input/output reference](../api/diag-snapshot.md).

### `billing.reviewKit`

- **Input schema**: `packages/mcp-server/src/schemas/billing.reviewKit.input.json`
- **Output schema**: `packages/mcp-server/src/schemas/generic.output.json`
- **Policy**: designer, maintainer | writes `${BASE}/${DATE}/**` | timeout 120s | rate 20/min | concurrency 1
- **Purpose**: Compare billing provider fixtures and produce a review kit with diffs and specimens.

Example input:
```json
{ "object": "Subscription", "fixtures": ["stripe", "chargebee"], "apply": true }
```

Input fields:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `object` | `"Subscription"` \| `"Invoice"` \| `"Plan"` \| `"Usage"` | Yes | Billing object to compare |
| `fixtures` | string[] | No (default `["stripe", "chargebee"]`) | Provider fixtures to include |
| `apply` | boolean | No (default `false`) | Write artifacts to disk |

---

[Complete input/output reference](../api/billing-reviewKit.md).

### `billing.switchFixtures`

- **Input schema**: `packages/mcp-server/src/schemas/billing.switchFixtures.input.json`
- **Output schema**: `packages/mcp-server/src/schemas/generic.output.json`
- **Policy**: designer, maintainer | writes `${BASE}/${DATE}/**` | timeout 90s | rate 20/min | concurrency 1
- **Purpose**: Switch billing provider fixtures and record diffs for Storybook scenarios.

Example input:
```json
{ "provider": "chargebee", "apply": true }
```

Input fields:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `provider` | `"stripe"` \| `"chargebee"` | Yes | Target billing provider |
| `apply` | boolean | No (default `false`) | Record switch artifacts |

---

[Complete input/output reference](../api/billing-switchFixtures.md).

### `a11y.scan`

- **Input schema**: `packages/mcp-server/src/schemas/a11y.scan.input.json`
- **Output schema**: `packages/mcp-server/src/schemas/generic.output.json`
- **Policy**: designer, maintainer | writes `${BASE}/${DATE}/**` | timeout 120s | rate 12/min | concurrency 1
- **Purpose**: Run WCAG contrast checks against DTCG design tokens. Produces a structured accessibility report.

Example input:
```json
{ "apply": true, "schema": { "version": "2026.02", "screens": ["..."] } }
```

Input fields:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `apply` | boolean | No (default `false`) | Write a11y report artifact to disk |
| `schema` | UiSchema | No | Include component inventory in the report |

Notes:
- Loads DTCG token data, resolves alias chains, evaluates 18+ contrast rules.
- Report includes per-rule results (pass/fail with contrast ratio) and aggregate compliance summary.
- When `schema` is provided, the report also inventories which components are affected.

---

[Complete input/output reference](../api/a11y-scan.md).

### `release.tag`

- **Input schema**: `packages/mcp-server/src/schemas/release.tag.input.json`
- **Output schema**: `packages/mcp-server/src/schemas/release.tag.output.json`
- **Policy**: **maintainer only** | writes `${BASE}/${DATE}/**` | timeout 60s | rate 6/min | concurrency 1
- **Purpose**: Create a git tag for release. Validates tag format and checks for uncommitted changes.

Example input:
```json
{ "tag": "v0.2.0-internal.20260228", "message": "Sprint 52 release", "apply": true }
```

Input fields:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tag` | string | Yes | Tag name (format: `vX.Y.Z-internal.YYYYMMDD`) |
| `message` | string | No | Tag annotation message |
| `apply` | boolean | No | Actually create the tag (false = dry run) |

Output fields:
| Field | Type | Description |
|-------|------|-------------|
| `tag` | string | The tag name |
| `created` | boolean | Whether the tag was created |
| `warnings` | string[] | Issues (e.g., existing tag, uncommitted changes) |

---

[Complete input/output reference](../api/release-tag.md).

## UiSchema DSL (Design Lab)

The Design Lab UiSchema is defined by `packages/mcp-server/src/schemas/repl.ui.schema.json`.

Core shape:
- `version` (string, required): DSL version used by `repl.validate`/`repl.render`.
- `screens` (array, required): each entry is a UI element with `{ id, component, children?, props?, layout?, style?, bindings?, meta? }`.

Patch shape:
- `packages/mcp-server/src/schemas/repl.patch.json` supports:
  - RFC 6902 JSON patch ops (`[{ op, path, value? }, ...]`) where `path` is a JSON pointer
  - node-targeted ops (`{ nodeId, path, value?, op? }`) where `path` is a dotted or slash-separated property path relative to the node
