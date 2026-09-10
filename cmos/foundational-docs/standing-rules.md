# Forge Standing Rules

**Status:** Active — canonical numbering
**Canonical since:** Sprint 177
**Scope:** Forge planning, implementation, verification, review, and closeout
**Companion to:** [quality-bars.md](quality-bars.md)

This file is the repository source of truth for the standing method rules that
survived the generate-and-certify arc and the later closeout reviews. Historical
memos keep their original labels; the concordance at the end resolves those
labels to the canonical numbers here.

Rule numbers in this file are stable. New rules append; existing numbers are not
reused. A refinement that preserves the same requirement is folded into the
existing rule and recorded in its origin or concordance entry.
Use `SR-01` through `SR-27` when citing this canon so the repository standing
rules cannot be confused with another document's local `Rule N` labels.

---

## Claims and proof operands

### Rule 1 — Gate claims on positive evidence

**Origin:** Sprint 155; independence amendment in Sprint 157.

**Rule:** A narrative or certification claim gates on a positive precondition
and fails safe to silence when that precondition is absent. Closure is proven by
coverage and an independent property oracle, not by the absence of a known
counterexample.

**Why:** Negative enumerations were false on every cell they forgot, and copied
oracles shared the implementation's blind spots.

**Application:** State the positive precondition, the fail-safe result, the
bounded coverage, and the independent review residual.

### Rule 2 — Claims cannot exceed exercised surface

**Origin:** Sprint 159; blast-radius clarification in Sprint 169.

**Rule:** Generate the claim from the harness coverage manifest. A claim cannot
name an axis, value, renderer, or consumer that no fixture or probe exercised.
Enumerate consumers before ranking severity; zero consumers means dead code,
not a shipped-surface defect.

**Why:** Several correct fixes were over-described as universal, while review
findings were over-ranked before their consumers were known.

**Application:** Publish the covered set and the uncovered residuals beside the
claim. Record consumer blast radius before severity.

### Rule 3 — Keep facet and layout as permanent axes

**Origin:** Sprint 159, from recurrences in Sprints 153 and 158.

**Rule:** Facet and layout remain first-class axes in every honesty and
certification harness.

**Why:** Repeated defects passed single-view fixtures and failed as soon as the
same data was partitioned into panels or composed layouts.

**Application:** Cross every new derivation and gate against the pinned facet and
layout shapes, including a preserve-behaviour control.

### Rule 4 — A control must discriminate

**Origin:** Sprint 163; reinforced by the Sprint 165 review. Legacy labels:
`13a` and `18`.

**Rule:** A verification control that cannot distinguish the intended
implementation from a plausible weaker or broken implementation is not a
control.

**Why:** Green assertions repeatedly proved identities, fixed points, or paths
the changed code never executed.

**Application:** State the defect mutation and prove that the named control turns
red under it while the unmutated baseline remains green.

### Rule 5 — Match the oracle operand to the claimed property

**Origin:** Sprint 165 review; value-axis twin added in Sprint 167.

**Rule:** An oracle comparing name sets certifies only an enumeration. Checking
that a name is spellable certifies only the name. To certify a value, use the
schema's value constraint; to certify drawn output, use the drawn marks as the
operand. When a property cannot be observed directly, a fail-safe superset is
valid only when its direction of error is proved and its scope is stated.

**Why:** Field names, schema keys, and reconstructed series were repeatedly used
as proxies for the values or marks named by the claim.

**Application:** Name the property and the oracle operand together. If the
operand is a proxy, narrow the claim to exactly what that proxy proves.

### Rule 6 — Pin every baseline to its exact invocation

**Origin:** Sprint 165 review.

**Rule:** Every pinned gate count or baseline names the exact invocation that
produced it. A bare number is not comparable across sessions.

**Why:** `vitest --project core` and the default multi-project run produced
different, internally valid totals that were repeatedly compared as though they
were the same gate.

**Application:** Store the literal command next to every pinned count and rerun
that command before carrying the number forward.

### Rule 7 — Adjudicate disagreement through the enforcing path

**Origin:** Sprint 165 review; enforcing-path and exact-argument sharpenings in
Sprints 168 and 169.

**Rule:** When reviewers disagree on a measured result, count auditor findings
and refuter verdicts separately, then remeasure in the main loop. The remeasure
uses the enforcing oracle's own operand, resolution path, and caller arguments;
majority vote and a more convenient measurement do not decide the result.

