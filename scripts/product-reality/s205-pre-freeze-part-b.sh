#!/bin/zsh
# Sprint 205 pre-freeze, part B (Sprint 204's, with this sprint's paths) — run alone, after part A, because it rebuilds packages.
#
#   zsh scripts/product-reality/s205-pre-freeze-part-b.sh gates     # B1: viz:gate, then every on-demand gate in the roster
#   zsh scripts/product-reality/s205-pre-freeze-part-b.sh bundle    # B2: the frozen bundle from the COMMITTED head, its E2E, the Linux proof
#
# B2 follows Sprint 203's shape: the server and bridge dists are rebuilt at the committed head first, because a
# composition version records the server's own build stamp; `assemble --final` refuses a dirty tree, so its logs
# are written to the scratch directory given as $2 (default: /tmp is NOT used — pass the session scratchpad) and
# copied into the worktree only once the archive exists. The Linux proof runs the same archive in the pinned
# container, with no repository.
set -u
cd "${FORGE_ROOT:-$(git rev-parse --show-toplevel)}"
W=$(pwd)
OUT=$W/artifacts/product-reality/sprint-205/m06/pre-freeze
mkdir -p "$OUT"
HEAD_SHA=$(git rev-parse HEAD)
C=forge-s197-playwright

case "${1:-}" in
  gates)
    step() { echo "$1 exit=$2 at=$(date -u +%Y-%m-%dT%H:%M:%SZ) head=$HEAD_SHA" >> "$OUT/part-b-status.txt"; }
    pnpm viz:gate > "$OUT/viz-gate.log" 2>&1; step viz-gate $?
    node scripts/product-reality/run-on-demand-gates.mjs --output-root "$OUT/on-demand-gates" > "$OUT/on-demand-gates.log" 2>&1; step on-demand-gates $?
    ;;
  bundle)
    S=${2:?pass a scratch directory outside the worktree for the build logs}
    F=$S/bundle
    rm -rf "$F"; mkdir -p "$F/logs"
    step() { echo "$1 exit=$2 at=$(date -u +%Y-%m-%dT%H:%M:%SZ) head=$HEAD_SHA" >> "$F/logs/status.txt"; }
    clean() { [ -z "$(git status --porcelain=v1 --untracked-files=all)" ]; }
    clean || { echo "dirty tree before builds" >> "$F/logs/status.txt"; git status --short >> "$F/logs/status.txt"; exit 1; }

    pnpm --filter @oods/mcp-server run build > "$F/logs/server-build.log" 2>&1; c=$?; step server-build $c; [ $c -eq 0 ] || exit 1
    pnpm --filter @oods/mcp-bridge run build > "$F/logs/bridge-build.log" 2>&1; c=$?; step bridge-build $c; [ $c -eq 0 ] || exit 1
    clean || { echo "builds dirtied the tree" >> "$F/logs/status.txt"; git status --short >> "$F/logs/status.txt"; exit 1; }

    node scripts/runtime/assemble.mjs --out-dir "$F/out" --work-dir "$F/work" --final > "$F/logs/portable-assemble.log" 2>&1; c=$?; step portable-assemble $c; [ $c -eq 0 ] || exit 1
    mkdir -p "$F/extract" && tar -xzf "$F/out/forge-runtime.tar.gz" -C "$F/extract"; step extract $?
    node scripts/runtime/e2e.mjs --extract-dir "$F/extract" --repo-root "$W" > "$F/logs/e2e-host.json" 2> "$F/logs/portable-e2e.stderr.log"; step portable-e2e $?

    # Linux: the same archive in the pinned container, no repository.
    docker start $C > /dev/null 2>&1
    {
      echo "image $(docker inspect --format '{{.Image}}' $C)"
      echo "config-image $(docker inspect --format '{{.Config.Image}}' $C)"
      echo "node $(docker exec $C node --version)"
      echo "uname $(docker exec $C uname -m)"
    } > "$F/logs/linux-environment.txt" 2>&1
    docker exec $C sh -c 'rm -rf /tmp/forge-s205-m06 && mkdir -p /tmp/forge-s205-m06/extract' >> "$F/logs/linux-commands.log" 2>&1
    docker cp "$F/out/forge-runtime.tar.gz" $C:/tmp/forge-s205-m06/forge-runtime.tar.gz >> "$F/logs/linux-commands.log" 2>&1
    docker exec $C sha256sum /tmp/forge-s205-m06/forge-runtime.tar.gz >> "$F/logs/linux-commands.log" 2>&1
    docker exec $C tar -xzf /tmp/forge-s205-m06/forge-runtime.tar.gz -C /tmp/forge-s205-m06/extract >> "$F/logs/linux-commands.log" 2>&1
    docker cp "$W/scripts/product-reality/s202-linux-preview-proof.mjs" $C:/tmp/forge-s205-m06/s202-linux-preview-proof.mjs >> "$F/logs/linux-commands.log" 2>&1
    docker exec -w /tmp/forge-s205-m06 $C node s202-linux-preview-proof.mjs /tmp/forge-s205-m06/extract > "$F/logs/linux-preview-proof.json" 2> "$F/logs/linux-preview-proof.stderr.log"; step linux-preview-proof $?

    # Receipts into the worktree, now that the archive is assembled.
    mkdir -p "$OUT/linux"
    cp "$F/logs/e2e-host.json" "$OUT/e2e-host.json"
    cp "$F/logs/portable-assemble.log" "$OUT/portable-assemble.log"
    cp "$F/logs/server-build.log" "$OUT/server-build.log"
    cp "$F/logs/bridge-build.log" "$OUT/bridge-build.log"
    cp "$F/out/forge-runtime.manifest.json" "$OUT/portable-manifest.json"
    cp "$F/out/forge-runtime.tar.gz.sha256" "$OUT/portable-archive.sha256"
    [ -s "$F/logs/portable-e2e.stderr.log" ] && cp "$F/logs/portable-e2e.stderr.log" "$OUT/portable-e2e.stderr.log"
    cp "$F/logs/linux-preview-proof.json" "$OUT/linux/preview-proof.json"
    cp "$F/logs/linux-environment.txt" "$OUT/linux/environment.txt"
    cp "$F/logs/linux-commands.log" "$OUT/linux/commands.log"
    [ -s "$F/logs/linux-preview-proof.stderr.log" ] && cp "$F/logs/linux-preview-proof.stderr.log" "$OUT/linux/preview-proof.stderr.log"
    cat "$F/logs/status.txt" >> "$OUT/part-b-status.txt"
    echo "part-b bundle done head=$HEAD_SHA" >> "$OUT/part-b-status.txt"
    ;;
  *) echo "usage: s205-pre-freeze-part-b.sh gates | bundle <scratch-dir>" >&2; exit 2 ;;
esac
