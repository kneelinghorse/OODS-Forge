# OODS Foundry MCP Agent Charter

Welcome, agents. This repo is the MCP interface to OODS Foundry: the place where agents design, validate, and automate with the design system.

---

## Hard Operating Rules

**Foundational — preserve this block when customizing the rest of this file.**

**These rules are not optional.**

These rules apply to every task in this project unless explicitly overridden.
Bias: caution over speed on non-trivial work.

### Rule 1 — Think Before Coding

State assumptions explicitly. Ask rather than guess.
Push back when a simpler approach exists. Stop when confused.

### Rule 2 — Simplicity First

Minimum code that solves the problem. Nothing speculative.
No abstractions for single-use code.

### Rule 3 — Surgical Changes

Touch only what you must. Don't improve adjacent code.
Match existing style. Don't refactor what isn't broken.

### Rule 4 — Goal-Driven Execution

Define success criteria. Loop until verified.
Strong success criteria let Claude loop independently.

### Rule 5 — Capture decisions and learnings

Non-trivial choices belong in CMOS. Decisions to `cmos_decisions`, cross-cutting patterns to `cmos_learnings`.
If future-you needs to know why, capture it now.

### Rule 6 — Commit at coherent boundaries

Commit at mission close, sprint close, or day boundary. Per-mission commits only when a sprint surfaces a real bisection need.

### Rule 7 — Surface conflicts, don't average them

If two patterns contradict, pick one (more recent / more tested).
Explain why. Flag the other for cleanup.

### Rule 8 — Read before you write

Before adding code, read exports, immediate callers, shared utilities.
If unsure why existing code is structured a certain way, ask.

### Rule 9 — Tests verify intent, not just behavior

Tests must encode WHY behavior matters, not just WHAT it does.
A test that can't fail when business logic changes is wrong.

### Rule 10 — Checkpoint after every significant step

Summarize what was done, what's verified, what's left.
Don't continue from a state you can't describe back.

### Rule 11 — Match the codebase's conventions, even if you disagree

Conformance > taste inside the codebase.
If you think a convention is harmful, surface it. Don't fork silently.

### Rule 12 — Fail loud

"Completed" is wrong if anything was skipped silently. "Tests pass" is wrong if any were skipped.
Flag uncertainty before stating a fact, statistic, date, or technical detail — never fill gaps with plausible-sounding information.

### Rule 13 — No filler openings

Start with the answer. No "Great question!", "Of course!", "Certainly!", or warmup acknowledgments.

### Rule 14 — Match response length to task

Simple questions get short answers. Complex tasks get full responses.
Don't pad with restatements or closing sentences that repeat what was just said.

---

Design system source of truth: https://github.com/kneelinghorse/OODS-Foundry
Storybook surface: https://kneelinghorse.github.io/OODS-Foundry/

## OODS in 8 lines

- Traits are small, composable capabilities.
- The trait engine assembles traits into objects.
- The object registry defines canonical shapes (User, Subscription, Product).
- The view engine renders list, detail, form, and timeline contexts.
- DTCG tokens flow through Style Dictionary into CSS variables.
- Tailwind consumes component tokens for UI consistency.
- Multi-brand theming is driven by data-brand and data-theme.
- Guardrails keep accessibility and visual regression in view.

## Repo map

- Agent tooling: `packages/mcp-server/`, `packages/mcp-bridge/`, `packages/mcp-adapter/`, `tools/`
- Structured data + artifacts: `artifacts/`, `cmos/planning/`, `artifacts/structured-data/`
- Design system snapshot: `src/`, `traits/`, `objects/`, `packages/tokens/`
- Documentation: `docs/`, `docs/mcp/`, `docs/runbooks/`
- Mission system: `cmos/` (SQLite + CLI + mission context)

## What agents can do here

- Explore traits, objects, components, and patterns via structured data exports.
- Render and validate Design Lab schemas with `repl.render` and `repl.validate`.
- Apply brand overlays and build token artifacts with MCP tools.
- Generate diagnostics and transcripts for repeatable workflows.
- Follow runbooks to add traits, objects, charts, or token updates.
- Operate missions and sessions through CMOS (backlog, status, logging).

## MCP tool inventory

Auto-registered (default):
- `tokens.build` - build tokens with MCP artifacts
- `structuredData.fetch` - read structured data registry
- `repl.validate` - validate Design Lab schemas
- `repl.render` - render Design Lab previews
- `brand.apply` - apply brand overlays (approval gates on apply)

On-demand (enable when needed):
- `diag.snapshot`, `reviewKit.create`, `billing.reviewKit`, `billing.switchFixtures`
- `a11y.scan`, `purity.audit`, `vrt.run`
- `release.verify`, `release.tag`

Enable on-demand tools:
- `MCP_TOOLSET=all` to register every tool in the registry.
- `MCP_EXTRA_TOOLS=a11y.scan,vrt.run` to add a subset.
- Registry source: `packages/mcp-server/src/tools/registry.json`

Full contracts: `docs/mcp/Tool-Specs.md`

