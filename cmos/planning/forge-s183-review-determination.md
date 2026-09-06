# Forge Sprint 183 — Reviewer's Determination

**Review session:** `PS-2026-09-05-001` (independent reviewer)
**Reviewed:** frozen source head `9a4202fe`, evidence commit `ab0d712d`
**Builder session:** `PS-2026-09-04-007` — declined to self-certify (decision `#1688`)
**Method:** 14 analysis lenses + 6 execution agents + adversarial verification of every
finding (170 agents). Findings raised 74; refuted 5; surviving 69.

---

## Determination

**DO NOT CLOSE YET.** The sprint's work is real and the exit gate genuinely passes. Two
things in the record must be corrected first: a claim marked `passed` is false as written,
and a movement in advertised behavior was absorbed by repointing pre-existing tests instead
of being disclosed. Both are cheap. This is a short correction loop, not a rebuild.

## The exit gate is met

A real, pre-existing saved schema installs, builds, renders, hydrates and passes
interactions in clean isolated React and Vue consumers.

- **The subject is genuinely pre-existing.** `compose-7d860337`, createdAt 2026-03-05,
  sha256 `f842c3c6…318b`. Anchored to git object `6c93e644` (commit dated 2026-03-04,
  "Sprint 66 complete"), byte-identical to the vendored record — six months before the
  foundation nucleus existed. The same-named Sprint 182 fixture that shadowed it was moved
  to `test/fixtures/saved-schemas/` and cannot shadow it again.
- **Isolation is real.** Packed tarballs into a fresh `mkdtemp`; no workspace alias, no
  `paths` mapping, no repo source import; `NODE_PATH` deleted, every `npm_config_*`
  scrubbed, empty user and global npmrc written by the harness. React added 79 packages,
  Vue 100, both exit 0.
- **Hydration can discriminate.** A pre-hydration DOM fingerprint including
  framework-generated ids is compared to the post-hydration fingerprint by strict JSON
  equality; the run fails unless they match with zero runtime errors.
- **Neither framework's bar was lowered.** Both ran the same eight named gates with
  identical outcomes, identical Tabs transitions, identical resolved CSS.

## What the reviewer re-executed

| Check | Result |
|---|---|
| Focused suite at `9a4202fe`, clean tree | 202/202 passed, 0 skipped, exit 0 — **exact match** to the builder's receipt |
| viz-core suite | 67 files / 1390 tests, exit 0 — exact match |
| root core suite | 494 passed + 1 skipped / 5469 + 16 skipped, exit 0 — exact match |
| mcp-server suite | **red on first attempt** (20s timeout under load), green on retry — see C6 |
| Evidence hash graph, re-derived from git blobs | 69/69 unique paths matched, 0 mismatched, 0 missing |
| L-09 reference count, reproduced independently | 1,780 over 53,117 added lines — exact match |
| L-03 checksums | 181 OK, 0 failed |
| Approval gate, 25 adversarial cases | Cannot be granted by editing artifacts alone; positive direction not vacuous |

**Reviewer-authored discrimination probes** — mutations the builder never wrote, to prove
the gates catch what they did not anticipate. Six of seven went red:

| Probe | Mutation | Result |
|---|---|---|
| A | Restore the blank / `TODO` handler body | RED — 12 failed, guard `OODS-N016` |
| **A2** | **Same site, body `{ void 0; }` — handler never calls the injected action** | **GREEN — every gate passed** |
| B | Tolerate one missing release-evidence envelope | RED — 6 failed, one per evidence class |
| C | Emit `workspace:*` for react in the manifest | RED — 15 failed, two independent guards |
| D / D2 / D3 | Forge the checks / notChecked partition, both directions | RED — 21 / 11 / 19 failed |

## Blockers

### B1 — A claim marked `passed` is false

Claim `s183-m06-sc02` reads: *"Every archived mutation patch applies cleanly and has been
replayed from the artifact, not merely written down."*

