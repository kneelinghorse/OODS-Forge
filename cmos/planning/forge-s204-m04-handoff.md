# Sprint 204 — handoff into m04

Written for: the next build session picking up Sprint 204 at m04.

Builder self-certified: **false**. Branch `codex/sprint-204-observation`, worktree
`.worktrees/s204/` inside the Forge repo.

## State

| mission | status |
| --- | --- |
| m01 the capture made affordable | complete, `0243e7bd4` |
| m02 the Sprint 203 screen defects | complete, `43e4b14e6` |
| m03 TraceLab captured, the Stage1 seam | complete, `d1208a626` |
| **m04 the difference computed** | **not started** |
| m05 the difference presented | queued |
| m06 closeout | queued |

m04's blocker was found and cleared before handing off. Read `artifacts/product-reality/sprint-204/m03/README.md`
first — it holds the fit read m04 is built on.

## The blocker m04 had, and how it was cleared

m03's first capture produced **zero** artifacts Forge could read, which would have made m04's stated
mechanism — "reads the run from a filesystem path with `structuredData.fetch`, exactly as it does
today" — return nothing. Two measurements cleared it.

**1. The rollups are gated on `--infer`, not on the suite pipeline.** An earlier conclusion in this
session that `inspect app` and `inspect suite` have disjoint capabilities was WRONG; it was inferred
from which runs happened to carry rollups rather than from reading `stage1-cli/src/index.ts`, where
`if (includeInfer)` pushes `identity.cross_surface_resolution`, `semantic.capability_rollup` and
`semantic.object_rollup`. `inspect app` takes `--infer` and `--auth` together.

**2. `object_rollup` 1.2.0 was refused, and the payload was already compatible.** A real 1.2.0 rollup,
byte-identical except for its version string rewritten to 1.1.0, parsed under Forge's existing
validator with `schemaValidated: true` and all 84 objects intact. The allow-list string was the only
thing refusing it. Every `object_rollup` on disk is 1.2.0 — there is no 1.1.0 anywhere — so the list
was stale against all current Stage1 output.

Derek approved widening it. `object_rollup` now accepts `1.2.0`, and `requires_human_adjudication` is
surfaced on `Stage1ObjectRollup`: true when a rollup's semantic→OODS mappings are gated, marking them
PROPOSALS requiring human adjudication and never auto-apply directives. **That flag is the
machine-readable form of the rule m04 is built around** — near.md §8 rules out autonomous semantic
reconciliation by name. Read it; do not infer the rule out of band.

## What m04 reads

**The run: `d0a43821-5730-4bf3-8b40-20f6fcb6b69c`**, at

```
~/portfolio/Design-Tools/Stage1/out/stage1/tracelab-production-infer/d0a43821-.../artifacts/
```

25 artifacts, and all four accepted kinds present and readable, **zero refusals**:

| kind | schema_version |
| --- | --- |
| `identity_graph` | 1.2.0 |
| `capability_rollup` | 1.2.0 |
| `object_rollup` | 1.2.0 |
| `drift_report` | 1.0.0 |

Re-verify with the retained fit read rather than trusting this table:

```
pnpm exec tsx scripts/product-reality/s204-m03-stage1-fit.ts \
  --run ~/portfolio/Design-Tools/Stage1/out/stage1/tracelab-production-infer/d0a43821-5730-4bf3-8b40-20f6fcb6b69c \
  --out <somewhere>
```

It exits non-zero if Stage1 emits a kind its table does not mention, which is how `overlay_messaging`
was caught. Landed output: `artifacts/product-reality/sprint-204/m03/fit-tracelab-infer/stage1-fit.json`.

There is an **earlier, non-infer run** of the same site, `edb8954d-44a6-4e48-b9d9-aad676f2bf18`, with
18 artifacts and none of the four kinds. Do not use it for m04. It is retained because its fit read is
the before-half of the finding.

## The comparison surface is real on both sides

