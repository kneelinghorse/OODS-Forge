# s204-m03 — Stage1 captures TraceLab's live frontend, and the Stage1 seam stops being unexercised

Builder self-certified: **false**. Built on `codex/sprint-204-observation` from `43e4b14e6` (m02 closed).

Three jobs: capture TraceLab, produce the fit read before any comparison is built, and end the silent
skip on the Stage1 seam. All three are done, and each produced a finding that changes what m04 can do.

## 1. The capture

**Real, authenticated, against production.** The mission said to bring TraceLab up locally; Derek
asked mid-mission why we were not using the hosted instance, and the question was right — for a
reason neither of us had measured yet.

| | local | production |
| --- | --- | --- |
| stack | brought up: postgres healthy, qdrant misconfigured (HTTPS/API-key), FastAPI on :8000 | live, `rbac_enabled: true`, reconciler ok |
| database | migrated to 38 tables, **4 rows total** — one user, one workspace, one invite code | real |
| unauthenticated render | **the sign-in wall, 183 characters** | **the sign-in wall, 183 characters** |

Both instances render the identical auth wall, so an unauthenticated capture of either would have
produced one login page. The local instance being empty was never the deciding factor; the wall was.

Derek logged in through a headed browser and the session was saved as a Playwright `storageState` to
the session scratchpad — never into a repository, because it carries live session tokens. Its origin
came back as `https://tracelab.aquex.ai`, because the Railway URL redirects to the canonical domain
and TraceLab's auth lives in `localStorage` rather than cookies.

### The run

```
node packages/stage1-cli/dist/index.js inspect app \
  --url https://tracelab.aquex.ai \
  --name tracelab-production \
  --auth <scratchpad>/tracelab-auth.json \
  --max-pages 25 --crawl-depth 2 --components \
  --include a11y --include network --include theming \
  -o /Users/systemsystems/portfolio/Design-Tools/Stage1/out
```

**Run id `edb8954d-44a6-4e48-b9d9-aad676f2bf18`**, at
`Stage1/out/stage1/tracelab-production/edb8954d.../artifacts/`, 18 artifacts.

It went through the CLI rather than the Stage1 MCP tools because **every `stage1_*` MCP call returned
`hub control request failed`** — the hub could not reach the Stage1 server. `packages/stage1-cli/dist/`
was already built, so no build, no source change, and the hub outage is recorded rather than worked
around silently.

`robots.txt` was checked before crawling: Cloudflare's content-signals boilerplate with **no
`User-agent` or `Disallow` directives at all**, so nothing disallowed the crawl and
`--robots-override` was not used. Ownership was not treated as a substitute for looking.

### What it saw

**25 routes, with real records** — not empty states:

| | |
| --- | --- |
| list routes | `/collections` `/documents` `/evidence` `/graph` `/missions` `/projects` `/reports` |
| real detail records | 6 projects, 5 reports, 2 missions, by UUID |
| other | `/` `/missions/new` `/admin/observability` `/admin/spaces` `/admin/users` |
| components | 951 candidates → **78 clusters**, 11,851 instances across 25 pages |
| objects | `entity_catalog`: **Mission, Project, Report**. `implicit_object_model`: Category, CatalogItem + 40 implied traits |

