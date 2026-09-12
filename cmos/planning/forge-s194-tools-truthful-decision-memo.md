# Sprint 194 — Tools truthful: every advertised tool does what it says, or its claim is narrowed or retired — LOCKED

**Status:** LOCKED 2026-09-11 (planning session `PS-2026-09-11-004`). Increment 13 of the Product
Reality Program; milestone M3 of the phase map
[forge-remaining-work-phase-map-2026-09.md](forge-remaining-work-phase-map-2026-09.md) (decision
`#1893`). Base `1f69c957` (OODS-pro, the Sprint 193 merge of PR #98) with the Sprint 193 review closure
`92862a08` (PR #99, docs-only) merged in at planning. Branch `codex/sprint-194-tools-truthful`, worktree
`~/.codex/worktrees/s194/OODS-Forge`.
**Direction (Derek, 2026-09-11, after the Sprint 193 review):** proceed with the direction established
in the plan; address the CI budget as needed. Sprint 193 certified by `#1914`; its craft carries are
`#1915` and are not this sprint's work.

## 1. What this sprint is for, in one sentence

Every tool Forge advertises is proven to do what its description says at the MCP boundary and from the
portable bundle, or its description is narrowed to what it does, or it is retired with a record; the
brand seam runs end to end for the first time.

## 2. Measured base (`1f69c957`)

The Sprint 193 tool ledger (`packages/mcp-server/registry/tool-capability-ledger.v1.json`, head
`2030b4c9`) and a read-only probe at planning give this picture. "Advertised" means the `auto` list in
`packages/mcp-server/src/tools/registry.json` (21 entries); the 6 `onDemand` entries are registered but
not advertised.

| Surface | Measured | Source |
|---|---|---|
| Tiers | auto 7 product-reality / 11 contract / 3 unit / 0 none; on-demand 0/1/1/4 | ledger `summary` |
| Portable E2E | calls exactly 8 times over 4 tools: `health`, `dashboard_render` ×4, `viz_render`, `artifact_certify` ×2; `callCount` asserted 8; bundle = 12 packages, `mcp-bridge` not included | `scripts/runtime/e2e.mjs:547-628`, `manifest.mjs:18-31` |
| brand.apply | `apply:true` writes `tokens.<brand>.<theme>.json`, `specimens.json`, `variables.css` under `artifacts/<date>/review-kit/brand.apply/<ts>/` (`:604-624`), never the canonical source it labels in its own diff (`:338`); the "build" is `spawn('pnpm',['run','check:tokens'],{stdio:'ignore'})` resolving on any exit or spawn error (`:461-478`); `(no-op)` context lines at `:349` | `packages/mcp-server/src/tools/brand.apply.ts` |
| Canonical brand source | `packages/tokens/src/tokens/brands/{A,B}/{base,dark,hc}.json`; scopes in `packages/tokens/style-dictionary.config.cjs:69-103`; build `node packages/tokens/scripts/build.mjs` (`package.json:73`), check mode `:74`; brand.apply already reads this tree (`:41-43`) | tokens package |
| brand.intake | validate-only by design; `apply` must be literally `false` (`lib/dtcg-intake/index.ts:155-169`, `types.ts:41`); the `authorized-content-addressed-reference` operand always yields `unresolved-content-reference` (`index.ts:557-564`); no resolver exists anywhere; no output a downstream tool can consume | `brand.intake.ts` (24 lines) |
| tokens.build | copies `dist/css/tokens.css`, `dist/ts/tokens.ts`, `dist/tailwind/tokens.json` byte-identical regardless of `brand`/`theme` (`:112-153`); the six scopes exist in one CSS file and in `dist/css-variables-by-scope.json` | `tokens.build.ts` |
| fidelity.preview | `branded-mockup` uses a hard-coded hex table for `brand-a`/`brand-b` (`branded-mockup-emitter.ts:78-115`), silently falls back to `brand-a` (`:121-123`); the token-derived alternative `resolveTokenToColor(token,{brand,theme})` already serves dashboards and certification | `@oods/viz-core` `token-resolver.ts:26-38` |
| map | registry at `artifacts/structured-data/component-mappings.json` (`map.shared.ts:18-21`, env `MCP_MAPPINGS_PATH`); importers are the six map actions and `registry.snapshot` only; zero readers under `src/compose/` or `src/codegen/` | `map.shared.ts`, grep |
| registry.snapshot | v1.4.0 fields `disambiguation_decisions`, `preferred_terms`, `capabilities` surfaced only when present (`:34-45`); no handler reads them | `registry.snapshot.ts` |
| structuredData.fetch | kind mode rejects `listVersions`/`version` (`:353-359`) with `OODS-V201`, whose registry message is literally `map.apply input invalid` (`errors/registry.ts:301`) | `structuredData.fetch.ts` |
| review | `chain` accepts only the 9 fixtures allow-listed in `fidelity.preview.ts:55-65` (`review.chain.ts:91-135`, `OODS-RC-002`); `patch` is a decision label (`review-policy.ts:31`); `apply-summary-emitter` counts decisions; nothing produces or applies a patch | review family + 10 test files |
| viz.compose | registered in `registry.json:14`, `registry.ts:33`, `index.ts:114-117`, `policy.json:192`, bridge `config.ts:120`, adapter descriptions `:18`; SDK `client.ts:84`; 6 spec files, 11 doc files; no runtime consumer; not called by the E2E | grep |
| health | `theme = MCP_THEME ?? 'light'`, `brand = MCP_BRAND ?? 'A'` (`:133-134`, `:162`); never observed; `'light'` is not a built scope name (`base`) | `health.ts` |
| dashboard.render | `resolveMeasures` defaults false (`:98`), so `measureRef` is inert and `OODS-V137` never fires (`:162`, `:582`) | `dashboard.render.ts` |
| viz.render | ECharts-primary families return `spec: {}` and force `output.echarts:true` (`:761-771`) | `viz.render.ts` |
| repl | `brand`/`tokenOverlay`/`skinOverlay` reach only the document branch (`repl.render.ts:322-327`), fragments ignore them without a diagnostic (schema says so at `repl.render.input.json:40,96,101`); `validate.apply` accepted and ignored (`repl.input.json:278-281`); non-strict fragments reclassify `OODS-V006` (`:182-189`) | repl family |
| code.generate / pipeline | release profile counts caller evidence as provided on `status==='passed' && reference && artifactContentHash` (`validation-profile.ts:165-179`) and checks only hash equality (`:178`); `pipeline.ts:451` forwards it verbatim | validation-profile |
| design.preview | probes `127.0.0.1:4477/status`, else `OODS-N019` (`:12-20`); shells into `scripts/design-loop/cli.ts` (`:27`) | `design.preview.ts` |
| schema / map / repl `apply` | nine action schemas carry `apply` "accepted for bridge dry-run/apply mode parity; ignored by this action" (`schema.input.json:68,101,140,172`; `map.input.json:629,668,883,916`; `repl.input.json:280`) | schemas |
| Product-reality boundary pattern | validate the literal wire input with `getAjv().compile(inputSchema)`, then invoke `handle` on real repo state (`test/product-reality/theme.s191.spec.ts:2-13`); process-level bridge harness `test/helpers/bridge-harness.ts:184` | tests |
| Docs | `docs/api/*.md` generated 1:1 from the registry by `pnpm run docs:api` (`scripts/docs/generate-api-reference.ts`, guarded by `api-docs-generator.spec.ts`); `docs/mcp/Tool-Specs.md` hand-written, 22 tool sections with ungrouped names vs 27 entries; `how-forge-works.html:316` states the map claim | docs |
| CI | `coverage` job (30 min) = pretest build + `vitest --coverage` (~8.5 min) + `codegen-matrix.s182` (~1) + `packed-consumers.s182` (~2) + a 22-file historical group (~10); cancelled at cap on `8858a575` and `efd5eb29`; rerun passed in 23 min | `.github/workflows/ci.yml:697-748`, `package.json:41-42` |
| Delivery | bridge serves `c098237f`; Sprint 194 reconnect prepared unsent for cmos-dashboard, forge-demos, aquex-mcp | `sprint-193/m07/reconnect-plan.json` |

## 3. Missions (serial; exact criteria in CMOS)

| Mission | Outcome | Exit |
|---|---|---|
| m01 Deliver + reconnect + CI split | Primary checkout to `1f69c957` (or the #99 merge), rebuilt, pm2 restarted; health `productReality.runtime`/`tools` proven through the bridge; three prepared notices sent byte-identical; the coverage job split into `coverage` and `product-reality-consumers`, each 30 min, no test removed | ids recorded; both jobs green under 20 min on the branch |
| m02 Brand seam end to end | `brand.intake` emits a consumable delta + envelope hash; `brand.apply apply:true` writes the canonical brand source under an env-overridable root and runs the real token build with captured stdio and exit; `fidelity.preview` branded mockup derives colour from the built scopes; `tokens.build` brand/theme return the requested scope; pixels move in `viz_render`, the generated app shell and one component theme cell | receipt with source hashes before/after, build exit 0, three svgHash/CSS movements |
| m03 Registry and store family | `design.compose` resolves external vocabulary through the mapping registry with a typed unresolved diagnostic; `map.resolve` honours the v1.4.0 `preferred_terms`/`disambiguation_decisions` it round-trips; `structuredData.fetch` kind-mode limits are correctly labelled; `schema`/`object` proven at the boundary | mapping created → composed schema places the mapped trait; mapping deleted → typed diagnostic |
| m04 Retire and disposition | `viz.compose` retired everywhere (registry, bridge config, policy, adapter descriptions, schemas, SDK, docs) with a doc-retirement gate; `review` real (inline manifest, RFC 6902 patch output, contract spec) or retired with a record; the six on-demand entries each gain a contract spec or are retired | advertised count 20; zero on-demand entry at tier none |
| m05 Inert options and trusted claims | `health` reports built scopes and a labelled default; `dashboard.render` resolves `measureRef` by default with byte-identical output for specs without it; `viz.render` ECharts-primary output truthful (no `spec: {}`); `repl` fragments diagnose ignored brand/overlays; `design.preview` and the release-profile evidence described as documented limits | no advertised input option without behaviour, except bridge parity keys described as such |
| m06 Proof at the boundary and the E2E | a product-reality spec for every advertised tool; `e2e.mjs` calls every advertised tool from the extracted bundle with pinned fixtures and per-tool assertions; ledger re-derived: every advertised entry product-reality, `portableE2E:true`, caveats only `documented-limit`; `docs:api` regenerated, Tool-Specs and how-forge-works sentences corrected, pinned | `tool-truth` contract pins 20/20 and the caveat kinds |
| m07 Closeout | pre-freeze verifier pass, one five-suite capture (#1833), censuses, advertised diff from `1f69c957`, reconnect prepared, near.md Increment 13 BUILT/REVIEW PENDING, PR, handoff | `builderSelfCertified:false` |

## 4. Settled decisions the builder does not reopen

1. **Advertised means the registry `auto` list.** Every advertised tool ends the sprint at
   product-reality tier with `portableE2E:true`, or is retired. On-demand entries are not advertised;
   each ends at contract tier or is retired with a record.
2. **An option that does nothing does not exist after this sprint.** Every input property either has
   observable behaviour proven by a spec, or is removed from the input schema, or is a bridge
   dry-run/apply parity key whose description says it is ignored by that action. A silent fallback
   (unknown brand → `brand-a`) is a defect, not a limit.
3. **Retire means gone.** A retired tool leaves `registry.json`, `registry.ts`, `index.ts`,
   `policy.json`, the bridge `config.ts`, `tool-descriptions.json`, its schemas, the SDK client, and
   every doc page; a retirement-gate spec pins absence; the reconnect names it; the retained handler
   file may stay only as an unregistered module with a header naming the decision.
4. **Writes go to canonical source, never caller paths.** `brand.apply` writes
   `packages/tokens/src/tokens/brands/<brand>/<theme>.json` under a root taken from the repo or an env
   override (`MCP_BRAND_SOURCE_ROOT`, the `MCP_MAPPINGS_PATH` precedent); no tool accepts a
   caller-supplied filesystem path (security policy unchanged).
5. **Builds are real.** Any subprocess a tool reports as a build or check is spawned with captured
   stdout/stderr and its exit code; non-zero is a tool error carrying the tail; duration is never
   evidence.
6. **Narrowing is a description change pinned by a test.** A narrowed claim changes
   `tool-descriptions.json` and the input-schema description in the same commit, is regenerated into
   `docs/api`, and is pinned by the narrative/link contract tests; the ledger records the caveat as
   `documented-limit`.
7. **Tier is derived, not declared** (#1906): literal handler imports in `test/product-reality/`
   promote a tool; README mentions do not.
8. **Verifiers pin the recorded head** (learning #565); **a pre-freeze verifier pass precedes the
   freeze** (learning #574).
9. **Pace rule.** No per-mission captures, no critic, no new closeout apparatus. One five-suite
   capture at close under #1833 (two permitted; a third needs a decision).

## 5. Sequence and why

m01 first because the bridge is a sprint behind and the CI cap will hit the first push of this branch.
m02 before m03–m05 because the brand seam is the largest source change and the one Derek's criterion
names first. m04 (retirement) before m06 so the E2E and ledger are computed over the final advertised
set once. m06 last before closeout so every spec and E2E call sees final descriptions.

## 6. Descope ladder and never-cut

Ladder, in order: (a) m02's component-cell pixel proof carries (chart and app shell never carry);
(b) m03 narrows the `map` claim to "records mappings for external consumers" with the composer seam
carried, the narrowed description pinned; (c) m04 retires `review` instead of making it real;
(d) m04 retires any on-demand entry instead of writing its spec; (e) m05 removes an option instead of
wiring it; (f) m06's E2E runs write-capable tools in dry-run against the bundle when the extracted
bundle has no writable root, and says so. Never cut: m01's delivery, sends and CI split; `viz.compose`
retirement; `brand.apply` writing source with a real build exit; the E2E calling every advertised tool;
one capture; zero hand-edited schemas; no caller-supplied paths.

## 7. Exit

- Ledger: every advertised entry product-reality tier, `portableE2E:true`, caveats only
  `documented-limit`; advertised count 20; on-demand entries contract tier or retired.
- `e2e.mjs` from the extracted bundle calls every advertised tool with an assertion.
- Brand-seam receipt: intake → apply wrote source (hashes before/after) → build exit 0 with captured
  output → `viz_render` svgHash moved, generated shell CSS moved, one component cell moved.
- One green five-suite capture; advertised diff attributed; reconnect prepared; near.md Increment 13
  BUILT, REVIEW PENDING; closed only by the independent review.

## 8. Build notes

Worktree prepared during planning: `pnpm install --frozen-lockfile`, `build:tokens`, `build:packages`
exit 0 at `cb9e5bee` (merge of `92862a08` into `1f69c957`); `.env` symlinked to the primary checkout.
Node v24.6.0, pnpm 9.12.2. `@oods/viz-render test` rebuilds its own dist (learning #546): never in
parallel with suites that consume it. Packed browser cells need the pinned Linux Playwright image
(learnings #548, #557). Reuse `s193-tool-truth.mjs`, `s185-reachability.mjs`, `s190-viz-census.ts`,
`s185-sprint-wide-movers.mjs`, `s185-closeout.mjs`, `s185-audit-closeout.mjs`, `s185-reconnect.mjs`
with bounded s194 modes. The `tool-truth.s193.spec.ts` pins (21 auto, `portableE2E: 4`, the four E2E
tool names) move in the mission that changes the fact, with the reason, before any capture.
