# Sprint 194 build handoff

Sprint 194 is locked and ready. CMOS has seven serial missions: `s194-m01` is Current, `s194-m02`–`s194-m07` are Queued with a Requires chain. No mission has started. Direction: Derek, 2026-09-11, after the Sprint 193 review ("proceed with the direction established in our plan and let's address the CI budget as needed"). Lock: planning session `PS-2026-09-11-004`; phase map decision `#1893`; Sprint 193 certification `#1914`.

**Build directory:** `/Users/systemsystems/.codex/worktrees/s194/OODS-Forge`

**Branch:** `codex/sprint-194-tools-truthful` from `1f69c957` (`OODS-pro`, the Sprint 193 merge of PR #98) with the review closure `92862a08` (PR #99, docs-only) merged in at planning → `cb9e5bee`

**Canonical CMOS projectRoot:** `/Users/systemsystems/portfolio/Design-Tools/OODS-Forge`

The primary checkout is the served bridge checkout (PM2 `/health.revision` = `c098237f`, the Sprint 192 head) and the CMOS database location. **Only `s194-m01` touches it**, to deliver the reviewed Sprint 193 head and send the three prepared notices; every other mission stays in the worktree.

## Prompt for the fresh build session

```text
Build the locked Sprint 194 plan in /Users/systemsystems/.codex/worktrees/s194/OODS-Forge,
branch codex/sprint-194-tools-truthful. Read agents.md, the locked
cmos/planning/forge-s194-tools-truthful-decision-memo.md and the phase map
cmos/planning/forge-remaining-work-phase-map-2026-09.md, then execute the seven CMOS
missions serially from s194-m01 through s194-m07. Always pass
projectRoot="/Users/systemsystems/portfolio/Design-Tools/OODS-Forge" to CMOS tools.

Open with cmos_review, cmos_sprint(action="show", sprintId="sprint-194") and
cmos_decisions(action="list", sprintId="sprint-194"). Confirm the prepared branch and clean
worktree (if origin/OODS-pro has moved because PR #99 merged, merge it into the branch first and
record the head; it moves no runtime bytes), start a build-tracking session, then start s194-m01.
Do not re-plan the accepted slate. Never print process environment values or .env contents. Never
send a CMOS message except the three prepared notices that s194-m01 sends exactly as prepared.

s194-m01 delivery + CI: from the PRIMARY checkout fast-forward to origin/OODS-pro, frozen install,
build:tokens, build:packages, bridge build, pkg:build, pm2 restart oods-forge-bridge + save; prove
/health.revision, 21 tools, productReality.runtime 154/154 at 871e5acf and productReality.tools 27,
17 store hashes, the structured-data manifest hash before/after, catalog_list 109/109 through the
bridge, a dark viz_render hash and a dark code_generate shell; send the prepared reconnect
(cmos-dashboard, forge-demos, aquex-mcp) from artifacts/product-reality/sprint-193/m07/reconnect-plan.json
byte-identical and record the message ids. In the WORKTREE split the CI coverage job into
'coverage' (root vitest --coverage) and 'product-reality-consumers' (the three mcp-server groups),
each timeout-minutes 30, no test removed or weakened, test:coverage locally unchanged in effect;
push and record the first run with both jobs green. Receipts under artifacts/product-reality/sprint-194/m01/.

s194-m02 brand seam: brand.intake emits envelopeHash + a delta brand.apply accepts; brand.apply
apply:true writes packages/tokens/src/tokens/brands/<brand>/<theme>.json under BRAND_ROOT or
MCP_BRAND_SOURCE_ROOT (never a caller path) with sha256 before/after, then runs the real token build
with captured stdio and exit (non-zero = typed error with the tail); tokens.build brand/theme return
the requested scope; fidelity.preview branded-mockup colours come from the built scopes via
resolveTokenToColor with brand ids A/B and the hex table is deleted; a boundary spec on a temp copy
of packages/tokens proves three pixel movements after apply (viz_render B/dark svgHash, code_generate
B/dark shell tokens, one component B/dark theme cell — the last may carry with reason).

s194-m03 registry and store family: design.compose resolves external terms through the mapping
registry (map.shared, honouring preferred_terms/disambiguation_decisions) with a typed OODS-N
diagnostic for unresolved terms; map.resolve consumes the v1.4.0 fields (or registry.snapshot is
narrowed and pinned); structuredData.fetch kind-mode limits are correctly labelled (OODS-V201 no
longer says 'map.apply input invalid' for this path); product-reality specs for schema and object;
the map boundary spec runs under a temporary MCP_MAPPINGS_PATH and leaves the repo registry
byte-identical; fresh composition census 77/77 with movement by class.

s194-m04 retire and disposition: viz.compose removed from registry.json (21 → 20), registry.ts,
index.ts, policy.json, bridge config.ts, tool-descriptions.json, schemas, generated.ts, public-types,
the SDK, and every doc (docs:api regenerated), with the doc-retirement gate pinning absence and the
tool-truth pins moved with reasons; review gains an inline manifest, RFC 6902 patch output
(patch + patchedManifest from chain), a contract spec and a product-reality spec — or is retired with
a record; each of the six on-demand entries gets a dry-run contract spec on real repo state or is
retired with a record (no test creates a git tag).

s194-m05 inert options: health.tokens reports built scopes from css-variables-by-scope.json plus a
labelled defaultScope; dashboard.render resolves measureRef by default (V137 on a bad ref) with the
four portable dashboards byte-identical; viz.render ECharts-primary output drops spec: {} with the
schema and description updated and svgHash rows unchanged; repl.render fragments diagnose or carry
ignored brand/overlays; release-profile receipts say evidenceVerification
'hash-bound-not-re-executed' with descriptions and V162/V163 messages matching; design.preview
described as requiring the local design loop with the typed N019 asserted; an input-property sweep
receipt proves zero unread advertised input properties except described bridge parity keys.

s194-m06 proof and E2E: a product-reality spec (getAjv-validated wire input, real handler, no mocks)
for every advertised tool below product-reality tier; scripts/runtime/e2e.mjs calls every advertised
tool from the extracted bundle with content-pinned fixtures and per-tool assertions (write-capable
tools against the bundle's own writable root or apply:false with the receipt saying so); the ledger
re-derived — every advertised entry product-reality, portableE2E true, caveats only documented-limit;
on-demand contract tier or retired — served by health and pinned; docs/api regenerated, Tool-Specs
sections one per grouped registry entry, how-forge-works and portable-runtime tool sentences rewritten
from the ledger, all pinned.

s194-m07 proof and handoff: pre-freeze verifier pass (learning #574), then the implementation freeze,
ledgers regenerated, censuses (composition 77/77 + 154/154 by class, viz registry 13/13, saved
stores), one FIVE-suite capture under #1833, advertised diff from 1f69c957 with every changed
description/schema/doc attributed, reconnect prepared naming the retired tool and narrowed
descriptions, near.md Increment 13 at BUILT, REVIEW PENDING, a PR to OODS-pro with CI observed, and
the review handoff with builderSelfCertified:false. Verifiers pin the recorded implementation head
and compare the product-path diff, never git rev-parse HEAD equality (learning #565).

Every golden or pinned count that moves is replaced in the mission that moves it, with the reason,
before any capture. Never widen a claim: a narrowed description is pinned by a test in the same
commit; a retired tool is gone everywhere; an option that does nothing does not survive; no tool
accepts a caller-supplied path; every build a tool reports is spawned with captured output and exit.
Never hand-edit a composed or saved schema. Ship first, verify with the suites the change touches,
one full capture at close. Record tests, failures, decisions, actual counts and commit identities in
CMOS. Stop with a complete independent-review handoff; leave Sprint 194 Active and
builderSelfCertified:false.
```

`build-tracking session` means `cmos_session(action="start", type="custom", title="Sprint 194 Build", sprintId="sprint-194", projectRoot=...)`. Use the mission lifecycle tool to start and complete each mission after inspecting its criteria.

## Prepared and checked

- Worktree created from `origin/OODS-pro` at `1f69c957` with `92862a08` merged (`cb9e5bee`); `pnpm install --frozen-lockfile`, `pnpm run build:tokens` and `pnpm run build:packages` succeeded (exit 0); `git status --porcelain` empty before the planning commit. The primary `.env` is reachable through the ignored `.env` symlink; the canonical CMOS database stays in the primary checkout.
- Node `v24.6.0`, pnpm `9.12.2`. Build order that works: `build:tokens`, then `build:packages`, then `@oods/mcp-bridge` and `pkg:build` when a bridge is needed. `@oods/viz-render test` rebuilds its own dist (learning #546): never in parallel with suites that consume it. Packed browser cells need the pinned Linux Playwright image (learnings #548, #557).
- Where the measured facts live: memo section 2, with file:line anchors for every seam. Key ones: `packages/mcp-server/registry/tool-capability-ledger.v1.json` (27 rows, caveats), `packages/mcp-server/src/tools/brand.apply.ts:461-478,604-624`, `packages/tokens/style-dictionary.config.cjs:69-103`, `packages/mcp-server/src/tools/map.shared.ts:18-21,106-134`, `packages/mcp-server/src/tools/review.chain.ts:91-135`, the viz.compose registration set (`registry.json:14`, `registry.ts:33`, `index.ts:114-117`, `policy.json:192`, bridge `config.ts:120`, adapter descriptions `:18`, SDK `client.ts:84`), `scripts/runtime/e2e.mjs:25-47,526-628`, `scripts/runtime/manifest.mjs:18-31`, `scripts/docs/generate-api-reference.ts`, `.github/workflows/ci.yml:697-748`, `package.json:41-42`.
- Closeout tooling to reuse with bounded s194 modes: `s193-tool-truth.mjs`, `s185-reachability.mjs`, `s190-viz-census.ts`, `s185-sprint-wide-movers.mjs`, `s185-closeout.mjs`, `s185-audit-closeout.mjs`, `s185-reconnect.mjs`.
- Settled decisions the builder does not reopen are memo section 4; the descope ladder and never-cut list are section 6. Mission order (deliver + CI → brand seam → registry family → retire/disposition → inert options → proof + E2E → closeout) is deliberate: the CI cap is fixed before the first heavy push, the largest source change lands first, retirement precedes the E2E and ledger so they are computed over the final advertised set once, and every spec sees final descriptions.
