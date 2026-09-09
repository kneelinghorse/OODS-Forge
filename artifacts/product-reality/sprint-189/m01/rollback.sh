#!/bin/bash
# Check by default. The delivery session validates this recipe without executing it.
set -euo pipefail
forge_root=/Users/systemsystems/portfolio/Design-Tools/OODS-Forge
forge_receipts=/Users/systemsystems/.codex/worktrees/s189/OODS-Forge/artifacts/product-reality/sprint-189/m01
cd "$forge_root"
python3 - <<'PY'
import hashlib,json,subprocess
from pathlib import Path
root=Path.cwd();receipts=Path('/Users/systemsystems/.codex/worktrees/s189/OODS-Forge/artifacts/product-reality/sprint-189/m01')
b=json.loads((receipts/'before.json').read_text());backup=json.loads((receipts/'backup.json').read_text());base=Path(backup['path'])
assert hashlib.sha256((base/'hashes.json').read_bytes()).hexdigest()==backup['hashesManifestSha256']
for rel,sha in b['builtFiles'].items():
 assert hashlib.sha256((base/rel).read_bytes()).hexdigest()==sha,rel
assert subprocess.check_output(['git','status','--porcelain'],text=True)=='','Reconcile checkout changes first'
assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()=='f4cd1ba3cda3d1d52405582e425ecd6d19890b51','Reconcile subsequent delivery first'
subprocess.run(['git','cat-file','-e',b['head']+'^{commit}'],check=True)
store=root/'packages/mcp-server/.oods/schemas'
assert {str(p.relative_to(store)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(store.rglob('*')) if p.is_file()}==b['store'],'Store changed since delivery'
for command in ['node','pnpm','pm2','lsof']:
 import shutil
 assert shutil.which(command),command
print('Rollback preflight passed: prior commit exists, 802 backup hashes match, primary clean, 17 store hashes unchanged, build tools available.')
PY
if [[ "${1:---check}" == --check ]]; then exit 0; fi
[[ "$1" == --execute ]]
pm2 stop oods-forge-bridge
if lsof -nP -iTCP:4466 -sTCP:LISTEN; then
  echo 'Listener remains; stopped before changing checkout.' >&2
  exit 1
fi
git switch --detach cd8ee986db40e73a3fb9a9f1ec7b7db6de9ca076
pnpm install --frozen-lockfile
pnpm run build:tokens
pnpm --filter @oods/component-contracts run build
pnpm --filter @oods/component-styles run build
pnpm --filter @oods/components-react run build
pnpm --filter @oods/components-vue run build
pnpm --filter @oods/mcp-server run build
pnpm --filter @oods/mcp-bridge run build
pnpm run pkg:build
# tsc does not remove stale files. Restore exact previous compiled bytes after rebuild.
python3 - <<'PY'
import hashlib,json,shutil
from pathlib import Path
root=Path.cwd();backup=Path('/Users/systemsystems/.codex/backups/forge-s189-m01-20260909T0103Z')
for rel in ['packages/mcp-server/dist','packages/mcp-bridge/dist']:
 shutil.rmtree(root/rel);shutil.copytree(backup/rel,root/rel)
for rel,sha in json.loads((backup/'hashes.json').read_text()).items():
 assert hashlib.sha256((root/rel).read_bytes()).hexdigest()==sha,rel
PY
pm2 restart oods-forge-bridge
pm2 save
curl --fail --silent http://127.0.0.1:4466/health
# No schema store mutation or restore is part of this delivery or rollback.
