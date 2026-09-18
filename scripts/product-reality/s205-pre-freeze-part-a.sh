#!/bin/zsh
# Sprint 205 pre-freeze, part A: every gate that rebuilds nothing. (Sprint 204's part A, carried forward with the
# sprint's paths and specs; the tripwire still runs first.)
#
# s204-m01 changed one thing about the shape of this script: the TRIPWIRE RUNS FIRST. Both defects
# found on 2026-09-16 were specs asserting a sprint-scoped fact — a ledger, a census, a mode block,
# a near.md reader — and nothing ran them before the expensive things, so a ninety-second discovery
# cost thirty-four minutes (CMOS learning #655). capture-tripwire.mjs is that ninety seconds, and
# part A stops if it fails rather than spending the next four minutes finding out again.
#
# Each command logs to its own file; part-a-status.txt records exit codes and windows. Part B
# (viz:gate, the on-demand gate roster, then the final bundle, its E2E and the Linux container
# proof) runs alone afterwards, because it rebuilds packages.
set -u
cd "${FORGE_ROOT:-$(git rev-parse --show-toplevel)}"
OUT=${1:-artifacts/product-reality/sprint-205/m06/pre-freeze}
mkdir -p "$OUT"
: > "$OUT/part-a-status.txt"
run() {
  local id=$1; shift
  local started=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  "$@" > "$OUT/$id.log" 2>&1
  local code=$?
  echo "$id exit=$code started=$started ended=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$OUT/part-a-status.txt"
  return $code
}

# STEP 1, always first: the sprint-scoped tripwire. Roughly ninety seconds; it covers every
# generator --check, the ledger, the census, the schema types and the near.md readers.
if ! run tripwire node scripts/product-reality/capture-tripwire.mjs --output-root "$OUT/tripwire"; then
  echo "tripwire FAILED — part A stopped before any long gate. See $OUT/tripwire.log and $OUT/tripwire/capture-tripwire.json" >&2
  exit 1
fi

# The lockfile the capture installs from (the closeout rule, memory: forge-closeout-gate-sweep).
run install-frozen pnpm install --frozen-lockfile
# Suites: the object domains, the sprint surfaces and the reference host. (The tripwire already ran
# every generator --check and the root near.md/prose-carrier readers.)
run objects-specs pnpm --filter @oods/mcp-server exec vitest run test/objects
# Every spec this sprint added, by mission: m01 the capture, m02 the screen defects, m03 the Stage1 seam,
# m04 the comparison, m05 the observation panel on the page and in the reference host.
run s204-specs pnpm --filter @oods/mcp-server exec vitest run test/product-reality/ledger-read-cost.s204.spec.ts test/product-reality/gate-roster.s204.spec.ts test/product-reality/card-body-anchor.s204.spec.ts test/product-reality/slot-date-lowering.s204.spec.ts test/product-reality/status-timeline-timestamp.s204.spec.ts test/product-reality/health-live-counts.s204.spec.ts test/product-reality/statusable-badge-contract.s204.spec.ts test/e2e/stage1-rollups.e2e.spec.ts test/product-reality/observation.s204.spec.ts test/product-reality/observation-beside-the-design.s204.spec.ts test/product-reality/observation-in-conversation.s204.spec.ts
# Every spec this sprint added: m01 the carries and the positive craft bar, m02 the capture objects and the workflow
# record, m03 the result-state family, m04 the run view and its admitted kinds.
run s205-specs pnpm --filter @oods/mcp-server exec vitest run test/contracts/refusal-codes.s205.spec.ts test/product-reality/workflow-record.s205.spec.ts test/product-reality/craft-says.s205.spec.ts test/product-reality/result-state-family.s205.spec.ts test/product-reality/run-view.s205.spec.ts test/e2e/stage1-run-view.e2e.spec.ts test/e2e/action-mappings.e2e.spec.ts test/tools/design.compose.s202.spec.ts test/objects/capture.spec.ts
run golden-ledger-check pnpm exec tsx scripts/product-reality/s205-golden-ledger.ts check
# The generation census composes, so it writes versions — into a temp store, never the repository.
run runtime-census env MCP_SCHEMA_STORE_ROOT="$(mktemp -d)" MCP_SCHEMA_STORE_DIR=schemas pnpm exec tsx scripts/product-reality/s205-runtime-census.ts "$OUT/runtime-census.json"
run s203-specs pnpm --filter @oods/mcp-server exec vitest run test/product-reality/heading-order.s203.spec.ts test/product-reality/axe-scope.s203.spec.ts test/product-reality/context-beside-the-design.s203.spec.ts test/product-reality/context-in-conversation.s203.spec.ts
run s201-s202-specs pnpm --filter @oods/mcp-server exec vitest run test/product-reality/reference-host.s202.spec.ts test/product-reality/preview-app.s202.spec.ts test/product-reality/preview-app-acts.s202.spec.ts test/product-reality/adapter-mcp-apps.s202.spec.ts test/product-reality/adapter-preview-host.s201.spec.ts test/product-reality/shell-landmarks.s202.spec.ts
run bridge-preview-specs pnpm --filter @oods/mcp-bridge run test
run components-react pnpm --filter @oods/components-react run test
run components-vue pnpm --filter @oods/components-vue run test
run component-contracts pnpm --filter @oods/component-contracts run test
run component-styles pnpm --filter @oods/component-styles run test
# Adapter proofs and the root typecheck.
run adapter-test-s55-m03 node packages/mcp-adapter/test-s55-m03.js
run adapter-test-s55-m04 node packages/mcp-adapter/test-s55-m04.js
run adapter-test-s55-m05 node packages/mcp-adapter/test-s55-m05.js
run adapter-test-native-errors node packages/mcp-adapter/test-s196-native-errors.js
run typecheck pnpm typecheck
