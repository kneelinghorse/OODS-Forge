#!/bin/bash
# Default: validate the exact rollback operands. Execute only with --execute.
set -euo pipefail
forge_root=/Users/systemsystems/portfolio/Design-Tools/OODS-Forge
forge_backup=/Users/systemsystems/.codex/backups/forge-s188-m01-20260908T0256Z
cd "$forge_root"
python3 - <<'PY'
import hashlib,json,subprocess
from pathlib import Path
root=Path.cwd()
backup=Path('/Users/systemsystems/.codex/backups/forge-s188-m01-20260908T0256Z')
manifest=json.loads((backup/'hashes.json').read_text())
for group in ['store','builtFiles']:
    for rel,sha in manifest[group].items():
        path=backup/'schemas'/rel if group=='store' else backup/rel
        assert hashlib.sha256(path.read_bytes()).hexdigest()==sha, str(path)
assert subprocess.check_output(['git','status','--porcelain'],text=True)=='', 'Checkout changed: reconcile first'
subprocess.run(['git','cat-file','-e','7ad4dacba7ed41741ea176ef4c3ef15f8b049f6f^{commit}'],check=True)
expected=json.loads((root/'artifacts/product-reality/sprint-187/m05/delivery-final/recomposition.json').read_text())['successorHashes']
store=root/'packages/mcp-server/.oods/schemas'
actual={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in store.iterdir() if p.is_file()}
assert actual==expected, 'Store has subsequent edits: reconcile before restoring'
print('Rollback preflight passed: backup hashes, previous commit, clean checkout, unchanged adopted store.')
PY
if [[ "${1:---check}" == --check ]]; then exit 0; fi
[[ "$1" == --execute ]]
pm2 stop oods-forge-bridge
if lsof -nP -iTCP:4466 -sTCP:LISTEN; then
  echo 'Listener remains; stopped before restoring.' >&2
  exit 1
fi
git switch --detach 7ad4dacba7ed41741ea176ef4c3ef15f8b049f6f
pnpm install --frozen-lockfile
pnpm run build:tokens
pnpm run pkg:build
python3 - <<'PY'
import hashlib,json,os,shutil
from pathlib import Path
root=Path.cwd()
backup=Path('/Users/systemsystems/.codex/backups/forge-s188-m01-20260908T0256Z')
manifest=json.loads((backup/'hashes.json').read_text())
for rel in ['packages/mcp-server/dist','packages/mcp-bridge/dist']:
    shutil.rmtree(root/rel)
    shutil.copytree(backup/rel,root/rel)
store=root/'packages/mcp-server/.oods/schemas'
for rel in manifest['store']:
    temp=store/(rel+'.rollback-tmp')
    with temp.open('xb') as f:
        f.write((backup/'schemas'/rel).read_bytes());f.flush();os.fsync(f.fileno())
    os.replace(temp,store/rel)
for group in ['store','builtFiles']:
    for rel,sha in manifest[group].items():
        path=store/rel if group=='store' else root/rel
        assert hashlib.sha256(path.read_bytes()).hexdigest()==sha,str(path)
PY
pm2 restart oods-forge-bridge
pm2 save
curl --fail --silent http://127.0.0.1:4466/health
# Retain a new read-only schema/load receipt. The previous process had HTTP 400;
# this rollback restores that previous build, not a claim that its failure is fixed.
