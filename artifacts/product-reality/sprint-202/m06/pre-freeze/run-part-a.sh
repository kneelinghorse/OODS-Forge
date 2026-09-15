#!/bin/zsh
# s202-m06 pre-freeze pass, part A: every gate that rebuilds nothing. Each command logs to its own file;
# part-a-status.txt records exit codes and windows. Part B (viz:gate, then the final bundle, its E2E and the Linux
# container proof) runs alone afterwards.
set -u
cd /Users/systemsystems/.codex/worktrees/s202/OODS-Forge
OUT=artifacts/product-reality/sprint-202/m06/pre-freeze
mkdir -p "$OUT"
HEAD_SHA=$(git rev-parse HEAD)
: > "$OUT/part-a-status.txt"
run() {
  local id=$1; shift
  local started=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  "$@" > "$OUT/$id.log" 2>&1
  local code=$?
  echo "$id exit=$code started=$started ended=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$OUT/part-a-status.txt"
}
# Generators and ledgers.
run readiness-check pnpm exec tsx scripts/product-reality/s196-release-readiness.ts --facts artifacts/product-reality/sprint-202/readiness/release-readiness-facts.json --check
run docs-check pnpm docs:check
run generate-check pnpm --filter @oods/schemas-tools generate:check
run tool-truth-check node scripts/product-reality/s193-tool-truth.mjs --check
run docs-api-check pnpm docs:api -- --check
run docs-tools-check pnpm docs:tools -- --check
run docs-claims-check pnpm docs:claims -- --check
run render-license-check node scripts/license/render-license.mjs --check
run third-party-notices-check node scripts/runtime/third-party-notices.mjs --check
run client-configs-check node scripts/runtime/client-configs.mjs --check
run golden-ledger-check pnpm exec tsx scripts/product-reality/s202-golden-ledger.ts check
run viz-census-check pnpm exec tsx scripts/product-reality/s190-viz-census.ts --check
run certified-matrix-check pnpm exec tsx scripts/product-reality/s195-qualify-viz-matrix.ts --mode s201 --check
# Root verification specs, including the near.md readers.
run root-specs pnpm exec vitest run tests/verification/license-shape.s200.test.ts tests/verification/release-publish-shape.s196.test.ts tests/verification/readme.s200.test.ts tests/verification/portable-runbook.s200.test.ts tests/verification/how-forge-works.contract.test.ts tests/verification/s177-prose-carriers.contract.test.ts tests/verification/forge-claims.contract.test.ts tests/verification/forge-claims-behavior.s196.test.ts tests/verification/forge-claims-source-pins.s196.test.ts tests/verification/agent-docs-registry.contract.test.ts tests/verification/docs.contract.test.ts tests/verification/gate2-decision-packet.s196.test.ts tests/verification/runtime-executable-boundary.s191.test.ts tests/verification/runtime-placement-ci.s195.test.ts tests/verification/storybook-chrome.s201.test.ts tests/verification/viz-coverage-table.s199.test.ts tests/verification/closeout-checklist.contract.test.ts tests/verification/install-conversation.s202.test.ts
# Component packages the sprint touched (the placed chart's figure heading and narrow render).
run alias-specs-react zsh -c 'cd packages/components-react && pnpm exec vitest run test/ported-package-contract.spec.ts'
run alias-specs-vue zsh -c 'cd packages/components-vue && pnpm exec vitest run test/ported-package-contract.spec.ts test/viz-area-svg.spec.ts'
run alias-specs-styles zsh -c 'cd packages/component-styles && pnpm exec vitest run test/ported-styles.spec.ts test/pagination-layout.s201.spec.ts test/styles.spec.ts test/geometry-contract.s200.spec.ts'
# mcp-server: the near.md and ledger readers, the Sprint 201 surface, the Sprint 202 specs and the reference host.
run mcp-near-specs zsh -c 'cd packages/mcp-server && pnpm exec vitest run test/product-reality/closeout.s190.spec.ts test/product-reality/closeout.s191.spec.ts test/product-reality/closeout.s196.spec.ts test/product-reality/closeout.s197.spec.ts test/product-reality/public-head-equivalence.s185.spec.ts test/contracts/tool-truth.s193.spec.ts test/contracts/tool-specs-generator.s196.spec.ts test/contracts/portable-claims.s196.spec.ts test/contracts/chart-gate.s199.spec.ts'
run s201-specs zsh -c 'cd packages/mcp-server && pnpm exec vitest run test/tools/design.preview.s201.spec.ts test/lib/composition-store.s201.spec.ts test/product-reality/adapter-preview-host.s201.spec.ts test/codegen/craft-list.s201.spec.ts test/tools/payload-mode.s201.spec.ts'
run s202-specs zsh -c 'cd packages/mcp-server && pnpm exec vitest run test/codegen/chart-assets.s202.spec.ts test/codegen/screen-shell.s202.spec.ts test/tools/design.compose.s202.spec.ts test/tools/design.preview.s202.spec.ts test/tools/design.preview.accept.s202.spec.ts test/contracts/viz-pattern-registry.s195.spec.ts test/product-reality/chart-placement-codegen.s195.spec.ts test/e2e/object-codegen-pipeline.spec.ts test/contracts/portable-boundary.s181.spec.ts'
run s202-reference-host-specs zsh -c 'cd packages/mcp-server && pnpm exec vitest run test/product-reality/adapter-mcp-apps.s202.spec.ts test/product-reality/reference-host.s202.spec.ts test/product-reality/preview-app.s202.spec.ts test/product-reality/preview-app-acts.s202.spec.ts test/product-reality/shell-landmarks.s202.spec.ts'
run bridge-preview-specs zsh -c 'cd packages/mcp-bridge && pnpm exec vitest run src/preview'
run viz-core-s201-spec zsh -c 'cd packages/viz-core && pnpm exec vitest run test/chart-titles.s201.spec.ts test/graph-adapter.spec.ts test/sankey-adapter.spec.ts test/s179-echarts-render-baseline.spec.ts --coverage.enabled=false'
# The adapter's own proofs and the assembler.
run adapter-test-s55-m04 node packages/mcp-adapter/test-s55-m04.js
run adapter-test-s55-m05 node packages/mcp-adapter/test-s55-m05.js
run adapter-test-lifecycle node --test packages/mcp-adapter/test-s181-lifecycle.js
run adapter-test-native-errors node --test packages/mcp-adapter/test-s196-native-errors.js
run assembly-unit node --test scripts/runtime/assembly.test.mjs
run typecheck pnpm typecheck
echo "part-a done head=$HEAD_SHA" >> "$OUT/part-a-status.txt"