**Why:** Direct colour math and `--head HEAD` each contradicted the actual gate
because the enforcing path clipped colours and the CI caller supplied a SHA.

**Application:** Reproduce the disputed claim with the enforcing caller's exact
inputs, then record the observed result and the method that settled it.

### Rule 8 — Validate values, not only names

**Origin:** Sprint 167 review. Legacy label: `7a`, the value-axis twin of old
Rule 16.

**Rule:** Checking a key name against a schema proves only that the name exists.
Certifying acceptance requires testing the emitted value against the schema's
value constraint.

**Why:** `baseline` passed a key-name check while every shipped value for it was
schema-invalid.

**Application:** Exercise representative valid and invalid values through the
real validator, not a key-membership surrogate.

### Rule 9 — Derive denylists from the surface

**Origin:** Sprint 167 review. Legacy label: `7b`.

**Rule:** Derive denylists from what the code and types permit, not from what the
current fixture corpus happens to contain.

**Why:** A corpus-derived denylist silently narrows “cannot leak” to “does not
leak in the examples we have.”

**Application:** Enumerate the permitted surface mechanically and make newly
added members fail until dispositioned.

### Rule 10 — Resolve cascade operands before comparing them

**Origin:** Sprint 167 review. Legacy label: `7c`.

**Rule:** When the artifact is a cascade, compare the resolved value rather than
the declaration text.

**Why:** A literal and a `var()` reference differ as strings even when they
resolve to the same rendered value.

**Application:** Run the same resolver used by the consumer and compare its
result at the relevant selector, theme, and brand cell.

### Rule 11 — Point the guard at the defect's own home

**Origin:** Sprint 167 review. Legacy label: `7d`.

**Rule:** A guard must seed and exercise the shape where the defect lives,
including any exempted or fallback branch.

**Why:** Controls thoroughly covered new scope blocks while barely touching the
`:root` declarations that contained the real defect.

**Application:** Name the defect site and include a fixture that reaches it; a
nearby non-exempt path is not a substitute.

---

## Build and review discipline

### Rule 12 — Apply the four-part process set

**Origin:** Sprint 159, decision #1264.

**Rule:** Every mission applies all four clauses:

1. line-item charter-diff at mission complete;
2. guard-ships-its-bite-proof in the same change;
3. shared-function-not-transcription for reused derivations; and
4. per-oracle independence from the system under test, exercised in both
   directions.

**Why:** Claimed-but-unshipped clauses, mutation-free guards, copied derivations,
and mirrored oracles each produced green records with live defects.

**Application:** Map every charter clause to a diff and a test or to an explicit
memo amendment. Never close a mission against an unamended deviation.

### Rule 13 — Build from the locked memo

**Origin:** Sprint 166, after the hardened pre-lock critic caught defects in
eight consecutive draft plans.

**Rule:** The build session executes from the locked decision memo, not from
review prose, planning chat, or remembered intent.

**Why:** Review prose is evidence and criticism, not an implementation contract;
building from it bypasses the adjudicated charter.

**Application:** Cite the locked memo and section in mission start notes and
record deviations by amending that memo.

### Rule 14 — Genuine-close review is separate

**Origin:** Sprint 155; numbered as Rule 10 by Sprint 168.

**Rule:** Genuine-close review runs in a separate session. The build never
self-certifies.

**Why:** Independent review repeatedly found real defects in work whose own
build record was green.

**Application:** The build records evidence and stops. A later session reruns the
review charter at its own HEAD.

---

## Measurement and record integrity

### Rule 15 — Publish the membership behind a count

**Origin:** Sprint 170.

**Rule:** A count is only as good as its membership list. Publish the list or do
not publish the number.

**Why:** Counts with no recoverable member set could not be reproduced or audited
even when their magnitude looked plausible.

**Application:** Name every group or emit a machine-readable member list; hold
ambiguous rows out separately so both totals remain auditable.

### Rule 16 — Recover the method before rejecting a figure

**Origin:** Sprint 168; expanded in Sprint 170.

**Rule:** A disputed figure usually has a missing method, not necessarily a
wrong value. Recover the operand, transformation, exclusions, and threshold
before discarding it. A rationale is also a claim and must be measured.

**Why:** Apparently conflicting Swift counts used different, valid definitions,
and an unmeasured explanation for a token count was itself false.

**Application:** Record the method beside the figure and test explanatory prose
with the same care as the number it justifies.