`entity_catalog` names **Mission, Project, Report** — three of the seven research objects Forge holds
under `objects/research/` (Chunk, Collection, Document, Evidence, Mission, Project, Report, from
TraceLab's PR #105).

Of the seven, **six have live routes** in the capture — only `Chunk` has none, which fits a sub-unit of
a document rather than a screen. The 25 discovered routes include `/collections` `/documents`
`/evidence` `/graph` `/missions` `/projects` `/reports`, real detail records (6 projects, 5 reports, 2
missions by UUID), and observed-only surfaces with no Forge object at all: `/admin/spaces`,
`/admin/users`, `/admin/observability`, `/missions/new`.

That gives m04 all four of its required categories from real data: **observed-only** (the admin
routes), **composed-only** (Chunk, and any context Forge composes that the app does not expose),
**agreeing**, and **disagreeing**.

## Rules m04 must hold (from the sprint lock, #2183)

1. The difference is **EVIDENCE FOR REVIEW**, never an instruction, proposal or automatic
   reconciliation. `requires_human_adjudication` now carries that signal in the data.
2. **Both provenances on every row** — Stage1 run uuid, target, artifact kind, read path; and the Forge
   composition's object, context, URN. A row that cannot say where both sides came from is not shown.
3. Forge reads from a **filesystem path** and opens no other product's store. Extend the s203 closure
   spec over everything m04 adds.
4. Type the four categories **separately**, naming the axis of each disagreement. An undifferentiated
   drift count is not the deliverable.
5. **Typed refusals that write nothing at all** on failure; new codes continue from **OODS-V207**,
   which was the last taken.
6. State the **measured scale**: targets, screens, rows, wall time.

## The TraceLab session token — expires

The Playwright `storageState` is at
`/private/tmp/claude-501/.../scratchpad/tracelab-auth.json` (session scratchpad, deliberately **not**
in any repository — it carries live session tokens).

**m04 does not need it.** It reads the captured run on disk, not the live site. The token matters only
for a RE-CAPTURE, and it will have expired. To make a new one, Derek logs in himself:

```
# headed browser opens; he logs in; storageState saves on success
pnpm exec tsx <script that launches chromium headed, goes to
  https://tracelab.aquex.ai/missions, polls until the sign-in wall clears,
  then context.storageState({ path })>
```

Credentials never pass through the agent. The saved origin comes back as `https://tracelab.aquex.ai`
(the Railway URL redirects to the canonical domain, and auth lives in `localStorage`, not cookies).

For a re-capture, the literal command that worked:

```
node packages/stage1-cli/dist/index.js inspect app \
  --url https://tracelab.aquex.ai --name tracelab-production-infer \
  --auth <storageState> --max-pages 25 --crawl-depth 2 --components --infer \
  --include a11y --include network --include theming \
  -o ~/portfolio/Design-Tools/Stage1/out
```

## Environment left running

- **TraceLab local docker stack** — `tracelab_dev_postgres` (healthy), `tracelab_dev_qdrant`,
  `tracelab_dev_backend` on :8000. Migrated to 38 tables with 4 rows. Stop with
  `pnpm dev:down` from `~/portfolio/TraceLab` — note that uses `-v` and drops the volume.
- **TraceLab frontend dev server** on :3000.
- **Docker Desktop** — started this session; it was down beforehand.
- Neither is needed by m04.

## Carries for the review

1. **The 9 skipped `action-mappings` e2e tests.** `bridge_summary.json` is in zero runs AND zero
   Stage1 source files, so they cannot be re-pointed. Retiring the FILE was attempted and **reverted**:
   it deleted three passing synthetic tests that have no Stage1 dependency, and it broke
   `b2-repoint-disposition.json`, a frozen Sprint 184 receipt binding 6 of its 13 retained repoints to
   selectors in that file. Three of those six sit inside the bridge-dependent group, so no partial
   retirement preserves all of them. Editing that disposition to suit a later change would be the
   "receipts that lied" pattern this sprint exists to correct. **The review decides.**
2. **The Stage1 MCP tools are down** — every `stage1_*` call returns `hub control request failed`. The
   work went through Stage1's already-built CLI at `packages/stage1-cli/dist/index.js`. Note the hub
   failed to RETURN a result, not to execute: a run directory
   (`out/stage1/tracelab-frontend-s204/f4852c87…`) exists from a call that reported failure.
3. **Local qdrant misconfigured** — `QDRANT_URL must use HTTPS when QDRANT_API_KEY is set`. Production
   is fine. Not Forge's to fix.
4. **`design.compose.s202`'s OODS-V204 arm no longer reproduces** (from m02) — re-anchor on another
   object or retire it.
5. **`Statusable.trait.yaml` authors a second refused component** (from m02) — `Banner`, same three
   props as the `Badge` that was fixed, no field-directive sibling.
6. **22 dashboard screens have no browser receipt** (from m02) — `design.preview` does not accept that
   context.

## A process note worth carrying

m03 was committed after running only `test/e2e/` and the tool-truth spec, not the full mcp-server
suite. The over-reach in carry 1 surfaced one mission later, during the widening's verification, rather
than at the commit that caused it. **Run the full suite before committing a mission that touches shared
specs** — this repo's specs read each other's source text, so deleting a test can fail a receipt three
sprints old.
