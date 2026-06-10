# OODS Foundry API Reference

Auto-generated from JSON schemas and tool-descriptions.json.

## Auto-registered Tools

| Tool | Description |
|------|-------------|
| [tokens.build](./tokens-build.md) | Build design tokens for a brand and theme. Returns compiled CSS variables and token artifacts. Use apply=true to write output files (default: dry-run, returns preview only). |
| [structuredData.fetch](./structuredData-fetch.md) | Fetch structured data exports (components, tokens, or manifest) or Stage1 v1.5.0 rollup artifacts (identity_graph, capability_rollup, object_rollup) via kind+runPath. Supports ETag caching, version pinning, and version listing in dataset mode; schema_version validation in rollup mode. |
| [brand.apply](./brand-apply.md) | Apply brand token overlays using alias or RFC 6902 patch strategy. Requires a delta object. Use apply=true to write changes to disk (default: dry-run, returns preview only). |
| [catalog.list](./catalog-list.md) | List available OODS components from the design system catalog. Filter by category, trait, or rendering context. Response includes availableCategories array showing all valid category values for filtering. |
| [code.generate](./code-generate.md) | Generate framework-specific code (React, Vue, or HTML) from a validated UiSchema tree. Accepts schemaRef from design.compose. Supports TypeScript and token-based styling. Note: schemaRef expires after 30 minutes — use schema.save to persist. |
| [design.compose](./design-compose.md) | Compose a complete UiSchema from a natural-language intent description. Returns schemaRef for reuse in validate/render/code.generate. schemaRef includes createdAt/expiresAt timestamps (default TTL: 30 minutes). Use schema.save to persist beyond TTL. |
| [pipeline](./pipeline.md) | Execute the full design pipeline (compose -> validate -> render -> codegen) in a single call. Defaults to compact render mode (token CSS omitted, ~40% smaller). Supports optional validation/render skipping, accessibility checks, and schema persistence via save parameter. Returns schemaRefCreatedAt/schemaRefExpiresAt (default TTL: 30 minutes). Use save to persist the schema. |
| [health](./health.md) | Check MCP server readiness and subsystem status, including registry counts, token artifact availability, and schema store state. |
| [registry.snapshot](./registry-snapshot.md) | Return the full registry state in one call: maps, traits, objects, etag, and generatedAt. Intended for reconciliation consumers that would otherwise need map.list plus N× map.resolve. |
| [viz.compose](./viz-compose.md) | Compose a visualization schema from chart type, data bindings, and/or object viz traits. Returns schemaRef for pipeline reuse. schemaRef includes createdAt/expiresAt (default TTL: 30 minutes). Supports bar, line, area, and point chart types with axis, color, and size encodings. |
| [fidelity.preview](./fidelity-preview.md) | MCP tool: fidelity.preview |
| [map](./map.md) | Grouped mapping-registry tool. Set `action` to one of apply|create|list|resolve|update|delete to select the operation; the remaining fields match that action's contract. Consolidates the former map.* tools with identical per-action behavior. |
| [schema](./schema.md) | Grouped schema-store tool. Set `action` to one of save|load|list|delete. Consolidates the former schema.* tools with identical per-action behavior. Use action=save to persist a composed UiSchema beyond the 30-minute schemaRef TTL. |
| [object](./object.md) | Grouped object-registry tool. Set `action` to list (filter OODS objects) or show (full object definition incl. composed traits and view extensions). Consolidates the former object.* tools with identical per-action behavior. |
| [repl](./repl.md) | Grouped Design Lab REPL tool. Set `action` to validate (check a UiSchema/patch against the DSL+registry) or render (produce HTML/CSS preview; apply=true to emit). Consolidates the former repl.* tools with identical per-action behavior. |
| [review](./review.md) | Grouped reconciliation-review tool. Set `action` to resolve (apply a policy bundle to an Object Catalog manifest) or chain (compose the full review-queue → resolve → conflict-detail → apply-summary artifacts). Consolidates the former review.* tools with identical per-action behavior. |

## On-demand Tools

| Tool | Description |
|------|-------------|
| [diag.snapshot](./diag-snapshot.md) | Capture a diagnostic snapshot bundle of the current design system state for debugging and reproducibility. |
| [reviewKit.create](./reviewKit-create.md) | Create a review kit artifact bundle for design review workflows. |
| [billing.reviewKit](./billing-reviewKit.md) | Generate a billing review kit comparing provider fixtures (Stripe, Chargebee) for a billing object. |
| [billing.switchFixtures](./billing-switchFixtures.md) | Switch the active billing fixture provider for Storybook scenarios. Use apply=true to record the switch (default: dry-run). |
| [a11y.scan](./a11y-scan.md) | Run WCAG accessibility contrast checks against design tokens. Optionally include a UiSchema for component inventory. |
| [purity.audit](./purity-audit.md) | Audit design token purity and detect style drift or non-standard overrides. |
| [vrt.run](./vrt-run.md) | Run visual regression tests against the current component state. |
| [release.verify](./release-verify.md) | Verify release readiness for specified packages. Checks changelogs, versions, and build artifacts. |
| [release.tag](./release-tag.md) | Create a release tag in the repository. Requires a tag name; optionally include a message. |
