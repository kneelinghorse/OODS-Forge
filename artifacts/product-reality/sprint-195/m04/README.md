# s195-m04 — ECharts declared operand certification

The eight ECharts-primary types now use the declared data-operand profile:
accessibility equivalence is graded, and conformance combines that result with
stable determinism, usable contrast grading and evaluated clean accuracy. No
Vega-Lite compile was added. Spec-only calls retain uncertified coverage, null
conformance and their missing-data explanation. Their shared note was corrected
because its old future/warn-first enforcement statement would now be false.

CMOS decision #1940 records the scope interpretations. In particular, the existing
fault-is-not-pass guard remains: ungradeable contrast cannot yield conformance.
Completed accessibility evaluations retain warning findings and named absent
preconditions; an individual evaluator fault fails the pillar even if its rule's
normal severity is warning. Incomplete evaluations discard partial results and
cannot pass.

Six pure data rules are registered as V168–V173: invalid bubble size, radius-based
bubble scaling, conflicting values at identical bubble coordinates, invalid flow
strength, duplicate directed geographic flows and duplicate directed graph edges.
Reciprocal edges remain distinct. Public graph values do not drive line width,
so no negative-weight-as-width rule was invented. Bubble sizing remains the
public renderer's existing linear diameter scale; certification reports the
distortion rather than repairing the picture.

The census measures 13 types across 52 light/dark A/B scopes. All 13 types have
certified coverage on their declared path; 48 scope results are conformant and
four bubble-map results are nonconformant because V169 fires. All 52 SVG hashes
and unrelated prior registry fields remain unchanged. Generated per-scope
registry metadata retains those booleans and pillars. The accuracyRules metadata
change is explicitly attributed to the required new rules.

The production V171 predicate was disabled while its offered registration remained
intact. The full live census failed for the missing V171 finding. Exact source
bytes were restored, the package rebuilt, and the census passed. The bite packet
retains mutation, failure and restoration evidence.

Evidence is divided among accuracy/, certify/, viz/ and docs/. Accuracy has 111
tests plus 26 error-registry tests; certification records its complete successful
test accounting and exact old-to-new verdict paths. Root checks cover 15 narrative
tests, 28 unchanged-pattern/pixel tests and 14 existing equivalence applicability
tests. No tests were skipped. The first isolated equivalence command inherited
the package-wide coverage threshold and failed that threshold despite 14 passing
tests; the intended targeted command disabled coverage collection and passed.
Both logs remain. Global thresholds are unchanged for the m07 full-suite capture.

The API generator derives offered rule codes and measured conformance counts
from the registry. Two older documentation errors were also corrected: dashboards
admit 11 chart types, and certification's contentHash is nested under determinism.
Exact prose changes and hashes are retained in docs/prose-migration.json and its
patch. Historical golden files are preserved; the declared verdict migration is
documented separately from the unchanged SVG evidence.

The implementation head and tool-ledger check are in integration-results.json.
All work is in the sprint worktree; primary PM2 remains on delivered Sprint 194
`5b25c3c9`. No full-suite capture was run here. Builder certification remains false.