Usage patterns:
- Registry → render: `structuredData.fetch` to discover components, then `repl.validate` and `repl.render` to iterate on schemas.
- Brand work: `tokens.build` for token artifacts, then `brand.apply` when you want overlays applied.
- QA snapshots: `diag.snapshot` when you need a reproducible artifact bundle.

## Environment setup

Copy `.env.example` to `.env` and fill in `CONCORDANCE_API_KEY` (and any other
secrets you need). All test runners (`vitest`), the MCP server entry point
(`packages/mcp-server/src/index.ts`), and the bridge
(`packages/mcp-bridge/src/server.ts`) load `.env` automatically via `dotenv` —
no manual `export` needed before running tests or starting services. The
`.gitignore` allowlists `.env.example` but blocks `.env` itself.

### Scale-tier determinism suite (opt-in)

The Q1 determinism gate (mission-graph V2 axis #7) runs `map.apply` against
synthesized reconciliation reports at 100/500/1000 candidate_objects. Run it
with:

```
pnpm --filter @oods/mcp-server run test:scale
```

The suite lives at `packages/mcp-server/test/scale/` with its own vitest
config (`vitest.scale.config.ts`). It is **excluded from the default
vitest run** so normal `pnpm test` / `npx vitest` stay fast; CI runs it as a
separate `scale-determinism` job. Each test creates a unique temp dir under
`os.tmpdir()` and sets `MCP_MAPPINGS_PATH` to that dir for the test scope,
keeping parallel workers isolated. The fixture synthesizer is seeded
(mulberry32) — same seed produces byte-identical output. Release-gate
integration is deferred until s106 + s107 sustain the 3-sprint determinism
streak per the s105-m03 mission-start audit (decision #614).

### OTLP telemetry (optional)

The MCP server emits OpenTelemetry traces over OTLP/HTTP when
`OODS_OTLP_ENDPOINT` is set. When unset (the default), the OTel SDK is never
loaded — zero runtime overhead, zero import-time cost beyond the small
`@opentelemetry/api` package's no-op tracer.

- `OODS_OTLP_ENDPOINT` — full OTLP traces endpoint, e.g.
  `http://localhost:4318/v1/traces`. Setting this enables telemetry.
- `OODS_OTLP_SERVICE_NAME` — overrides the default service name
  (`oods-forge-mcp-server`). The standard `OTEL_SERVICE_NAME` env var also
  works and takes precedence if set.
- `OODS_OTLP_HEADERS` — comma-separated `key=value` pairs for the OTLP
  exporter (e.g. `Authorization=Bearer xyz,x-team=design`).

Every MCP tool dispatch produces a span named `forge.tool.<tool_name>` (e.g.
`forge.tool.design.compose`, `forge.tool.map.apply`) with `SpanKind.SERVER`.
Span attributes follow OTel `rpc.*` semantic conventions
(`rpc.system="oods-forge"`, `rpc.service="mcp-server"`, `rpc.method=<tool>`),
plus custom `oods.*` attributes (`oods.role`, `oods.request_id`,
`oods.ajv_failed`, `oods.ajv_layer`, `oods.error_code`,
`oods.ajv_error_count`). The five mission-named span kinds — compose,
validate, render, codegen, map.apply — are the priority observability
targets; other tool dispatches also produce spans for coverage. No metrics
layer is emitted at v1; invocation counts and AJV failure counts are
derivable from span data via the OTel collector's spanmetrics processor.

## Quick path to a first design action

1. Read `README.md` for repo identity and links.
2. Connect an MCP client via `docs/mcp/Connections.md`.
3. Refresh structured data if needed:
   ```bash
   pnpm refresh:data
   ```
4. Run a small MCP call via the CLI:
   ```bash
   pnpm exec tsx tools/oods-agent-cli/src/index.ts plan structuredData.fetch
   ```
5. Pick a runbook in `docs/runbooks/` or open a task doc in `docs/`.

## Context Loading Strategy

- Use `docs/agent-operations/context-loading.md` for the tiered loading pattern and token budgets.
- Example task manifests live in `docs/agent-operations/context-manifests/`.

## CMOS missions and sessions

- Mission queue: `./cmos/cli.py db show current` or MCP `cmos_mission_status()`
- Start/complete: `./cmos/cli.py mission update <id> --status "In Progress"` or MCP `cmos_mission_start()` / `cmos_mission_complete()`
- Database source: `cmos/db/cmos.sqlite`
- Contexts: `cmos/context/` and `cmos/docs/`

## Helpful commands

```bash
pnpm storybook
pnpm build:tokens
pnpm local:pr-check
pnpm --filter @oods/mcp-server run build
```

## Agent suggestion box

Use `docs/agent-suggestions.md` to log ideas, gaps, or improvements. Keep entries short and actionable.

## Docs index

- MCP setup: `docs/mcp/Connections.md`
- Tool inventory: `docs/mcp/Tool-Specs.md`
- Structured data refresh: `docs/mcp/Structured-Data-Refresh.md`
- Design system deep dives: `docs/README.md`
- Trait authoring: `docs/authoring-traits.md`
- Object authoring: `docs/authoring-objects.md`
