#!/bin/zsh
# s203-m06 pre-freeze, part A: every gate that rebuilds nothing. Each command logs to its own file and
# part-a-status.txt records exit codes and windows. Part B (viz:gate, then the final bundle, its E2E and
# the Linux container proof) runs alone afterwards, because it rebuilds packages.
set -u
cd /Users/systemsystems/.codex/worktrees/s203/OODS-Forge
OUT=artifacts/product-reality/sprint-203/m06/pre-freeze
mkdir -p "$OUT"
: > "$OUT/part-a-status.txt"
run() {
  local id=$1; shift
  local started=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  "$@" > "$OUT/$id.log" 2>&1
  local code=$?
  echo "$id exit=$code started=$started ended=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$OUT/part-a-status.txt"
}
# Generators and ledgers.
run readiness-check pnpm exec tsx scripts/product-reality/s196-release-readiness.ts --facts artifacts/product-reality/sprint-203/readiness/release-readiness-facts.json --check
run docs-check pnpm docs:check
run generate-check pnpm --filter @oods/schemas-tools generate:check
run tool-truth-check node scripts/product-reality/s193-tool-truth.mjs --check
run docs-api-check pnpm docs:api -- --check
run docs-tools-check pnpm docs:tools -- --check
run docs-claims-check pnpm docs:claims -- --check
run render-license-check node scripts/license/render-license.mjs --check
run third-party-notices-check node scripts/runtime/third-party-notices.mjs --check
run client-configs-check node scripts/runtime/client-configs.mjs --check
run golden-ledger-check pnpm exec tsx scripts/product-reality/s203-golden-ledger.ts check
run viz-census-check pnpm exec tsx scripts/product-reality/s190-viz-census.ts --check
run schema-types-check pnpm run generate:schema-types -- --check
# Suites: the near.md readers, the object domains, the sprint surfaces and the reference host.
run root-verification npx vitest run --project core --no-file-parallelism tests/verification tests/contracts
run objects-specs pnpm --filter @oods/mcp-server exec vitest run test/objects
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
