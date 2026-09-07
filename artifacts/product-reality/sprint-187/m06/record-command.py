"""Retain literal command metadata and hashes; assertions belong to the invoked tool."""
import datetime
import hashlib
import json
import pathlib
import platform
import shlex
import subprocess
import sys

root = pathlib.Path(__file__).resolve().parents[4]
spec_path = pathlib.Path(sys.argv[1])
spec = json.loads(spec_path.read_text())
base = root / spec.get('receiptDirectory', 'artifacts/product-reality/sprint-187/m06/commands')
base.mkdir(parents=True, exist_ok=True)
log = base / (spec['id'] + '.log')
receipt = base / (spec['id'] + '.json')
if log.exists() or receipt.exists():
    raise RuntimeError('Existing command evidence must not be overwritten.')
def ref(file):
    return {'path': str(file), 'sha256': hashlib.sha256((root / file).read_bytes()).hexdigest()}
def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()
record = dict(id=spec['id'], command=shlex.join(spec['argv']), cwd=str(root), host=platform.node(),
              sourceState='worktree', executionHead=subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip(),
              startedAt=now(), inputs=[ref(file) for file in spec.get('inputs', [])])
with log.open('w') as stream:
    result = subprocess.run(spec['argv'], cwd=root, stdout=stream, stderr=subprocess.STDOUT)
record.update(endedAt=now(), exitCode=result.returncode, logs=[ref(log.relative_to(root))],
              outputs=[ref(file) for file in spec.get('outputs', []) if (root / file).exists()])
receipt.write_text(json.dumps(record, indent=2) + '\n')
print(json.dumps({'id': spec['id'], 'exitCode': result.returncode, 'receipt': str(receipt.relative_to(root))}))
sys.exit(result.returncode)