### Rule 17 — Avoid fixed points in ordering tests

**Origin:** Sprint 166 review; codified as Rule 13 in Sprint 170.

**Rule:** An ordering or permutation test must not choose a fixed point of a
degenerate implementation. Assert explicitly that the degenerate output is not
produced.

**Why:** A first-entry-only implementation passed because the fixture's expected
order happened to equal that weaker implementation's output.

**Application:** Compute the correct and degenerate outputs before choosing the
fixture; select a permutation where they diverge.

### Rule 18 — Declare files written by gates as movers

**Origin:** Sprint 170.

**Rule:** Gates that write files are movers and must be declared. Revert deltas
that are only nondeterministic metadata; keep evidence-bearing deltas
deliberately. Never quote a cumulative counter without its run count.

**Why:** `a11y-report.json` and `diagnostics.json` moved during verification for
different reasons, but both were invisible to an undeclared-movement record.

**Application:** Inventory gate writes before the sweep, state each disposition,
and verify the resulting tree against that declaration.

### Rule 19 — Paste observed output from the final state

**Origin:** Sprint 170 review.

**Rule:** A recorded verification result is a paste of a command actually run at
final HEAD, or at an explicitly named working tree. It is never a restatement of
the plan. Reconciliation totals are cross-checked against the commit and memo
they ship beside.

**Why:** The Sprint 170 record contained outputs that no commit in the reviewed
range could have produced.

**Application:** Run, capture, and paste. If the commit does not yet exist, name
the measured tree rather than calling it final HEAD.

### Rule 20 — Name both trees for ref-based measurements

**Origin:** Sprint 172 review; adopted in Sprint 173 and expanded in Sprint 175.
Legacy labels: Rule `A`, old Rule `16`, and candidate `R-a`.

**Rule:** A gate whose operand is a git ref cannot run before the commit exists.
“At final HEAD” means after the commit, or the row names the tree it actually
measured. Every counterfactual or delta magnitude records the base-ref SHA, the
head-ref SHA, and the literal command; a figure without its refs is not a
measurement.

**Why:** A pre-commit governance row measured the parent commit, and later delta
figures were all correct but described as comparisons against the wrong base.

**Application:** Resolve and paste both SHAs next to the invocation before
interpreting the result.

### Rule 21 — Compare caller guards when lifting functions

**Origin:** Sprint 172 review; adopted in Sprint 173. Legacy labels: Rule `B`
and old Rule `17`.

**Rule:** When a private function is lifted into a shared module, compare the
callers' argument guarding, not only the function body. “Behaviour
byte-identical” requires a test supplying values on which those guards can
disagree.

**Why:** `??` at one caller and a truthiness spread at another sent `id: ''`
through the same shared function by different paths.

**Application:** Enumerate absent, falsy-present, and truthy values for optional
inputs and test both call sites.

---

## Durable hygiene rules

### Rule 22 — Keep sprint promises out of shipped prose

**Origin:** Sprint 174; adopted in Sprint 175 as Rule C.

**Rule:** Shipped prose never carries a sprint-numbered promise. Forward work is
referenced without a sprint or mission date in shipped surfaces; dated plans
belong in decision memos and CMOS.

**Why:** A promised Sprint 174 rollout and mission-numbered deferrals became
false product documentation as soon as sequencing changed.

**Application:** Describe the capability state and undated future condition in
code, schemas, tool descriptions, and user docs. Keep schedule in planning
records.

### Rule 23 — Verify an isolated worktree's base before probing

**Origin:** Sprint 160 review, decision #1277 (stored under Sprint 159);
reaffirmed in Sprint 175.

**Rule:** Before any isolated-worktree probe, run `git rev-parse HEAD` in that
worktree and verify it equals the expected commit.

**Why:** Four review rounds provisioned worktrees at an older base; trusting the
harness would have reported predecessor behaviour as current behaviour.

**Application:** Paste the expected and observed SHAs before the first probe.

### Rule 24 — Establish a green unmutated baseline first

**Origin:** Sprint 175 review; adopted in Sprint 176, decision #1527.

**Rule:** Every mutation batch starts with the unmutated baseline, and that
baseline must be green with a non-zero test count before any mutant result is
read.

**Why:** Vitest's environment-level “no tests” failure resembles a discriminating
red in summary output; mutants were nearly credited without executing.

**Application:** Record the baseline count, inspect assertion-failure lines for
each mutant, restore, and rerun green.

