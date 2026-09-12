# s195-m07 worker hash correction

The complete worker test file passes **31/31, zero failed or skipped** after a
constant/comment-only correction. The assertion body still checks the converged
canonical hash, deterministic degenerate jobs across intervening RNG use,
nonempty chart output and caller-option immutability. Renderer code, RNG policy,
convergence policy and historical m05 receipts are unchanged.

Attempt 1's full viz-render suite retained 68 passed / 1 failed / 0 skipped. The
failure was the stale `CONVERGED_CANONICAL_FORCE_HASH` from the pre-m05 palette.
`verification.json` binds that exact raw assertion in
`../../five-suite-closeout-attempt-1/run-1/viz-render.vitest.json`, the corrected
source hashes, the causal probe, and the complete focused rerun.

The runtime probe changed **only projected `color[4]`** from
`rgb(202, 73, 72)` to `rgb(202, 73, 73)`, using the exact retained s172 Service
graph operand. Under the unchanged compiled worker it rendered old/new/old/new,
reproducing both historical SVG files byte-for-byte:

| Option | Seed state | SVG SHA256 | Bytes |
| --- | ---: | --- | ---: |
| Before m05 light slot05 | 3680651889 | `3b947d90250a98838aad801be4f98ea8e5095528618296083b8644075ff6a331` | 4050 |
| Authorized m05 light slot05 | 3858616866 | `df5261688594d5f845960170d643c35518954198cda607a598e069beed7e53df` | 4054 |

**Geometry changes; paint does not.** Eight SVG attributes move: two edge paths,
three node transforms and three label transforms. The full projected option
seeds the force layout, including all six palette colors. This graph uses only
the first two colors, but changing unused slot05 still changes the seed. Data,
force parameters, text, paint, dimensions and remaining markup are unchanged.
The probe confirms repeatability, untouched caller options, restored RNG and no
remaining active jobs/charts. It does not claim palette-independent geometry.

The new hash was already explicitly qualified at
`52b0da991705c4c565987bc9faf7738ba00d885e`: original m05
`golden-migration/golden-attribution.json` records the exact old→new migration at
`matrixRows` source m04 `viz/viz-observations.json`, pointer
`/observations/9/scopes/0`. Its reason names the authorized categorical Role-A
revision and retained data/renderer contract. Raw m05 SVG and attribution bytes
are bound to receipt commit `3c8a7a5664f811b9168028d63684502ac956f657`; they were
not rewritten. `static-verification.json` additionally proves seven relevant
source/fixture files were unchanged at before-m05, qualification, B and C.

The static packet was prepared under `/tmp` during exclusive capture; its
`runtimeCausalProbe: pending` describes that preparation stage. The later
`causal-probe.json` and `verification.json` record the actual successful
post-capture execution. `static-preparation.py` preserves the original analysis
script; it is not a current-source generator. The actual probe command ran the
hash-identical `/tmp` script copied here as `causal-probe.mjs`.

Execution occurred while HEAD remained C
`54def3aa88683d81f1f942558a24715c064021e9`, with the test correction uncommitted
and other agents making separately owned corrections. The focused command used
`--coverage.enabled=false` because the package-wide coverage floor is not a
single-file threshold; no configuration or threshold changed. The causal probe
and test both exited0; raw stdout/stderr and the JSON test report are retained.
These results do not replace the pending second full capture or fresh final
runtime proof required by the separately discovered public-script corrections.
