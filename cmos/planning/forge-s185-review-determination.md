# Forge Sprint 185 — Reviewer's Determination

**Review session:** `PS-2026-09-06-002` (independent reviewer)
**Reviewed:** implementation head `e2621b7a`, frozen execution head `f8d15098`, review head `2e354a88`, artifact-retention commit `5aa53b3a` on `codex/sprint-185-component-breadth-wave-1` (base `1118f436`)
**Builder session:** `PS-2026-09-06-001` — declined to self-certify (`builderSelfCertified:false`, `separateReviewRequired:true`)
**Method:** scoped per next-step #1370 — verify only what could flip the determination, measure directly once, do not re-derive the builder's hashes wholesale. First-party throughout, no subagents. About thirty minutes.

---

## Determination

**CERTIFIED. CLOSED.** Sprint 185 was marked Completed in CMOS at 2026-09-06T13:59:59Z by this session (24 decisions and 8 learnings archived; pre-close snapshot `snapshot-20260906T135958704Z-b7b2`).

## The exit gate is met

Six pre-existing saved schemas (cmos-messages-redesign, plan-form-dark, pt-shop-parts-entry-router-v1, user-card-showcase, cmos-dashboard-redesign, the-academy-landing-v1) plus the two Subscription regression schemas, in React and Vue, from LIVE `code.generate` through the packed-consumer gates:

| Measure | Value |
|---|---|
| Framework cells | 16 (12 target + 4 regression) |
| Applicable gates | 124 |
| Proven | 124 |
| Failed | 0 |
| Not applicable | 4 (interaction-evidence on cmos-dashboard-redesign ×2 and the-academy-landing-v1 ×2, per decisions #1730 and #1737; excluded from the pass count, never rolled up as pass) |
| Reachable saved schemas | 5/16 → 11/16 |
| Nucleus | 14 → 19 |

## What I verified, and how

1. **m01 green-for-the-right-reason.** The same one-line mutation (add `DetailHeader` to `NUCLEUS_COMPONENT_IDS` with no implementation) was applied at base `1118f436` and at `e6cc54ed`. At base: 8 TypeScript-totality, 10 derived-coverage, **3 frozen-literal** failures (`ported-contracts.s184.spec.ts:43`, `ported-freeze.s184.spec.ts:125`/`:156`). After m01: 8 totality, 14 derived-coverage, **0 frozen-literal**; `greenForTheRightReason:true`. Workspace restored clean in both controls.
2. **The sixteen cells and the N/A accounting.** `m04/gate-accounting.json` and `execution-summary.json` agree (124/124/4); the four N/A rows sit exactly where the planning decisions predicted them.
3. **Direct measurement, not receipts.** I rebuilt `@oods/component-contracts` and `@oods/mcp-server` dist at `5aa53b3a` and ran the planning-time generation probe (the sprint's red control) against the vendored corpus: all 24 full and pruned cells return `status=ok` with an artifact and an **empty** gap set. The reachability census at the same head reports 11/16.
4. **Sprint-wide mover diff versus the reconnect body.** `m05/movers/sprint-wide-movers.json`: no missing and no extra paths in either the canonical or the public scope for the s184 or the s185 range; the Table control is missed by the old per-mission scope and the canonical list and caught by the public sprint-wide set (decision #1740). The combined notice was actually sent: `fb620639` to `cmos://derek/aquex-mcp` (confirmed present in CMOS with the full body) and `a22747cf` to `cmos://derek/forge-demos` (byte-identical body); Dashboard Demos retired per #1719. The body names every runtime mover, including the React Badge tone precedence fix (#1736), CardHeader's `titleField`/`supportingField` recipe directives (#1738), the read-only header field subscription (#1734), `OODS-N018` for html+tailwind (#1731/#1742), the Subscription N015 disclosure, and the two-union state (#1729).
5. **Baseline structural state at head.** `component-capability-baseline.v1.json` has 109 rows; every `proposedClassification` and `reconciliationState` unchanged; `approvedRuntimeCensus` still null; the five new rows are `implemented-evidence-complete` on react, vue and generatedConsumer and `unverified` on accessibility, theme and interaction (correct: those surfaces were not proven this sprint). The s184 overlay file and its `./registry/capabilities/ported` package export are gone.
6. **Provenance.** `f8d15098 → 2e354a88 → 5aa53b3a` is linear ancestry and `git diff f8d15098 5aa53b3a -- . ':!artifacts'` is empty: nothing executable moved after the four-suite capture. The builder's own output audit passed (8 criteria, 30 execution records, 283 frozen paths) and was checked, not repeated.
7. **Four-suite closeout at `f8d15098`.** viz-core 1390 · viz-render 64 · mcp-server 5486 passed + 16 skipped · root 5880 passed + 16 skipped · zero failures; no unattributed deltas. The failed first attempt (nine stale live expectations, one Vue grouped type-check timeout) is retained separately under its own name, per #1743. Eight s184 files moved from root-core to the package-native serial suite (#1744) so root-core is no longer nondeterministically red.

## What planning got wrong, and build caught

Planning inferred a pure port ("zero contract defects hide behind the component gap"). Build execution disproved it three times: the read-only DetailHeader binding on plan-form-dark (#1734), the CardHeader recipe-directive regression on the old Product carrier (#1738), and a pre-existing React Badge tone-precedence bug (#1736). All repaired in-sprint with tests. Learning #499 records why a green pruned-cell probe is scope evidence, not defect-freedom.

## Not a blocker, disclosed

- The pm2 `oods-forge-bridge` still serves the main checkout, not the s185 worktree. The consumer notices say so and ask for a reconnect after the build is served. Deploy step recorded as a next-step.
- The two ported unions stay separate (#1729); folding waits for a sprint that already moves the root export surface.

## Carry-forward

- **Wave 2 is per-schema, not per-component.** The census at head lists about twenty missing components, each used by exactly one of the five remaining schemas (PriceSummary, AddressCollectionPanel, MembershipPanel, PreferencePanel, TagManager, AddressEditor, PreferenceEditor, RoleAssignmentForm, StatusSelector, TagInput, TemplatePicker, AddressSummaryBadge, MessageStatusBadge, PreferenceSummaryBadge, RoleBadgeList, TagPills, AddressValidationTimeline, AuditEvent, MembershipAuditTimeline, MessageEventTimeline, PreferenceTimeline). Pick the schema(s) with the smallest full missing set and take everything that schema needs together.
- Accessibility, theme and interaction surface cells for the five new components are the program's surface-specific maturity obligation.
- Maintenance by name, unabsorbed: #1315, #1318–#1322, #1331 (Derek), #1371, #1372.