### Rule 25 — Record literal invocations, including environment variables

**Origin:** Sprint 169 review.

**Rule:** Every gate-table row carries the literal invocation that was run,
including environment-variable names and values that select behaviour.

**Why:** The shorthand `SELFTEST=1` passed while the real
`BRAND_CASCADE_PROOF_SELFTEST=1` invocation correctly failed, manufacturing a
false alarm from an unexecutable record.

**Application:** Paste the full runnable invocation; do not replace variable
names, flags, filters, or paths with prose shorthand.

### Rule 26 — Run heavy suites sequentially

**Origin:** Sprint 156 review; reaffirmed in Sprints 175 and 176.

**Rule:** Never run `test:scale` or another heavy Vitest workload concurrently
with the full MCP-server suite. Run closeout suites sequentially and rerun a
timing-sensitive failure in isolation before classifying it as a regression.

**Why:** Resource contention inflated sub-second tests to minutes and turned the
p99, timeout, and timing-sensitive suites red without a product change.

**Application:** Use the established order: viz-core, MCP-server, root core,
then scale. Record any isolation rerun beside the first result.


### Rule 27 — Regenerate declared movers from the closeout diff

**Origin:** Sprint 181 carry #1318; enforced operationally in Sprints 185 and 190,
written into the canon in Sprint 191.

**Rule:** At closeout, regenerate declared movers from
`git diff --name-only <base>..<head>` over the advertised path set. A hand-written
movement list cannot substitute for the actual committed range.

**Why:** Copied movement lists drifted from the files that consumers must re-pin.

**Application:** `scripts/product-reality/s185-sprint-wide-movers.mjs`
`deriveRange` derives the committed range and `deriveMovers` rejects declaration
drift. `packages/mcp-server/test/product-reality/closeout.s190.spec.ts` exercises
the enforcement. Retain the derived list and the base/head identities beside the
closeout receipt.

---

## Old-number → canonical-number concordance

The source column is mandatory because the old labels collided. A bare legacy
“Rule 16” or “Rule 17” is ambiguous without its source or title.

### The 21-entry flagship memory list

| Legacy source | Old label | Canonical | Resolution |
|---|---:|---:|---|
| Flagship memory | `1` | **1** | Positive-precondition gating |
| Flagship memory | `2` | **2** | Surface-scoped, coverage-generated claims |
| Flagship memory | `3` | **3** | Facet/layout axis |
| Flagship memory | `4` (`Rule 13a/18`) | **4** | Discriminating control |
| Flagship memory | `5` (`s165 Rule 16`) | **5** | Name-set versus drawn-mark operand |
| Flagship memory | `6` (`s165 Rule 17`) | **6** | Baseline's exact invocation |
| Flagship memory | `7` (`s165 Rule 19`) | **7** | Main-loop remeasurement through the enforcing path |
| Flagship memory | `7a` | **8** | Value-axis twin |
| Flagship memory | `7b` | **9** | Surface-derived denylists |
| Flagship memory | `7c` | **10** | Resolved cascade value |
| Flagship memory | `7d` | **11** | Guard at defect home |
| Flagship memory | `8` | **12** | Four-part process set |
| Flagship memory | `9` | **13** | Build from locked memo |
| Flagship memory | `10` | **14** | Separate genuine-close review |
| Flagship memory / s170 block | `11` | **15** | Publish count membership |
| Flagship memory / s170 block | `12` | **16** | Recover a disputed figure's method |
| Flagship memory / s170 block | `13` | **17** | Non-fixed-point permutation test |
| Flagship memory / s170 block | `14` | **18** | Gate-written files are movers |
| Flagship memory / s170 review | `15` (“would be 15”) | **19** | Final-state command paste |
| Flagship memory / s173 Rule A | `16` / `A` | **20** | Git-ref timing and named trees |
| Flagship memory / s173 Rule B | `17` / `B` | **21** | Lifted-function caller guards |

### Memo-local aliases, refinements, and later candidates

