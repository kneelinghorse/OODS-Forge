# Forge Closeout Checklist

**Status:** Active — canonical closeout carrier
**Canonical since:** Sprint 177
**Workflow source:** [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
**Rule source:** [`standing-rules.md`](standing-rules.md)
**Quality-bar source:** [`quality-bars.md`](quality-bars.md)

This file is the source from which planners seed a sprint's closeout
`successCriteria` and from which the closeout mission generates its gate table.
It prevents a gate from disappearing merely because a later memo forgot it.
The workflow remains the source of truth for CI; this carrier must move in the
same change whenever a CI job or gate-bearing command changes.

## Generation protocol

1. **At sprint lock, the planner** copies the success-criteria source block into
   the closeout mission with `cmos_mission(action="add", successCriteria=[...])`
   or `cmos_mission(action="update", fields={successCriteria:[...]})`. For later
   sprints, replace the explicitly sprint-specific clauses while retaining every
   standing criterion.
2. **At closeout, the build agent** extracts the two canonical row blocks into a
   working buffer and byte-compares that buffer with this file before
   substitution. It stores each source-block SHA-256 in the closeout record,
   then instantiates every token in the result rows; the committed record
   contains no template tokens. Observed output never replaces a source row.
3. Replace every `{TOKEN}` in the execution record with its observed literal
   value before running it. An unresolved token, omitted environment variable,
   prose shorthand, or copied CI result is not execution evidence.
4. Name the measured tree before the first gate: record the base SHA, HEAD SHA,
   and whether the operand is the committed HEAD or a specifically described
   working tree (SR-20). Run commands, then paste their output (SR-19, SR-25).
5. Run heavy suites sequentially (SR-26). Record every skip and non-zero exit;
   neither can be summarized as “green.” Reconcile generated-file and tracked
   report movement under SR-18 before closing.
6. **At review, a separate agent** re-extracts the source blocks, compares their
   SHA-256 values and stable row IDs with the closeout record, asserts that the
   record contains no unresolved tokens, re-runs the instantiated commands at
   the review HEAD, and compares the closeout mission's stored
   `successCriteria` with its source block.

A same-tree execution may be cited by multiple result rows only when its working
directory, environment, expanded executable, and arguments are identical. Give
that execution one evidence ID and list every alias. Protocol rows such as L-07
never cause a duplicate heavy-suite run.

Allowed generation tokens are `{BASE_SHA}`, `{HEAD_SHA}`, `{PR_LABELS_CSV}`,
`{SPRINT_ID}`, `{DECLARED_REHASH_PATHS}`, `{AQUEX_ADDRESS}`, and
`{ADVERTISED_MOVERS}`. The generated record must contain none of them.

## CI job coverage — canonical source rows

There are 15 YAML job keys. A matrix expansion is still one job key. “Local
twin” names a runnable operand; “CI-only orchestration” covers GitHub labels,
artifact upload, and PR comments rather than a different correctness gate.
`vr-test` alone is structurally non-local because Chromatic is SaaS-backed,
secret-gated, and `continue-on-error`.

<!-- closeout-ci-rows:start -->
| ID | `ci.yml` job | Disposition | Generated local invocation / required evidence |
|---|---|---|---|
| CI-01 | `build` | local twin | `pnpm install --frozen-lockfile`<br>`pnpm run build:tokens`<br>`pnpm run build:packages`<br>`pnpm --filter @oods/schemas-tools run generate:check`<br>`pnpm run generate:schema-types -- --check`<br>`pnpm -w run docs:api -- --check`<br>`pnpm run build` |
| CI-02 | `lint` | local twin | `pnpm run lint`<br>`pnpm run lint:enum-convergence`<br>`pnpm run lint:enum-to-token`<br>`pnpm run lint:audit-log`<br>`pnpm run lint:brand-bleed`<br>`pnpm run lint:tokens` |
| CI-03 | `typecheck` | local twin | `pnpm exec tsc --noEmit`<br>`pnpm --filter @oods/tokens run build`<br>`pnpm --filter @oods/viz-core run typecheck`<br>`node scripts/quality/build-stories-ratchet.mjs` |
| CI-04 | `tenancy` | local twin | `pnpm tenancy:check` |
| CI-05 | `tokens-validate` | local twin | `pnpm run tokens:collision-guard`<br>`pnpm run tokens-validate` |
| CI-06 | `diagnostics-schema` | local twin | `node scripts/validate-diagnostics-schema.mjs` |
| CI-07 | `tokens-governance` | local twin + CI-only orchestration | `pnpm run build:tokens`<br>`pnpm run tokens:governance -- diff --brand A --base {BASE_SHA} --head {HEAD_SHA} --json artifacts/tokens/closeout-brand-a-report.json --comment artifacts/tokens/closeout-brand-a-comment.md --labels "{PR_LABELS_CSV}"`<br>`pnpm run tokens:governance -- diff --brand B --base {BASE_SHA} --head {HEAD_SHA} --json artifacts/tokens/closeout-brand-b-report.json --comment artifacts/tokens/closeout-brand-b-comment.md --labels "{PR_LABELS_CSV}"`<br>Record that live-label lookup, uploads, and PR comments are CI-only side effects. |
| CI-08 | `guardrails` | local twin + CI-only orchestration | `pnpm run build:tokens`<br>`PR_LABELS="{PR_LABELS_CSV}" TOKEN_GOV_BASE_REF={BASE_SHA} node scripts/state-assessment.mjs --guardrails --tokens`<br>Declare the resulting `diagnostics.json` disposition; label lookup and artifact upload are CI-only side effects. |
| CI-09 | `a11y-contract` | local twin + CI-only orchestration | `pnpm run build:tokens`<br>`pnpm --filter @oods/tw-variants run build`<br>`pnpm run build-storybook`<br>`pnpm exec playwright install chromium`<br>`pnpm run verify:brand-cascade`<br>`pnpm run a11y:diff`<br>`python3 -m http.server 6006 --bind 127.0.0.1 --directory storybook-static & VRT_SERVER_PID=$!; trap 'kill "$VRT_SERVER_PID" 2>/dev/null' EXIT; for attempt in $(seq 1 60); do if curl -sf http://127.0.0.1:6006/index.json >/dev/null; then break; fi; sleep 1; done; curl -sf http://127.0.0.1:6006/index.json >/dev/null; env STORYBOOK_EXTERNAL=1 STORYBOOK_URL=http://127.0.0.1:6006 pnpm run vrt:mobile; env STORYBOOK_EXTERNAL=1 STORYBOOK_URL=http://127.0.0.1:6006 pnpm run vrt:desktop; kill "$VRT_SERVER_PID"; trap - EXIT`<br>Cache and report upload are CI-only side effects. |
| CI-10 | `vr-test` | structurally non-local | Record the Chromatic run URL and whether `CHROMATIC_PROJECT_TOKEN` was present. A local Playwright run is not an exact substitute for `chromaui/action@v1`. |
| CI-11 | `coverage` | local twin | `pnpm run build:tokens`<br>`pnpm run test:coverage` (the pnpm lifecycle first runs `pretest:coverage`, which is `pnpm run build && pnpm run build:packages && pnpm run pkg:build`; `pkg:build` creates the public `dist/pkg` declarations the contract inspects)<br>`pnpm vitest run tests/contracts tests/viz` (standing narrow closeout scope) |
| CI-12 | `scale-determinism` | local twin | `pnpm run build:tokens`<br>`pnpm run build:packages`<br>`pnpm --filter @oods/mcp-server run test:scale` |
| CI-13 | `viz-determinism` | local twin | `pnpm run build:tokens`<br>`pnpm run build:packages`<br>`node -e 'console.log(JSON.stringify({node:process.version,v8:process.versions.v8,platform:process.platform,arch:process.arch}))'`<br>`pnpm --filter @oods/viz-core test`<br>`pnpm --filter @oods/viz-render test`<br>`pnpm --filter @oods/mcp-server exec vitest run src/tools/viz.render.test.ts src/tools/viz.render.fidelity.test.ts src/tools/viz.render.network-fidelity.test.ts src/tools/viz.render.geo-fidelity.test.ts src/tools/viz.render.intent.test.ts src/tools/dashboard.render.test.ts src/tools/dashboard.render.fidelity.test.ts src/tools/dashboard.render.faostat-e2e.test.ts src/tools/dashboard.render.strict-fields.test.ts src/tools/dashboard.render.kpi-types.test.ts src/tools/dashboard.render.measure-depth.test.ts src/tools/repl.render.skin-mapping.test.ts src/tools/repl.render.brand.test.ts src/tools/ci-golden-list.guard.test.ts`<br>`pnpm --filter @oods/mcp-server test`<br>`pnpm --filter @oods/mcp-bridge test` |
| CI-14 | `echarts-render-soak` | local twin; PK2 power floor PARKED until Linux-leg evidence: three of four quiet-host runs failed the one-sided 99% Student-t bound at `echarts-render-soak.s179.spec.ts:283` with `positiveTrendLower99 = +364.93/+1457.88/+4367.02 B/window` while every hard ceiling passed | `pnpm run build:tokens`<br>`pnpm run build:packages`<br>`node -e 'console.log(JSON.stringify({node:process.version,v8:process.versions.v8,platform:process.platform,arch:process.arch}))'`<br>`pnpm --filter @oods/mcp-server run test:echarts-soak` |
| CI-15 | `portable-runtime` | local twin; CI pins Node 24 and pnpm 9.12.2 | Run this row from a clean checkout or detached worktree at `{HEAD_SHA}`; record that operand when the main workspace carries attributed user changes.<br>`portable_lock_before=$(shasum -a 256 pnpm-lock.yaml)`<br>`pnpm install --frozen-lockfile`<br>`pnpm run build:tokens`<br>`pnpm run build:packages`<br>`pnpm --filter @oods/mcp-server run build`<br>`node --test packages/mcp-adapter/test-s181-lifecycle.js`<br>`portable_runtime_tmp=$(mktemp -d); portable_extract_dir=$(mktemp -d); trap 'rm -rf "$portable_runtime_tmp" "$portable_extract_dir"' EXIT`<br>`node scripts/runtime/assemble.mjs --out-dir "$portable_runtime_tmp/out-1" --work-dir "$portable_runtime_tmp/work-1" --final`<br>`node scripts/runtime/assemble.mjs --out-dir "$portable_runtime_tmp/out-2" --work-dir "$portable_runtime_tmp/work-2" --final`<br>`(cd "$portable_runtime_tmp/out-1" && shasum -a 256 -c forge-runtime.tar.gz.sha256)`<br>`(cd "$portable_runtime_tmp/out-2" && shasum -a 256 -c forge-runtime.tar.gz.sha256)`<br>`cmp "$portable_runtime_tmp/out-1/forge-runtime.tar.gz.sha256" "$portable_runtime_tmp/out-2/forge-runtime.tar.gz.sha256"`<br>`tar -xzf "$portable_runtime_tmp/out-1/forge-runtime.tar.gz" -C "$portable_extract_dir"`<br>`node scripts/runtime/e2e.mjs --extract-dir "$portable_extract_dir" --repo-root "$PWD"`<br>`test "$portable_lock_before" = "$(shasum -a 256 pnpm-lock.yaml)"` |
<!-- closeout-ci-rows:end -->

The three rows most often lost from handwritten tables are structural here:
CI-09 contains `verify:brand-cascade`, CI-12 contains `test:scale`, CI-14
contains the opt-in ECharts concurrency/resource soak, and CI-15 builds and
executes the portable runtime from an operating-system temporary directory.
CI-03 also records the root typecheck, viz-core typecheck, and build-stories
ratchet that the workflow genuinely runs.

## Standing closeout-only rows — canonical source rows

“CI does not run” is reserved here for closeout operands or ordering that CI
does not perform. In particular, the build-stories ratchet is **not** local-only:
current CI runs it inside `typecheck`. The Sprint 177 memo's bare “ratchet” is
therefore resolved as the suite-count reconciliation row L-01, not as a false
claim about `build-stories-ratchet.mjs`.

<!-- closeout-local-rows:start -->
| ID | Standing row | CI coverage | Generated local invocation / required evidence |
|---|---|---|---|
| L-01 | Suite-count reconciliation against a correctly labelled zero | CI does not run | `pnpm --filter @oods/viz-core exec vitest run`<br>`pnpm --filter @oods/mcp-server exec vitest run`<br>`pnpm exec vitest run --project core`<br>Paste file/test/skip/fail totals and reconcile every delta to its owning mission. |
| L-02 | Snapshot census | CI does not run | `find . -name '*.snap' -not -path './node_modules/*' -not -path './.git/*' -print`<br>`rg -n '^exports\[' --glob '*.snap'`<br>`git status --porcelain -- '*.snap'`<br>Record file and entry counts plus every declared mover. |
| L-03 | Re-hash after the final rebuild | CI does not run | `shasum -a 256 {DECLARED_REHASH_PATHS}`<br>The sprint declares the paths before execution; copied historical hashes are not evidence. |
| L-04 | `decisionCount >= 1` per non-descoped mission | CI does not run | `sqlite3 -header -column cmos/db/cmos.sqlite "SELECT m.id AS mission_id, COUNT(d.id) AS decision_count FROM missions m LEFT JOIN strategic_decisions d ON d.mission_id = m.id AND d.project_id = m.project_id WHERE m.sprint_id = '{SPRINT_ID}' AND m.project_id = 'forge' GROUP BY m.id ORDER BY m.id;"`<br>Every non-descoped work mission must report at least one decision; the closeout mission's own decision lands with its completion record. |
| L-05 | Bridge health at session open | CI does not run | `curl --fail --silent --show-error http://127.0.0.1:4466/health`<br>Require `status:ok` and `bridge:ready`; record the advertised tool count rather than assuming it. |
| L-06 | R-d after **any** advertised schema, description, registry, or policy movement | CI does not run | `git diff --name-only {BASE_SHA} {HEAD_SHA} -- packages/mcp-adapter/tool-descriptions.json packages/mcp-server/src/schemas packages/mcp-server/src/schemas/generated.ts packages/mcp-server/src/tools/registry.json configs/agent/policy.json packages/mcp-server/src/security/policy.json docs/api`<br>If output is non-empty: `pnpm --filter @oods/mcp-server run build && pnpm --filter @oods/mcp-bridge run build && pm2 restart oods-forge-bridge && curl --fail --silent --show-error http://127.0.0.1:4466/health`; then send `cmos_message(action="send", targetAddress="{AQUEX_ADDRESS}", type="info_push", summary="Forge advertised surface changed at {HEAD_SHA}; reconnect required", body="Reconnect to Forge and refresh schemas. Advertised movers: {ADVERTISED_MOVERS}.")`. If output is empty, record “NO R-d” with the empty command output. |
| L-07 | Sequential-only heavy-suite protocol | CI does not run | Run, never concurrently, in this order: `pnpm --filter @oods/viz-core exec vitest run` → `pnpm --filter @oods/mcp-server exec vitest run` → `pnpm exec vitest run --project core` → `pnpm --filter @oods/mcp-server run test:scale` → `pnpm --filter @oods/mcp-server run test:echarts-soak`. Re-run a timing-sensitive red in isolation before classification. |
| L-08 | Gitignored build-input survival — run last and again after governance | CI does not run | `for f in packages/tokens/dist/tailwind/tokens.json packages/tokens/dist/index.js packages/tokens/dist/index.cjs packages/viz-core/dist/index.js packages/mcp-server/dist/index.js storybook-static/index.json; do if test -s "$f"; then echo "present $f"; else echo "MISSING $f"; exit 1; fi; done; node -e "import('@oods/tokens').then(m=>console.log('tokens import OK', Object.keys(m).length))"`<br>Tracked-file porcelain cannot substitute for this row. |
| L-09 | Whole-sprint SR-22 scan and per-mission suite attribution | CI does not run | `git diff --unified=0 {BASE_SHA} -- .`<br>`while IFS= read -r file; do git diff --no-index --unified=0 -- /dev/null "$file"; diff_status=$?; if test "$diff_status" -gt 1; then exit "$diff_status"; fi; done < <(git ls-files --others --exclude-standard)`<br>Inspect every added line in the tracked sprint diff and every untracked sprint file. Classify each sprint- or mission-number reference as historical, `measuredAt`, a test label, a retained constraint, or an SR-22 violation; zero forward sprint-numbered promises may remain in shipped prose. Attribute every final suite-count delta to its owning mission; an unattributed delta is a red. |
<!-- closeout-local-rows:end -->

After every write-producing row, capture `git status --porcelain` and reconcile
the output against the declared mover set. The final record also states whether
all sprint deliverables are committed, whether the commit message names the
mission IDs, and whether the tree is clean at `session.complete`; authority over
the commit and Sprint-COMPLETE remains with Derek when the memo says so.

## Standing quality-bar criteria (a–i)

Every generated closeout mission retains these criteria, expressed directly or
through a gate-table criterion that names the corresponding rows:

- **(a–c)** all sprint deliverables are committed before session completion;
  the commit message lists the mission IDs it covers; the tree is clean at
  `session.complete`.
- **(d)** CI-12 `test:scale` is green at 100/500/1000.
- **(e)** CI-01 rebuilds the dists of every changed package; BUILD_STALE remains
  advisory and requires no `forceComplete` ceremony.
- **(f–g)** CI-01's frozen-lockfile install and CI-03's root typecheck exit 0.
- **(h)** CI-11's `pnpm vitest run tests/contracts tests/viz` exits 0.
- **(i)** CI-02's `pnpm run lint:enum-convergence` exits 0.

## `successCriteria` source block — Sprint 177 first instantiation

The eight entries below are byte-identical to the lock-seeded `s177-m07`
`successCriteria` array. For Sprint 178 onward, planners start here, preserve the
standing gate and process clauses, and replace Sprint 177-specific invariant,
mover, and ledger language with the new locked memo's literal terms.

<!-- cmos-success-criteria:start mission=s177-m07 -->
- Gate table generated from cmos/foundational-docs/closeout-checklist.md — one row per ci.yml job (15) plus every standing local row, each a LITERAL invocation with env vars, run at the named tree (post-commit HEAD or the tree named per standing rule A), results pasted not restated
- test:scale row present and green (4 files / 62 tests expected unless a scale spec moved, then reconciled) and verify:brand-cascade row present and green — the two historically-dropped rows are structural now
- Census against a correctly-labelled zero: every suite-count delta reconciled per mission; snapshot census + re-hash rows run; git status porcelain accounted for including diagnostics.json per its m02-recorded disposition
- The rebased s172 clause controls GREEN with an EMPTY declared-mover set (BASELINE_COMMIT '86d50ed', declarations null/[]) — the sprint's zero-advertised-movement invariant proven, not asserted; the ONLY declared behavioral mover is Fork-R's enumerated text-level pin list
- decisionCount >= 1 per mission verified by the sqlite query at closeout
- Ledger updated (arcs closed: CI/repo/closeout hygiene, CMOS hygiene; Forge-Demos residue row discharged; how-forge-works untracked-rows corrected) and the memo's §7-form closeout record written
- NO R-d reconnect expected; if any advertised byte moved, the closeout names the invariant as BROKEN rather than papering it
- Not self-certified: review is a separate session (rule 10); Sprint-COMPLETE and the commit boundary are Derek's
<!-- cmos-success-criteria:end -->

## Result record shape

Do not edit the copied source rows. Add one result row for every canonical ID:

| ID | Measured tree | Instantiated literal invocation | Exit / disposition | Pasted output or artifact |
|---|---|---|---|---|
| `CI-01` | `{HEAD_SHA}` plus the named tree state | replace every source token | pending | pending |

Repeat through `CI-15` and `L-01` through `L-09`. For CI-10 record the
structurally non-local Chromatic evidence instead of inventing a local command.
For a conditional or skipped row, paste the condition's observed output and the
reason; never silently omit the row.
