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

### Rule 5b — Never write this app's code outside this repository. Ever.

Every file you create or edit for this project lives under `/Users/systemsystems/portfolio/Design-Tools/OODS-Forge`. No exceptions, no temporary exceptions, no "it's the same git object store anyway."

**Sprint build checkouts belong in `.worktrees/<sprint>/` inside this repo** — gitignored, but present and visible where Derek works. Create one with:

```
git worktree add .worktrees/s205 codex/sprint-205-<name>
```

Never `~/.codex/worktrees/`, never `/tmp`, never a sibling directory, never anywhere outside this tree. If you find an existing checkout outside the repo, move it in with `git worktree move <old-path> .worktrees/<sprint>` — that preserves `node_modules` and built `dist` directories — and say you did.

**Why a second checkout exists at all:** the repo root is what pm2 serves the live bridge from, so building or testing there swaps `dist` under a running bridge. That is the entire reason. It has never been a reason to put code somewhere hidden.

The only writes allowed outside this repo are to your session scratchpad for throwaway logs and intermediate output that is not app code and not a receipt. Receipts are app-repo content: they go under `artifacts/`.

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

Recovery ownership: this active OODS-Forge repository is the canonical implementation and integration
source for the design system and MCP toolchain. The historical, push-disabled `upstream`
OODS-Foundry remote is a reference and possible later public mirror, not a second implementation
target. Moving canonical source again requires a separately approved migration and reconciliation
plan.

Historical reference: https://github.com/kneelinghorse/OODS-Foundry
Published Storybook surface: https://kneelinghorse.github.io/OODS-Foundry/

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
- Render and validate Design Lab schemas with `repl` (`action: render` or `action: validate`).
- Render chart IR with `viz.render`, then grade it with `artifact.certify`.
- Apply brand overlays and build token artifacts with MCP tools.
- Generate diagnostics and transcripts for repeatable workflows.
- Follow runbooks to add traits, objects, charts, or token updates.
- Operate missions and sessions through CMOS (backlog, status, logging).

## MCP tool inventory

The counts and tool names below are derived from
`packages/mcp-server/src/tools/registry.json`; use that file as the generation
source whenever this hand-authored inventory is refreshed.

Auto-registered (19 tools):

- Core design/runtime: `tokens.build`, `structuredData.fetch`, `brand.apply`, `brand.intake`, `catalog.list`, `health`
- Composition + generation: `design.compose`, `design.preview`, `viz.render`, `dashboard.render`, `pipeline`, `code.generate`, `fidelity.preview`
- Certification + inspection: `artifact.certify`, `registry.snapshot`
- Action families: `map`, `schema`, `object`, `repl`

On-demand (5 tools):

- `diag.snapshot`, `billing.reviewKit`, `billing.switchFixtures`
- `a11y.scan`, `release.tag`

Enable on-demand tools:

- `MCP_TOOLSET=all` to register every tool in the registry.
- `MCP_EXTRA_TOOLS=a11y.scan,diag.snapshot` to add a subset.
- Registry source: `packages/mcp-server/src/tools/registry.json`

Full contracts: `docs/mcp/Tool-Specs.md`

### Tool policy: two layers (both required for bridge-exposed tools)

A tool that agents call through the bridge is gated by **two** policy files, and
a registration must appear in **both** or enforcement/visibility diverges:

- `configs/agent/policy.json` — the agent/bridge layer (what the connector exposes).
- `packages/mcp-server/src/security/policy.json` — the server layer (allow-roles, rate/timeout/concurrency caps).

When adding, removing, or renaming a bridge-exposed tool, update both. A tool
present in only one layer is a registration gap: the server may enforce a policy
the agent layer never advertises, or vice versa. (Concrete example caught in
s106-m02: `concordance.validate` lived only in the server layer, never the agent
layer — a pre-existing single-layer gap, surfaced while removing the tool.)

Usage patterns:

- Registry → render: `structuredData.fetch` to discover components, then `repl` (`action: validate`) and `repl` (`action: render`) to iterate on schemas.
- Brand work: `tokens.build` for token artifacts, then `brand.apply` when you want overlays applied.
- QA snapshots: `diag.snapshot` when you need a reproducible artifact bundle.

## Environment setup

Copy `.env.example` to `.env` and fill in any secrets you need. All test
runners (`vitest`), the MCP server entry point
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
3. Render a data-bound chart with `viz.render`, passing matching rows and encodings and setting `output.includeNormalizedSpec: true`.
4. Pass the returned `normalizedSpec` to `artifact.certify`. For an ECharts-primary chart, also pass the same data operand used by `viz.render`.

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
