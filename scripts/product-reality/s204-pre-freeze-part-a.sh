#!/bin/zsh
# Sprint 204 pre-freeze, part A: every gate that rebuilds nothing.
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
OUT=${1:-artifacts/product-reality/sprint-204/m06/pre-freeze}
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

# Suites: the object domains, the sprint surfaces and the reference host. (The tripwire already ran
# every generator --check and the root near.md/prose-carrier readers.)
run objects-specs pnpm --filter @oods/mcp-server exec vitest run test/objects
run s204-specs pnpm --filter @oods/mcp-server exec vitest run test/product-reality/ledger-read-cost.s204.spec.ts test/product-reality/gate-roster.s204.spec.ts
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