| Legacy source | Old label | Canonical | Resolution |
|---|---:|---:|---|
| s165 memo | `Rule 14` | **5** | Direct property over drawn marks |
| s165 memo | `Rule 15` | **1**, **5** | Arc-scoped fail-safe superset; retained as positive gating plus operand/direction-of-error discipline |
| s165 review | `Rule 16` | **5** | Name sets certify enumeration only |
| s165 review | `Rule 17` | **6** | Exact invocation for a baseline |
| s165 review | `Rule 18` / `13a` | **4** | A control must discriminate |
| s165 review | `Rule 19` | **7** | Main-loop adjudication |
| s168 memo §5 | local `1` / `Rule 9` | **13** | Build from memo |
| s168 memo §5 | local `2` / `Rule 10` | **14** | Separate review |
| s168 memo §5 | local `3` / `13a/18` | **4** | Discriminating control |
| s168 memo §5 | local `4` / `Rule 16 + value twin` | **5**, **8** | Name and value operands |
| s168 memo §5 | local `5` / `Rule 17` | **6** | Exact baseline invocation |
| s168 memo §5 | local `6` / `Rule 19` | **7** | Main-loop adjudication |
| s168 memo §5 | local `7` | **9** | Surface-derived denylist |
| s168 memo §5 | local `8` | **10** | Resolved cascade value |
| s168 memo §5 | local `9` | **11** | Guard at defect home |
| s168 memo §5 | local `10` | **6** | Remeasure inherited numbers with their invocation |
| s168 memo §5 | local `11` | **12** | Line-item charter-diff clause |
| s168 memo §5 | local `12` | **12** | Guard-ships-its-bite-proof clause |
| s168 memo §5 | local `13` | **7** | Enforcing oracle's operand and path |
| s168 memo §5 | local `14` | **16** | A rationale is a measured claim |
| s169 memo §5 | local `1–14` | **as above** | Repeats the s168 local set |
| s169 memo §5 | local `15` | **2** | Blast radius before severity |
| s169 memo §5 | local `16` | **7** | Enforcing caller's exact arguments |
| s169 memo §5 | local `17` | **7** | Count auditors and refuters separately |
| s170 block | local `11–14` | **15–18** | Full text recovered into Rules 15–18 |
| s170 review | local `15` | **19** | Final-state command paste |
| s173 memo | `Rule A` / local `16` | **20** | Git-ref timing |
| s173 memo | `Rule B` / local `17` | **21** | Lifted caller guards |
| s174 / open-arcs ledger | proposed “Rule 18 (C)” | **22** | Proposal only; never appended under the colliding old number |
| s175 candidate | `R-a` | **20** | Base SHA, head SHA, and literal command retained with Rule A |
| s175 candidate | `R-b` / `C` | **22** | No sprint-numbered promises in shipped prose |
| s175 candidate | `R-c` | **23** | Verify isolated-worktree HEAD |
| s176 decision #1527 | unnumbered | **24** | Green non-zero baseline before mutation |
| s169 review literal-invocation lesson | unnumbered | **25** | Environment variables included |
| s156 review sequential-suite lesson | unnumbered | **26** | Heavy suites run sequentially |

Reconnect-after-schema-change and gitignored-build-input checks are not missing
rules: Sprint 177's locked memo assigns them to
`cmos/foundational-docs/closeout-checklist.md` rather than this numbered set.

---

## Source trail

- Rules 1–3 and 12: Sprints 155–159 honesty memos and decision #1264.
- Rules 4–7: Sprint 165 memo/review, decision #1332, and the Sprint 168–169
  enforcing-path corrections.
- Rules 8–11: Sprint 167 memo/review.
- Rules 13–14: Sprint 166 onward, codified as old Rules 9–10.
- Rules 15–19: Sprint 170 build/review record.
- Rules 20–21: Sprint 172 review, ratified and appended in Sprint 173.
- Rules 22–23: Sprint 174 review and Sprint 175
  [standing-rule candidates](../planning/forge-s175-correctives-decision-memo.md#3-standing-rule-candidates-recorded-unnumbered-s176-m01-writes-the-list-into-the-repo-with-one-numbering).
- Rule 24: Sprint 176 [method rule](../planning/forge-s176-render-grading-decision-memo.md#1d-m04--forced-block-m).
- Rule 27: Sprint 181 carry #1318, operational enforcement in Sprints 185/190,
  and Sprint 191 maintenance closeout.
- Rules 25–26: Sprint 169 literal-gate review and Sprint 156 sequential-suite
  review, reaffirmed by the Sprint 177 locked memo.

The locked inventory and acceptance criteria are in the
[Sprint 177 decision memo](../planning/forge-s177-hygiene-and-closeout-process-decision-memo.md#1a-m01a--standing-rulesmd-m-l-tendency--m01b--closeout-checklistmd--successcriteria-wiring-s).
