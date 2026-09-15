#!/bin/zsh
# s200-m07 pre-freeze pass, part A: every gate that rebuilds nothing. Each command logs to its own file;
# report.json records exit codes. Part B (viz:gate, portable:assemble --final, portable:e2e) runs alone afterwards.
set -u
cd /Users/systemsystems/.codex/worktrees/s200/OODS-Forge
OUT=artifacts/product-reality/sprint-200/m07/pre-freeze
HEAD_SHA=$(git rev-parse HEAD)
: > "$OUT/part-a-status.txt"
run() {
  local id=$1; shift
  local started=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  "$@" > "$OUT/$id.log" 2>&1
  local code=$?
  echo "$id exit=$code started=$started ended=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$OUT/part-a-status.txt"
}
run readiness-check pnpm exec tsx scripts/product-reality/s196-release-readiness.ts --facts artifacts/product-reality/sprint-200/readiness/release-readiness-facts.json --check
run docs-check pnpm docs:check
run render-license-check node scripts/license/render-license.mjs --check
run third-party-notices-check node scripts/runtime/third-party-notices.mjs --check
run client-configs-check node scripts/runtime/client-configs.mjs --check
run golden-ledger-check pnpm exec tsx scripts/product-reality/s200-golden-ledger.ts check
run root-specs pnpm exec vitest run tests/verification/license-shape.s200.test.ts tests/verification/release-publish-shape.s196.test.ts tests/verification/readme.s200.test.ts tests/verification/portable-runbook.s200.test.ts tests/verification/how-forge-works.contract.test.ts tests/verification/s177-prose-carriers.contract.test.ts tests/verification/forge-claims.contract.test.ts tests/verification/agent-docs-registry.contract.test.ts tests/verification/docs.contract.test.ts tests/verification/gate2-decision-packet.s196.test.ts tests/verification/runtime-executable-boundary.s191.test.ts
run alias-specs-react zsh -c 'cd packages/components-react && pnpm exec vitest run test/ported-package-contract.spec.ts'
run alias-specs-vue zsh -c 'cd packages/components-vue && pnpm exec vitest run test/ported-package-contract.spec.ts'
run alias-specs-styles zsh -c 'cd packages/component-styles && pnpm exec vitest run test/ported-styles.spec.ts'
run mcp-near-specs zsh -c 'cd packages/mcp-server && pnpm exec vitest run test/product-reality/closeout.s190.spec.ts test/product-reality/closeout.s191.spec.ts test/product-reality/closeout.s196.spec.ts test/product-reality/closeout.s197.spec.ts test/product-reality/public-head-equivalence.s185.spec.ts test/contracts/tool-truth.s193.spec.ts test/contracts/tool-specs-generator.s196.spec.ts test/contracts/portable-claims.s196.spec.ts'
run adapter-test node packages/mcp-adapter/test-s55-m05.js
run assembly-unit node --test scripts/runtime/assembly.test.mjs
run typecheck pnpm typecheck
echo "part-a done head=$HEAD_SHA" >> "$OUT/part-a-status.txt"
