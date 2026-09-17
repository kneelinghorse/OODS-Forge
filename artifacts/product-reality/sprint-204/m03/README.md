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

### The finding that matters most to m04

**Forge can read nothing from the TraceLab capture.** Not one of the four kinds `structuredData.fetch`
accepts is present, and the cause is structural rather than incidental:

- **`inspect app` supports `--auth` but does not emit the four rollup kinds** — they are cross-surface
  passes.
- **`inspect suite` emits them but has no auth flag at all.**

So today, an *authenticated* Stage1 capture of TraceLab cannot produce a single artifact Forge is
contracted to read. m04 is specified to read the run "with `structuredData.fetch`, exactly as it does
today"; against this run, that yields nothing. This is precisely what a fit read is for — it is cheaper
to learn now than after a comparison is built on the assumption.

And separately, on the suite run:

- **Stage1 emits `object_rollup` at schema_version 1.2.0; Forge accepts 1.0.0 and 1.1.0**, so it is
  refused with `OODS-N007`. Forge advertises four readable kinds and can read three.
- The cost is not confined to that one kind: `normalizeCapabilities` builds its evidence index from
  `objectRollup`, so it still runs but with an **empty evidence index**. Capability evidence cannot
  reach Forge through the tool contract at all.

Widening the contract is out of scope this sprint by instruction. What a later mission needs is
recorded here: accept `object_rollup` 1.2.0, and give the suite pipeline an auth path (or give
`inspect app` the rollup passes) so an authenticated capture can produce contract-readable artifacts.

## 3. The seam that nobody ran

**16 tests skipped in every recent capture. Now 0.** The e2e suite runs **641 tests, 0 skipped**.

The cause was not the missing data — it was that `it.runIf` made two very different things
indistinguishable: *the fixture data moved* and *you do not have Stage1 checked out* both produced a
silent skip.

**`stage1-rollups.e2e.spec.ts` — re-pointed.** Runs are now DISCOVERED (any target under
`out/stage1/<suite>/<run>/artifacts/targets/<target>/` carrying all three rollups — 10 found on this
machine) instead of two hard-coded paths under `out/sprint-46-live-rerun/`, which no longer exists.
Assertions are about the CONTRACT — every accepted kind parses, or is refused as a typed `OODS-N007`
naming its versions — rather than about one site's node counts, since counts copied from a particular
capture are what tied the old gate to runs that then vanished. **A missing fixture now fails** whenever
Stage1 is present; the skip survives only for a machine with no Stage1 checkout.

It also pins the drift it should have caught: an assertion that `object_rollup` on disk is outside the
accepted contract, written to fail the day someone widens the allow-list, so that the widening mission
deliberately deletes it.

**`action-mappings.e2e.spec.ts` — retired, with its reason.** Measured, not assumed:
`bridge_summary.json` exists in **zero runs** on disk, and the string `bridge_summary` appears in
**zero TypeScript files** in the Stage1 repository. The emitter is gone, so there is nothing to
re-point at. Its Forge-side logic keeps unit coverage (`entity-resolver.test.ts`,
`orca-role-mapper.test.ts`, `b2-legacy-inputs.s184.spec.ts`); what is genuinely lost is real-data
assurance, and that is stated rather than called covered. The file now holds a check that **fails the
day Stage1 emits `bridge_summary.json` again**, so the gate gets rebuilt rather than rediscovered.

A bug worth recording: the first version of the re-pointed gate resolved Stage1 with a hard-coded
`../../../../../Stage1`, which lands inside `.worktrees/` because sprints build two levels deeper
(AGENTS.md rule 5b) — so it found nothing and took the "no Stage1 here" branch. It had reproduced the
exact defect it was written to fix. It walks up the tree now.

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

1. **m04's stated mechanism does not work against this capture.** `structuredData.fetch` reads none of
   its 18 artifacts. Either m04 compares from the `corresponds` artifacts read as files (outside the
   four-kind contract), or the contract is widened — which this sprint forbids. The review should say
   which.
2. **`object_rollup` 1.2.0 is unreadable**, and it takes capability evidence down with it.
3. **The Stage1 MCP tools are down** — `hub control request failed` on every call. Unrelated to this
   sprint's code, but it is how a Forge agent is supposed to reach Stage1.
4. **Qdrant is misconfigured on the local stack** (`QDRANT_URL must use HTTPS when QDRANT_API_KEY is
   set`), so local vector search is unhealthy. Production is fine. Not Forge's to fix; recorded because
   it was measured.