**Three of the entities Stage1 named are three of the seven research objects Forge already holds**
(Chunk, Collection, Document, Evidence, Mission, Project, Report, from TraceLab's own PR #105). Six of
the seven have live routes. Only `Chunk` has none, which fits — it is a sub-unit of a document, not a
screen. That is the seam m04 compares across, and it is real on both sides.

## 2. The fit read

`scripts/product-reality/s204-m03-stage1-fit.ts`, run against the TraceLab capture and — for contrast —
against an existing 3-target suite run. Every artifact gets one of three verdicts, and
`readable-today` is not a claim the table makes: the script **calls `structuredData.fetch`** and
records what came back.

| | TraceLab (`inspect app`) | hvac-competitive-ia (`inspect suite`) |
| --- | ---: | ---: |
| artifacts / distinct kinds | 18 / 18 | 56 / 27 |
| **readable today** | **0** | 3 — `identity_graph`, `capability_rollup`, `drift_report` |
| corresponds to a Forge concept | 11 | 13 |
| not comparable, with reason | 7 | 11 |

It exits non-zero on a kind the table does not mention, and it earned that on first run: the TraceLab
capture emitted `overlay_messaging`, which no earlier run had, and the fit read refused to ignore it
rather than quietly dropping it. It is now classified (drawers, modals and message mounts against
Forge's `Banner` and `ArchivedRowOverlay` — the concept exists on both sides at very different
coverage).

### The finding that mattered most to m04 — found, then RESOLVED

The first capture produced **zero** artifacts Forge could read. Derek asked to settle that before m04
started, which was the right call, and settling it took two measurements that each corrected a wrong
conclusion of mine.

**First conclusion, WRONG: "`inspect app` and `inspect suite` have disjoint capabilities, so an
authenticated contract-readable capture is impossible."** That was inferred from which runs happened
to carry rollups, not from reading the code. The actual gate is in `stage1-cli/src/index.ts`:

```js
if (includeInfer) {
    requested.push("identity.cross_surface_resolution");
    requested.push("semantic.capability_rollup");
    requested.push("semantic.object_rollup");   // ...
}
```

The rollups are gated on **`--infer`**, not on target count and not on the suite pipeline. The first
capture simply did not pass it. Re-captured with `--infer` and the same `--auth`, run
**`d0a43821-5730-4bf3-8b40-20f6fcb6b69c`** carries all four kinds:
`identity_graph` 1.2.0, `capability_rollup` 1.2.0, `object_rollup` 1.2.0, `drift_report` 1.0.0.

**Second measurement: `object_rollup` 1.2.0 was refused, and the payload was already compatible.**
A real 1.2.0 rollup, byte-identical except for its version string rewritten to 1.1.0, parsed under
Forge's existing validator — `schemaValidated: true`, all **84 objects** intact, and
`requires_human_adjudication: true` passing through and readable. The allow-list string was the only
thing refusing it. Supporting facts: **every** `object_rollup` on disk is 1.2.0, so the list was stale
against all current Stage1 output rather than part of it; Stage1 validates 1.0.0, 1.1.0 and 1.2.0 with
one zod schema; and Forge's validators already use `additionalProperties: true`.

**Resolution, on Derek's decision:** `object_rollup` 1.2.0 added to the allow-list, and
`requires_human_adjudication` surfaced on `Stage1ObjectRollup`. The 1.2.0 delta is a single optional
boolean, and it is one Forge wants rather than tolerates — it is true when a rollup's semantic→OODS
mappings are gated, marking them PROPOSALS requiring human adjudication and never auto-apply
directives. That is the machine-readable form of the rule near.md §8 states in prose and that Phase E
is built on. The fast-fail intent is unchanged: an unknown version is still refused, proven by the
2.0.0 refusal test.

**The result, measured end to end on the real capture:**

| | first capture | with `--infer` + the widening |
| --- | ---: | ---: |
| artifacts / kinds | 18 / 18 | 25 / 25 |
| **readable today** | **0** | **4** — `identity_graph`, `capability_rollup`, `object_rollup`, `drift_report` |
| corresponds | 11 | 13 |
| not comparable | 7 | 8 |

m04 can now read the run with `structuredData.fetch` exactly as it is specified to, and the capability
normalizer's evidence index is fed through the tool contract rather than running empty.

The pins that recorded the gap were written to fail when it closed, and they did: the e2e assertion
that `object_rollup` was outside the contract is now inverted to require that it is readable with its
flag intact, and the spec's local restatement of the allow-list had to be updated by hand — which is
exactly the deliberate step it exists to force.

## 3. The seam that nobody ran

**16 skipped → 9.** The e2e suite runs **642 passed, 9 skipped**. The remaining 9 are all in one file
and are carried to the review rather than resolved here; see below for why the first attempt to
retire them was wrong and was reverted.

The cause of the rot was not the missing data — it was that `it.runIf` made two very different things
indistinguishable: *the fixture data moved* and *you do not have Stage1 checked out* both produced a
silent skip.

**`stage1-rollups.e2e.spec.ts` — re-pointed, 7 skipped → 0.** Runs are now DISCOVERED (any target
under `out/stage1/<suite>/<run>/artifacts/targets/<target>/` carrying all three rollups — 10 found on
this machine) instead of two hard-coded paths under `out/sprint-46-live-rerun/`, which no longer
exists. Assertions are about the CONTRACT — every accepted kind parses, or is refused as a typed
`OODS-N007` naming its versions — rather than about one site's node counts, since counts copied from a
particular capture are what tied the old gate to runs that then vanished. **A missing fixture now
fails** whenever Stage1 is present; the skip survives only for a machine with no Stage1 checkout.

It also carried a pin on the drift it should have caught, written to fail the day the allow-list was
widened. It did, in this same mission, and the assertion is now inverted: `object_rollup` must be
READABLE with `requires_human_adjudication` intact.

**`action-mappings.e2e.spec.ts` — RETIREMENT ATTEMPTED, REVERTED, and carried to the review.**

The finding stands: `bridge_summary.json` exists in **zero runs** on disk and the string
`bridge_summary` appears in **zero TypeScript files** in the Stage1 repository. The emitter is gone and
its 9 bridge-dependent tests cannot be re-pointed at anything.

But retiring the FILE was wrong, twice over, and the full suite caught it:

1. **It over-reached.** The file holds 12 tests, not 9. Three are plain `it(...)` cases driving
   `pipelineHandle` with a synthetic lifecycle fixture — no Stage1 dependency at all. They were
   passing, they still pass, and deleting them destroyed working regression coverage of the full
   action-matching path.
2. **It broke a Sprint 184 disclosure.** `artifacts/product-reality/sprint-184/m07/b2-repoint-disposition.json`
   binds **6 of its 13 retained repoints** to selectors in this file, asserting each one still resolves
   to a live call site with its body intact. Deleting the file failed
   `b2-legacy-inputs.s184.spec.ts`. Editing that frozen disposition — a receipt carrying its own
   `reviewedSourceHead` and `repointCommit` — to make a new change pass would be exactly the
   "receipts that lied" pattern this sprint exists to correct.

So the file is restored byte-for-byte and the 9 tests skip as before. **Whether to retire them, and
what to do about the three Sprint 184 bindings that retirement would break, is the review's call.**
Three of the six bound call sites sit inside the bridge-dependent group, so no partial retirement
preserves all of them.

The process failure is worth recording too: m03 was committed after running only `test/e2e/` and the
tool-truth spec, not the full mcp-server suite. The over-reach surfaced one mission later, in the
widening's verification run, rather than at the commit that caused it.

A bug worth recording: the first version of the re-pointed rollups gate resolved Stage1 with a
hard-coded `../../../../../Stage1`, which lands inside `.worktrees/` because sprints build two levels
deeper (AGENTS.md rule 5b) — so it found nothing and took the "no Stage1 here" branch. It had
reproduced the exact defect it was written to fix. It walks up the tree now.

## Nothing was written into either repository

- **TraceLab: 0 tracked changes.** The stack was started and migrated, which writes to the Docker
  volume. Migration 023 refuses a non-email `AUTH_USERNAME` because it seeds a recoverable bootstrap
  owner; Derek chose the address and it was passed as `-e AUTH_USERNAME=…` to the container, so no
  file was edited. `node_modules` and `.next` already existed.
- **Stage1: 0 tracked changes from this mission.** `git status` shows 4 modified files and 1 untracked,
  all dated **2026-09-16** — pre-existing work from the day before. The capture landed at 16:55 on
  2026-09-17 under `out/`, which `.gitignore:15` ignores.
- The suite YAML authored for the local attempt is retained **here**, in Forge's tree, not in Stage1's.
- The `storageState` is in the session scratchpad and is in neither repository.

## Files

| path | what |
| --- | --- |
| `suite-tracelab.yaml` | the suite authored for the local capture, retained with its reasoning |
| `fit-tracelab/stage1-fit.json` | the fit read over the real TraceLab capture |
| `fit-suite-contrast/stage1-fit.json` | the same read over a 3-target suite run, showing what a suite emits that an app capture does not |
| `scripts/product-reality/s204-m03-stage1-fit.ts` | the fit read itself |

## Carried to the review

1. ~~m04's stated mechanism does not work against this capture.~~ **RESOLVED** — `--infer` emits all
   four kinds and the allow-list was widened on measured evidence. m04 reads the run with
   `structuredData.fetch` as specified. The widening was a deliberate scope call by Derek, made after
   m03 recorded what a later mission would need; it is flagged here because Sprint 204's memo said not
   to widen the contract, and this is the exception, taken with its evidence.
2. ~~`object_rollup` 1.2.0 is unreadable.~~ **RESOLVED** — same change.
3. **The 9 `action-mappings` tests still skip, and their retirement needs a decision.** The artifact
   they read is gone from Stage1 entirely, but retiring the file breaks three Sprint 184 repoint
   bindings, and rewriting that frozen disposition to suit a later change is not something this
   mission should do on its own.
4. **The Stage1 MCP tools are down** — `hub control request failed` on every call. Unrelated to this
   sprint's code, but it is how a Forge agent is supposed to reach Stage1.
5. **Qdrant is misconfigured on the local stack** (`QDRANT_URL must use HTTPS when QDRANT_API_KEY is
   set`), so local vector search is unhealthy. Production is fine. Not Forge's to fix; recorded because
   it was measured.
