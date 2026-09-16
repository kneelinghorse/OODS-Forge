#!/bin/zsh
# s203-m06 five-suite capture at the frozen head. Each suite runs alone (root-core goes red under
# parallel scheduling, policy #1833) and writes its own vitest JSON beside its log.
set -u
W=/Users/systemsystems/.codex/worktrees/s203/OODS-Forge
C=$W/artifacts/product-reality/sprint-203/m06/capture/forge-s203-m06-head/run-1
cd $W
mkdir -p $C
HEAD_SHA=$(git rev-parse HEAD)
: > $C/../../status.txt
echo "head=$HEAD_SHA started=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> $C/../../status.txt
run() {
  local id=$1; shift
  local started=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  "$@" --reporter=json --outputFile=$C/$id.vitest.json > $C/$id.log 2>&1
  local code=$?
  echo "$id exit=$code started=$started ended=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> $C/../../status.txt
}
run viz-core pnpm --filter @oods/viz-core exec vitest run
run viz-render pnpm --filter @oods/viz-render exec vitest run
run mcp-server pnpm --filter @oods/mcp-server exec vitest run
run root-core npx vitest run --project core --no-file-parallelism
run component-packages npx vitest run --project components
echo "ended=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> $C/../../status.txt
