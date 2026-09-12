# Clean-checkout TypeScript correction

The 13 real compiler errors at capture C are retained in `../../ci/attempt-1/c-typescript-diagnostics.json`, with exact raw CI log line/hash references. This packet records the authorized repair at C plus six explicitly hashed source changes; it does not claim that uncommitted edits ran at a later frozen head.

Five existing scripts changed and one precise sibling `.d.mts` declaration was added. Runtime receipt imports still resolve their exact original compiled module URLs. Source API type bindings remove the clean-build prerequisite from the root typecheck. The HC request construction now carries its real nonempty tuple and bar/line constraints. No tsconfig exclusion, wildcard declaration, test skip, or ratchet threshold changed.

Verification:

- `pnpm exec tsc --noEmit --pretty false`: exit 0 while mcp-server/dist, viz-render/dist, and artifacts/dist were all physically absent. A finally block restored and hash-verified all 870 files (821 + 22 + 27).
- `pnpm --filter @oods/viz-core run typecheck`: exit 0 with already built token types.
- `node scripts/quality/build-stories-ratchet.mjs`: exit 0; exactly 0 errors against the unchanged pin of 0.
- `pnpm exec tsx /tmp/oods-s195-ci/typescript-fix/hc-request-parity.mts`: exit 0; six actual corrected request constructions equal retained m05 JSON operands. The exact temporary probe source is copied here.
- `node /tmp/oods-s195-ci/typescript-fix/dynamic-dist-probe.mjs`: exit 0; nine actual compiled export bindings are callable at the unchanged original module URLs. The exact temporary probe source is copied here.

Neither temporary probe executes a historical generator or invokes its handlers. No m04/m05 proof was overwritten. Probe outputs/logs, source before/after hashes, and the full build restoration manifest are retained. The temporary probe scripts intentionally record their actual local execution paths; they are one-use diagnosis adapters, not an added production proof framework.
