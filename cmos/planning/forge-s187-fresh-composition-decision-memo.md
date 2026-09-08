# Forge Sprint 187 — Fresh Composition Coverage

**Status:** LOCKED 2026-09-06. Derek approved the scope (#1787), retained the 109 obligations (#1788), and authorized mission creation and build handoff. Detailed lock: #1789, session `PS-2026-09-06-007`.

**Build worktree:** `/Users/systemsystems/.codex/worktrees/s187/OODS-Forge`

**Branch:** `codex/sprint-187-fresh-composition`

**Canonical CMOS projectRoot:** `/Users/systemsystems/portfolio/Design-Tools/OODS-Forge`

**Source base:** `21c7c31906fbb81d049b943155c64ed78409fb9f`, merged PR #83 on `origin/OODS-pro`. The reviewed s186 source matches this base. Review-only commit `87a7933b` was cherry-picked as `0d87824a` before this planning commit; it carries the determination and retained receipts, not implementation changes.

## Outcome and evidence boundaries

Make the existing public object composer generate supported React and Vue output across **all 11 advertised objects and six public contexts**. Add the fourteen already-rendered HTML families below to the governed root, repair the measured binding defects, and bring discovery in line with the delivered surfaces.

The exit gates are **66/66 freshly composed schemas, 132/132 generation cells at `profile=build`, and every applicable packed-consumer gate for the 14 named paths below in both frameworks (28 cells)**. Root membership grows from 50 to 64 distinct components. Keep the 109-row obligation ledger intact. Neither 66 generation passes nor 28 runtime cells proves a complete connected application, all 66 runtime paths, or full catalog maturity.

The planning census at `87a7933b` measured 27/66 schemas green in both frameworks and 58/132 green cells. Fourteen missing families block 30 schemas; nine more schemas expose binding defects without missing families. Readiness can mask additional contract defects: measure again after each cluster, fix genuine producer/lowering defects within this outcome, and record scope changes before adding unrelated families. Do not prune inputs, drop meaningful bindings, weaken validation, or turn default composition into a special test-only override.

Inputs are every object returned by `object.list({})`: Article, Invoice, Media, Organization, Plan, Product, Relationship, Subscription, Transaction, Usage, User; each with `detail`, `list`, `form`, `timeline`, `card`, `inline`. Use exactly `{object, context}` for `design.compose`; pass its schema unmodified to `code.generate`. Preserve population membership and report additions instead of replacing one object/context with another to keep a count green.

## Mission order and runtime cohort

Run serially: **m01 → m02 → m03 → m04 → m05 → m06**. CMOS `Requires` edges record this order; the builder must honor them. The machine-readable input list is [runtime-cohort.json](forge-s187-planning-probe/runtime-cohort.json); planning verified that its component groups cover exactly the fourteen missing IDs.

| Mission | Change | Fresh packed-consumer paths, each React + Vue |
|---|---|---|
| s187-m01 | Repair composition bindings and admit fresh inputs to the existing consumer harness | User/detail, Product/detail, Usage/list, Subscription/inline, Transaction/timeline |
| s187-m02 | LabelCell, InlineLabel, FormLabelGroup, ClassificationBadge, ClassificationEditor | Product/list, Product/form, Product/inline |
| s187-m03 | OwnerBadge, OwnershipSummary, OwnershipMeta, TagSummary | Organization/list, Organization/detail, Organization/card |
| s187-m04 | ArchiveSummary, ArchivePill, CancellationForm, CancellationBadge, PriceCardMeta | Subscription/detail, Subscription/form, Subscription/card |
| s187-m05 | Refresh discovery, disposition eleven disputed census rows, review aliases, prepare delivery | Discovery contracts and isolated delivery checks; no extra runtime cohort |
| s187-m06 | Final full census, combined runtime cohort, evidence accounting and review handoff | All fourteen paths again at the final implementation head |

### m01 — Make existing component bindings truthful

Retain the starting failures. Repair all three measured issue groups:

- `StatusTimeline.label`: Article/detail, Media/detail, Product/detail and User/detail reject the unsupported prop in both frameworks.
- Numeric fields wired to string-only `Select.value`: Plan/inline (`amount_minor`), Subscription/inline (`amount`), Usage/list and Usage/inline (`consumed_quantity`) fail Vue generation. Choose valid UI semantics and conversion at the appropriate producer/lowering boundary; preserve meaningful displayed values and updates.
- Boolean `cancel_at_period_end` wired to Text content: Transaction/timeline fails both frameworks. Render a meaningful representation that respects the component contract.

Test the intended behavior on real typed data, including false and zero, not just removal of the error. All nine affected schemas must generate in both frameworks; the five selected consumer paths must render the repaired values and exercise any claimed update. Remeasure the exact legacy Product/detail B2 operand from #1758 as well as fresh Product/detail; report the operand and outcome separately. The original saved User-form corpus is not rewritten.

The existing `s185-m04-live-consumers.ts` CLI restricts `--schemas` to saved-schema names and its underlying s184 runner loads a store. **It cannot currently execute this fresh cohort.** Add a bounded fresh-composition input option to that existing pipeline, with provenance for object/context, composed schema, generated artifact, source head, and exact tarballs. Preserve legacy saved-store operation. Never generate a fixture by hand and call it fresh composition. Record the actual new invocation in mission evidence; this memo does not invent an already-working CLI flag.

### m02–m04 — Port the fourteen measured families

Use the s185/s186 pattern, reading current exports, callers, HTML renderers, contracts and shared helpers first. The HTML authority is `packages/mcp-server/src/render/component-map.ts`. Per family:

1. Add its real contract, shared scenario and root ID in component-contracts; keep a single governed union.
2. Derive directive lowering from consumed HTML keys in `binding-utils.ts`; update prop-value contracts and cross-target directive extensions in `target-contracts.ts`. A consumed-but-unimplemented directive is disclosed; it does not become an invented runtime prop.
3. Implement idiomatic React and Vue runtime exports and shared token styles across the existing two-brand × three-theme matrix. Preserve documented HTML semantics; a presentational form with no wired action is described as such, never credited as working editing or cancellation.
4. Extend existing contract/package/parity tests and resolve every required readiness reference. Cross-framework parity is a computed comparison. Style, accessibility and interaction claims require their own evidence.
5. Run that mission's fresh paths through the existing eight consumer gates: exact-tarball fresh install, strict typecheck, production build, server render, mount, hydration, shared CSS resolution, interaction evidence. No source aliases or pre-existing consumer dependencies. Count N/A interactions separately with reasons; switching one Tabs control does not prove every newly ported field or action. Prove claimed family behavior with targeted component/runtime observations.
6. Retain a red delete-export bite for each new component in each framework, then restore and verify positive. Across the sprint this is 28 discriminating bites; reuse `s185-m03-export-mutations.mjs` and the existing breadth spec family.

Each mission runs relevant package typechecks/tests and affected product-reality checks, plus its live cells. Keep evidence under `artifacts/product-reality/sprint-187/mNN/`. No per-mission four-suite capture. Commit at coherent mission boundaries and record the commands, failures, outcomes and CMOS decisions.

### m05 — Discovery, retained census scope, and delivery preparation

**Discovery (#1371).** Refresh structured data using the existing local-source refresh path in `docs/mcp/Structured-Data-Refresh.md`. Verify generated membership, counts and timestamps against current Forge sources; avoid silently substituting the historical Foundry checkout. Make catalog status meaning surface-specific so an HTML mapping cannot imply React/Vue availability, accessibility or interaction maturity. Read current API consumers and use the smallest compatible contract change; update generated schemas/docs and both policy layers only if the exposed tool contract/registration actually changes. Verify actual catalog responses for a governed family and an unavailable family, including an explicit unavailable/negative case. Capture public contract changes in the final advertised diff.

**Census (#1788; resolves the choice in #1331).** Retain all 109 obligations. The historical 98-runtime proposal classified missing HTML/React implementations as `authoring-only`; absence of code is insufficient evidence of absent runtime intent. Review these eleven rows individually: ArchivedRowOverlay, AuditSummaryCard, BillingAmountInput, BillingCardMeta, BillingIntervalSelector, BillingSummaryBadge, CycleProgressCard, PaymentEventTimeline, PaymentTimeline, SortIndicator, TimelineEntryLabel.

Deliver a compact row-by-row disposition with trait/caller evidence, current runtime state, proposed implementation/explicit alias-or-merge/actual authoring-only/deliberate retirement, rationale and remaining work. Keep unimplemented runtime obligations visibly owed. This is not eleven extra implementations. Do not set `approvedRuntimeCensus=98`, shrink membership, or overwrite frozen s182 evidence. Keep that legacy approval field null while the old split is unapproved; make the accepted retain-109 decision clear in live discovery/docs rather than leaving a misleading claim that Derek still owes the old choice. A proposed exclusion remains proposed until supported by an explicit product decision. Surface-cell evidence updates do not change the denominator (#1726).

**Aliases (#1382/#1385).** Inspect current known consumers of `/ported`, `/readiness-ported`, `/css-ported`. Record whether the retirement trigger is met. Preserve aliases when adoption cannot be established; elapsed one-sprint notice alone is not proof that consumers have migrated. This is a review, not a second root-fold project.

**Delivery (#1374/#1379/#1384).** Prepare the exact integration/build/restart/health-and-identity sequence for the separately served checkout and retain a read-only observation of what is currently served. Validate the candidate bridge in isolation on a different port and distinguish source commit from a generic healthy response. Prepare authentic User-form version-2 adoption with original/successor hashes, target identity, backup and rollback, and rehearse against a disposable store. An isolated green store does not mean a served store was migrated. Keep deployment/adoption carries open until actual delivery is verified. No PM2 restart, shared-store overwrite, public publish or outbound reconnect message is part of this planning/build handoff; prepare the concrete change and notice for the separately authorized delivery action already named in #1382.

### m06 — One final proof and an honest handoff

- At the final coherent implementation head, rebuild packages and run the entire public object/context population. Require all 66 schemas and 132 generation cells green. Run all fourteen selected paths through the packed-consumer cohort using those built artifacts. Retain exact commands, provenance and separately counted skipped/N/A gates.
- Rerun saved-corpus compatibility with clearly identified stores: the original historical corpus baseline is 15/16; the authentic recomposed successor baseline is 16/16 (32 cells). Preserve the historical negative. If a real contract repair changes original reachability, report the measured delta with unchanged input hashes rather than falsifying a fixed expected result.
- Verify 64 unique governed root IDs, the fourteen families' readiness references and 28 export bites. Apply only evidence-supported capability surface updates to all affected rows; preserve all 109 IDs and the separate scope ruling. Do not promote `unverified` accessibility/theme/interaction surfaces from generation alone.
- Compute one sprint-wide advertised-surface diff from `21c7c319` to the final implementation head with `s185-sprint-wide-movers.mjs`. Account for components, composer/lowering, discovery and compatibility behavior. Prepare one combined reconnect record with exact artifact/source identities and the separately pending deployment line.
- Capture the four existing suites once at a clean frozen head using `capture-s185-m01-baseline.mjs --sprint sprint-187 --mission s187-m06 --label closeout --runs 1`. Compare with s186 closeout execution `740e8405`: viz 1,390 passed; render 64 passed; server 5,740 passed + 16 existing skips; root 6,049 passed + the same 16 skips; zero failures. Attribute deltas using `s185-suite-accounting.mjs`; retain any failed attempt under its original identity.
- Reuse `s185-baseline-surfaces.mjs`, `s185-reconnect.mjs`, `s185-closeout.mjs`, `s185-audit-closeout.mjs` and existing spec families with narrow, stated s187 parameter/criterion adaptations. Their s186-specific literals are not an assertion that they work unchanged. Do not add another closeout framework.
- Produce the claim ledger and independent review handoff with `builderSelfCertified:false`. Complete missions based on evidence; leave Sprint 187 Active. A separate review session determines certification and closes the sprint. Update near.md with measured outcomes, never future targets presented as achieved.

## Carries and limits

The complete greenfield workflow remains partial from s184. Current visualization public-render closure (#1372), visualization breadth beyond the current thirteen, Parts Town work, unverified maturity surfaces (#1375 and s186 equivalents), public publication and surface adapters remain outside this build. Maintenance #1315 and #1318–#1322 stays named, unabsorbed, and owed before integrated public release. The aggregate carries #1333/#1376 are historical lists, not evidence their items were completed. PR #83's pending coverage/viz-determinism checks succeeded; #1386 is resolved, and the ECharts soak skip remains disclosed.

No silent cuts. If the declared outcome cannot be reached, record the failing operands, completed subset and exact carry; do not relabel a partial result as 66/66 or call the sprint certified. Prefer implementation progress and existing proof machinery over extra ceremony.

## Fresh-session entry

Use [forge-s187-build-handoff.md](forge-s187-build-handoff.md), then this memo and the [probe instructions](forge-s187-planning-probe/README.md). The canonical CMOS database is in the primary checkout; the primary source tree is old and dirty and is not the build tree. Do not copy its database into this worktree or reset its unrelated changes. Start `s187-m01`, not a new planning exercise. Public PRs target `OODS-pro`, not the historical `main` branch.
