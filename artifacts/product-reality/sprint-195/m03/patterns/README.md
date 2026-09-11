# s195-m03 measured pattern registry

The public census called all 21 exact pattern identities in light/dark and A/B: 84 cells. Eight patterns produced SVG in all four scopes; thirteen returned the typed authoring-only rejection with their actual reasons. Each successful SVG was repeated byte for byte and its returned normalized spec passed through the real certification handler. All 32 public cells measured `conformant:true`; zero false verdicts were observed. The registry retains each verdict rather than deriving conformance from the presence of pixels.

Public identities are correlation-matrix, correlation-scatter, diverging-bar, running-total-area, simple-bar, stacked-100-bar, stacked-bar, and time-grid-heatmap (all use the full `pattern:viz:` prefix). The Core Profile gains exact pattern backing for statistical/distribution and statistical/part-to-whole. Its final census is 34/34 classified, 20 cells, 13 surface-complete, and seven typed gaps. Temporal multi-series/target and the five financial/scientific cells remain typed gaps.

- `pattern-observations.json` retains the requests, actual responses, repeated SVG hashes, normalized specs, and certification results. Requests are recorded before AJV applies defaults; a clone is validated and dispatched.
- `focused-and-portable.log` records the final **79/79 tests**, none skipped: 19 registry tests including a fresh 84-cell census, 21 taxonomy tests, 28 health boundary tests, and 11 staged portable tests.
- `pattern-check.log` and `taxonomy-check.log` verify generated registry/artifact/document bytes from their declared inputs.
- `generator-typecheck.log` records strict checks for the census and taxonomy scripts; `diff-check.log` records whitespace validation.
- `verification.json` records source hashes and command outcomes. Final package build logs are in `../handler/final-viz-core-build.log` and `../handler/final-server-build.log`.

The first final test attempt caught one stale portable assertion expecting the m02 11/9 counts while the staged runtime correctly returned 13/7. Its raw log and verification record are retained with `attempt-01` names. The assertion now reads the shipped generated summary; the final four-file run passed. An earlier development census assertion also caught AJV mutating its request with defaults; preserving the original request and validating a clone resolved that bookkeeping issue before observations were retained.

Source identity, raw spec SHA, base chart type, family, portability, four exact scopes, normalized-spec hash, SVG hash, and certification operand identity are checked. A known-but-wrong base type, missing scope, mutated source bytes, fabricated public status, unexpected handler failure, or hand-edited output is rejected. Health and the portable build validate the measured sibling registry before advertising pattern-backed core coverage. The existing 13-type registry is unchanged.

No CMOS changes, commits, full-suite capture, or independent certification were performed by this subtask.
