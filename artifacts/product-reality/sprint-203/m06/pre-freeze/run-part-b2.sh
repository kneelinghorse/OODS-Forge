#!/bin/zsh
# s203-m06 pre-freeze pass, part B2: the frozen bundle from the committed head (server and bridge dists rebuilt there, because a
# version records the server's own build stamp), its E2E with the MCP Apps resources, then the Linux container proof from the same
# archive. --final refuses a dirty tree, so every log is written outside the worktree and copied in once the archive exists.
set -u
W=/Users/systemsystems/.codex/worktrees/s203/OODS-Forge
S=/private/tmp/claude-501/-Users-systemsystems-portfolio-Design-Tools-OODS-Forge/a1e0c282-eb9d-458d-9f0e-3aa3be516fb4/scratchpad/m06
F=$S/bundle
C=forge-s197-playwright
OUT=$W/artifacts/product-reality/sprint-203/m06/pre-freeze
cd $W
HEAD_SHA=$(git rev-parse HEAD)
rm -rf $F; mkdir -p $F/logs
step() { echo "$1 exit=$2 at=$(date -u +%Y-%m-%dT%H:%M:%SZ) head=$HEAD_SHA" >> $F/logs/status.txt; }
clean() { [ -z "$(git status --porcelain=v1 --untracked-files=all)" ]; }
clean || { echo "dirty tree before builds" >> $F/logs/status.txt; git status --short >> $F/logs/status.txt; exit 1; }

pnpm --filter @oods/mcp-server run build > $F/logs/server-build.log 2>&1; c=$?; step server-build $c; [ $c -eq 0 ] || exit 1
pnpm --filter @oods/mcp-bridge run build > $F/logs/bridge-build.log 2>&1; c=$?; step bridge-build $c; [ $c -eq 0 ] || exit 1
clean || { echo "builds dirtied the tree" >> $F/logs/status.txt; git status --short >> $F/logs/status.txt; exit 1; }

node scripts/runtime/assemble.mjs --out-dir $F/out --work-dir $F/work --final > $F/logs/portable-assemble.log 2>&1; c=$?; step portable-assemble $c; [ $c -eq 0 ] || exit 1
mkdir -p $F/extract && tar -xzf $F/out/forge-runtime.tar.gz -C $F/extract; step extract $?
node scripts/runtime/e2e.mjs --extract-dir $F/extract --repo-root $W > $F/logs/e2e-host.json 2> $F/logs/portable-e2e.stderr.log; step portable-e2e $?

# Linux: the same archive in the pinned container, no repository.
{
  echo "image $(docker inspect --format '{{.Image}}' $C)"
  echo "config-image $(docker inspect --format '{{.Config.Image}}' $C)"
  echo "node $(docker exec $C node --version)"
  echo "uname $(docker exec $C uname -m)"
} > $F/logs/linux-environment.txt 2>&1
docker exec $C sh -c 'rm -rf /tmp/forge-s203-m06 && mkdir -p /tmp/forge-s203-m06/extract' >> $F/logs/linux-commands.log 2>&1
docker cp $F/out/forge-runtime.tar.gz $C:/tmp/forge-s203-m06/forge-runtime.tar.gz >> $F/logs/linux-commands.log 2>&1
docker exec $C sha256sum /tmp/forge-s203-m06/forge-runtime.tar.gz >> $F/logs/linux-commands.log 2>&1
docker exec $C tar -xzf /tmp/forge-s203-m06/forge-runtime.tar.gz -C /tmp/forge-s203-m06/extract >> $F/logs/linux-commands.log 2>&1
docker cp $W/scripts/product-reality/s202-linux-preview-proof.mjs $C:/tmp/forge-s203-m06/s202-linux-preview-proof.mjs >> $F/logs/linux-commands.log 2>&1
docker exec -w /tmp/forge-s203-m06 $C node s202-linux-preview-proof.mjs /tmp/forge-s203-m06/extract > $F/logs/linux-preview-proof.json 2> $F/logs/linux-preview-proof.stderr.log; step linux-preview-proof $?

# Receipts into the worktree, now that the archive is assembled.
mkdir -p $OUT/linux
cp $F/logs/e2e-host.json $OUT/e2e-host.json
cp $F/logs/portable-assemble.log $OUT/portable-assemble.log
cp $F/logs/server-build.log $OUT/server-build.log
cp $F/logs/bridge-build.log $OUT/bridge-build.log
cp $F/out/forge-runtime.manifest.json $OUT/portable-manifest.json
cp $F/out/forge-runtime.tar.gz.sha256 $OUT/portable-archive.sha256
[ -s $F/logs/portable-e2e.stderr.log ] && cp $F/logs/portable-e2e.stderr.log $OUT/portable-e2e.stderr.log
cp $F/logs/linux-preview-proof.json $OUT/linux/preview-proof.json
cp $F/logs/linux-environment.txt $OUT/linux/environment.txt
cp $F/logs/linux-commands.log $OUT/linux/commands.log
[ -s $F/logs/linux-preview-proof.stderr.log ] && cp $F/logs/linux-preview-proof.stderr.log $OUT/linux/preview-proof.stderr.log
cat $F/logs/status.txt >> $OUT/part-b-status.txt
echo "part-b2 done head=$HEAD_SHA" >> $OUT/part-b-status.txt