Of the 29 tracked `*.patch` files under `artifacts/`, five cannot apply at any commit —
their `@@` hunk headers carry no line ranges, which is structurally invalid unified diff:

- `sprint-182/m01a/mutation/mutation.patch` — "No valid patches in input"
- `sprint-182/m01b/mutation/mutation.patch` — "No valid patches in input"
- `sprint-182/m03/gates/B-08|B-09|B-10/mutation.patch` — "patch with only garbage at line 4"

Worse, the case labelled `archived-mutation-patch-replay` for `s182-m01b` does not replay
the archived patch. It replays a new patch Sprint 183 authored (`committedAtBaseline: false`),
while the broken original is re-blessed as `"role": "frozen-mutation-patch",
"preservedInPlace": true` with no note that it does not apply. The other four are disclosed
nowhere.

This is the exact defect Sprint 182's review found and that memo §8 wrote the replay rule to
prevent. Sprint 183 applied the rule to its own new patches and not to the archive it
inherited.

**To clear it:** repair the five patches and replay them, or reword the claim to what is
true and disclose all five. The `preservedInPlace` entry must say the patch does not apply.

### B2 — An undisclosed movement in advertised behavior, absorbed by repointing tests

Thirteen call sites across four pre-existing test files were moved from `context: 'detail'`
/ `intent: 'A detail view…'` to `context: 'card'` / `intent: 'A dashboard with metrics'`:

- `packages/mcp-server/test/tools/pipeline.compact.spec.ts` (8)
- `packages/mcp-server/test/e2e/action-mappings.e2e.spec.ts` (14 lines)
- `packages/mcp-server/test/contracts/contract-alignment.spec.ts` (2)
- `packages/mcp-server/test/e2e/tier1-acceptance.e2e.spec.ts` (2)

Reverting `pipeline.compact.spec.ts` alone to its Sprint 182 version produces 4 failures:

```
OODS-V007: Nested content under Tabs child "detail-tab-panel-3" cannot be preserved
when the child is normalized into a scalar item record.
```

Forge's own built-in `detail` template and its object-aware detail context no longer
produce HTML at the default `build` profile. This follows from decisions `#1673`
(lossy normalization is fatal in build/release) and `#1678` (HTML stays guarded) — so it may
well be intended. But it is named in none of the 38 claims, absent from the memo, and no
replacement test covers the now-failing path.

**To clear it:** say whether it is intended. If it is, disclose it as advertised-behavior
movement and add a test at the old input asserting the typed gap. If not, fix it. Either
way the repointed tests need a stated reason.

## Carries

**C1 — The stub guard is textual, not behavioral.** `artifact-envelope.ts:383` is
`if (!body || /\bTODO\b/i.test(body))`. It rejects an empty body or the literal word TODO
and never checks that the handler forwards to `actions.<name>`. Probe A2 replaced the body
with `{ void 0; }` and every gate stayed green. The sprint's headline promise holds for the
exact old shape and for nothing near it.

**C2 — The exit gate is decoupled from live generation.** The m05 harness has zero
references to `code.generate` or the emitters; it reads committed artifact JSON from `m04/`.
It proves the committed bytes run, not that today's Forge produces them.

**C3 — The domain-action interaction evidence is harness-self-referential.** The two clicked
buttons are written by the harness outside the generated component. The Tabs assertions are
the part that exercises generated output.

**C4 — Every raw execution log for the exit gate is missing from the commit.** 191 files
exist on disk under `sprint-183`; 156 are tracked. The 35-file gap is entirely `*.log` under
`m05`, matched by `.gitignore:34`. Same defect class this sprint closed for R-02, one
directory over.

**C5 — Four of five mutation red-controls have no captured output.** Only the s182 case
carries pre-green / red / restored-green logs with real exit codes.

**C6 — The mcp-server gate carrier is timing-fragile and undisclosed.** It went red on an
independent host under load, in a spec Sprint 183 itself modified to add a yield. Vue rows
consume 7–12s of a 20s per-test budget.

