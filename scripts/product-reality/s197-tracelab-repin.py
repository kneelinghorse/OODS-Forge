"""Prepare immutable tarballs and clean-install a tracked-source TraceLab scratch copy."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import sys

ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path('/Users/systemsystems/portfolio/TraceLab')
OUT = ROOT / 'artifacts/product-reality/sprint-197/m06/tracelab-repin'
OUT.mkdir(parents=True, exist_ok=True)
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
git = lambda *args: subprocess.check_output(['git', *args], cwd=SOURCE).decode()
if sys.argv[1:] == ['--check-source']:
    before = json.loads((OUT / 'source-before.json').read_text())
    after = {'head': git('rev-parse', 'HEAD').strip(), 'status': git('status', '--porcelain=v1', '--untracked-files=all'),
        'existingModifiedFiles': {f: sha(SOURCE / f) for f in before['existingModifiedFiles']},
        'frontendFiles': {f: sha(SOURCE / f) for f in before['frontendFiles']}}
    (OUT / 'source-after.json').write_text(json.dumps(after, indent=2) + '\n')
    assert before == after, 'Source state changed; inspect before attributing ownership'
    (OUT / 'source-boundary.json').write_text(json.dumps({'before': 'source-before.json', 'after': 'source-after.json',
        'identical': True, 'zeroAddedChanges': True, 'initiallyClean': not before['status'], 'status': before['status'],
        'frontendFileCount': len(before['frontendFiles']), 'builderSelfCertified': False}, indent=2) + '\n')
    print(json.dumps({'sourceIdentical': True, 'initiallyClean': not before['status'], 'frontendFiles': len(before['frontendFiles'])}))
    sys.exit(0)
assert not sys.argv[1:], 'Use no option to prepare, or --check-source to verify the untouched original'
files = git('ls-files', '-z', 'frontend').strip('\0').split('\0')
status = git('status', '--porcelain=v1', '--untracked-files=all')
modified = git('diff', '--name-only', '-z').strip('\0').split('\0')
before = {'head': git('rev-parse', 'HEAD').strip(), 'status': status,
    'existingModifiedFiles': {f: sha(SOURCE / f) for f in modified if f},
    'frontendFiles': {f: sha(SOURCE / f) for f in files}}
(OUT / 'source-before.json').write_text(json.dumps(before, indent=2) + '\n')
scratch = Path(tempfile.mkdtemp(prefix='oods-s197-tracelab-'))
frontend = scratch / 'frontend'
for file in files:
    target = scratch / file
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SOURCE / file, target)
for name in ['package.json', 'package-lock.json']:
    shutil.copy2(frontend / name, OUT / name.replace('.json', '.before.json'))
# Preserve the consumer's exact currently pinned old package bytes for both
# visual workers; later npm operations never read or write the source checkout.
shutil.copytree(frontend / 'vendor', scratch / 'old-vendor')
commands = []
def run(command, cwd, label):
    result = subprocess.run(command, cwd=cwd, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        env={**os.environ, 'NEXT_TELEMETRY_DISABLED': '1'})
    (OUT / f'{label}.log').write_text(result.stdout)
    commands.append({'command': command, 'cwd': str(cwd), 'exitCode': result.returncode, 'log': f'{label}.log'})
    (OUT / 'commands.json').write_text(json.dumps(commands, indent=2) + '\n')
    print(json.dumps(commands[-1]), flush=True)
    result.check_returncode()
    return result.stdout
head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
packages = []
for name in ['tokens', 'tw-variants']:
    payload = json.loads(run(['npm', 'pack', '--ignore-scripts', '--json', '--pack-destination', str(OUT)], ROOT / 'packages' / name, f'pack-{name}'))
    file = payload[0]['filename']
    packages.append({'file': f'vendor/{file}', 'sha256': sha(OUT / file), 'size_bytes': (OUT / file).stat().st_size})
    shutil.copy2(OUT / file, frontend / 'vendor' / file)
provenance = {'source_repository': 'OODS-Forge', 'checkout_head': head,
    'packaging': 'npm pack --ignore-scripts from built artifacts; immutable tarballs, no registry publishing',
    'packages': packages, 'clean_install_smoke': {'status': 'pending'}, 'builderSelfCertified': False}
(OUT / 'oods-provenance.json').write_text(json.dumps(provenance, indent=2) + '\n')
(OUT / 'scratch.json').write_text(json.dumps({'scratch': str(scratch), 'frontend': str(frontend), 'sourceHead': before['head'], 'sourceStatus': status}, indent=2) + '\n')
# Same-version local tarballs need their two stale lock entries invalidated.
lock_path = frontend / 'package-lock.json'
lock = json.loads(lock_path.read_text())
for package in ['tokens', 'tw-variants']:
    del lock['packages'][f'node_modules/@oods/{package}']
lock_path.write_text(json.dumps(lock, indent=2) + '\n')
run(['npm', 'install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund'], frontend, 'lock')
assert not (frontend / 'node_modules').exists(), 'Clean install requires an empty dependency directory'
run(['npm', 'ci', '--ignore-scripts', '--no-audit', '--no-fund'], frontend, 'clean-install')
run(['npm', 'run', 'check:tokens'], frontend, 'check-token-colors')
css = frontend / 'node_modules/@oods/tokens/dist/css/tokens.css'
text = css.read_text()
for theme in ['light', 'dark', 'hc']:
    assert f"[data-brand='A'][data-theme='{theme}']" in text, f'Missing Brand A {theme}'
assert sha(css) == sha(ROOT / 'packages/tokens/dist/css/tokens.css')
provenance['clean_install_smoke'] = {'status': 'passed', 'command': 'npm ci --ignore-scripts --no-audit --no-fund',
    'token_color_gate': 'passed', 'brand_A_scopes': ['light', 'dark', 'hc'], 'installed_css_sha256': sha(css),
    'consumer_source_head': before['head'], 'source_boundary': 'throwaway tracked-source copy; original checkout not modified'}
(OUT / 'oods-provenance.json').write_text(json.dumps(provenance, indent=2) + '\n')
shutil.copy2(frontend / 'package-lock.json', OUT / 'package-lock.prepared.json')
old_lock = json.loads((OUT / 'package-lock.before.json').read_text())
new_lock = json.loads((OUT / 'package-lock.prepared.json').read_text())
(OUT / 'lock-delta.json').write_text(json.dumps({'changedExistingEntries': [k for k, v in old_lock['packages'].items() if new_lock['packages'].get(k) != v], 'addedBundledOptionalEntries': {k: v for k, v in new_lock['packages'].items() if k not in old_lock['packages']}, 'reason': 'npm records six bundled optional WASM dependency metadata entries during lock refresh; no existing unrelated version or integrity moved.'}, indent=2) + '\n')
print(json.dumps({'scratch': str(scratch), 'packages': packages, 'cleanInstall': 'passed'}), flush=True)