**C7 — The root-core suite delta nets away a removed file.** `+4 files / +66 tests` with
`unattributedDeltas: []`, but five files were added (+114) and one 50-test file was newly
excluded by an s183 `vitest.config.ts` change. A vitest `exclude` is invisible to the skip
counter. Those 50 tests still run in two other carriers.

**C8 — Gate row L-04 is not content-addressable.** Measured at `8ce34907` in a dirty tree
against a database not tracked at the review head. Counts re-verified; the binding is weak.

**C9 — One failing execution is rolled up two ways.** The parked soak failure appears under
CI-14 as `parked-disclosed` and under L-07 as `pass`, inflating the headline pass count by one.

**C10 — Draft profile crashes instead of returning a typed gap.** A component named
`constructor`, `toString`, `valueOf` or `__proto__` throws an uncaught `TypeError` from
`target-contracts.ts:551` — bare bracket access where the same sprint uses `Object.hasOwn`
elsewhere. Build and release are protected only incidentally.

**C11 — Two gaps in the reusable approval gate.** Heads are compared by string equality with
no git lookup and no format check, so fabricated, empty or absent heads return `approved`.
Principal distinctness applies only `trim` + lowercase, so an identity collapse using
zero-width characters and Cyrillic homoglyphs returns `approved` and reads as three distinct
names in a diff. Neither is reachable by editing artifacts alone.

**C12 — Three claim texts say more than the evidence supports.** `m05-sc02` calls the Tabs
behavior "generated Forge-owned behavior" when the artifact contains no generated state or
handler; `m05-sc06`'s parity rests on both reports reading 8/8 plus a string literal, with
nothing comparing gate strength; the ledger's 38/38 is a literal, not a measurement.

**C13 — The exit-gate pre-existence proof is self-attesting.** All three cited paths are
Sprint 183 outputs and the operative datum is a `createdAt` field inside a file this sprint
wrote. The claim is true — this review anchored it to commit `6c93e644` — but the sprint did
not prove it. One sentence citing that commit closes this at zero cost.

**C14 — Seven of the eight m05 gates have no mutation bite.** Both bites target
`interaction-evidence`. Hydration, the gate the sprint singles out, has never been shown red.

**C15 — The 16 skipped tests are environment-blocked and the cause is named nowhere.** They
gate on an adjacent Stage1 checkout that does not exist. Only counts are disclosed.

## What survived the attempt to refute it

Five findings were killed by adversarial verification. The three worth recording:

- **`@vue/server-renderer` "missing from the manifest."** It is a hard dependency of
  `vue@3.5.42`, which is the Vue artifact's declared peer at exactly that version. A
  consumer holding only the Vue manifest resolves it.
- **The `#1680` circularity.** The expected typed-gap set looked derived from the same
  function the implementation calls. It is not — the compared side is the real tool
  handler's output, with profile enforcement in between.
- **`declare module '*.vue'` as a typecheck escape hatch.** TypeScript's ambient-module
  lookup skips relative specifiers, so the real SFC always wins; all four type mutations
  still went red with the line present.

## What this review did not check

- CI-01–CI-09, CI-12, CI-13 and CI-15 were not re-run. Their results and logs were
  hash-verified and read for internal consistency; the executions themselves are attested
  only by the builder's logs.
- CI-10's Chromatic leg cannot be checked locally — no token, no hosted run. It is honestly
  labelled `structurally-non-local`.
- The four archived m05 mutation red-controls were not independently re-observed going red
  (C5).
- Nobody verified the L-06 reconnect message reached the aquex inbox, or whether Forge-Demos
  and Dashboard Demos needed one — they received notices for every prior advertised move and
  got none this time.
- Pre-existence of 14 of the 16 vendored saved schemas rests on filesystem timestamps and a
  pre-sprint index, not git objects; the store was gitignored in March. The exit gate depends
  only on the one record that is cryptographically anchored.

---

The sprint record stays **Active**. Marking it complete is Derek's call, and this reviewer
does not recommend it until B1 and B2 are cleared.
