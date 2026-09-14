"""Capture completed GitHub runs without substituting local checks for CI."""
from pathlib import Path
import hashlib
import json
import subprocess
import sys

root = Path(__file__).resolve().parents[5]
output = root / 'artifacts/product-reality/sprint-198/m07/ci'
expected_head, *run_ids = sys.argv[1:]
assert len(expected_head) == 40 and run_ids
required = {
    'a11y-contract', 'build', 'component-packages', 'coverage', 'diagnostics-schema',
    'guardrails-check', 'lint', 'portable-runtime (20.11.1)', 'portable-runtime (24)',
    'product-reality-consumers', 'release-runtime', 'runtime-cells', 'scale-determinism',
    'tenancy-matrix', 'tokens-governance (A)', 'tokens-governance (B)', 'tokens-validate',
    'typecheck', 'viz-determinism', 'vr-test',
}
def gh(*args):
    return subprocess.check_output(['gh', *args], cwd=root)

pr_bytes = gh('pr', 'view', '109', '--json', 'baseRefName,headRefName,headRefOid,isDraft,number,url,labels')
pr = json.loads(pr_bytes)
assert pr['baseRefName'] == 'OODS-pro' and pr['headRefOid'] == expected_head
assert 'token-change:breaking' in [row['name'] for row in pr['labels']]
records = [(run_id, gh('run', 'view', run_id, '--json', 'databaseId,status,conclusion,headSha,jobs,url,createdAt,updatedAt,event')) for run_id in run_ids]
assert all(json.loads(raw)['status'] == 'completed' for _, raw in records), 'Do not capture an unfinished run as final CI.'
accepted = [json.loads(raw) for _, raw in records if json.loads(raw)['headSha'] == expected_head and json.loads(raw)['conclusion'] == 'success']
assert len(accepted) == 1, 'One exact-head green run is required.'
jobs = accepted[0]['jobs']
assert len(jobs) == len({row['name'] for row in jobs})
assert {row['name'] for row in jobs if row['name'] != 'echarts-render-soak'} == required
assert all(row['status'] == 'completed' and (row['conclusion'] == 'success' or (row['name'] == 'echarts-render-soak' and row['conclusion'] == 'skipped')) for row in jobs)
output.mkdir(exist_ok=True)
def retain(name, raw):
    file = output / name
    assert not file.exists() or file.read_bytes() == raw, f'Refuse to replace an earlier receipt: {file}'
    file.write_bytes(raw)
    return {'path': str(file.relative_to(root)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

pr_receipt = retain('pr-109-captured.json', pr_bytes)
runs = []
for run_id, raw in records:
    data = json.loads(raw)
    if data['headSha'] == expected_head and data['conclusion'] == 'success':
        disposition = 'All 20 required jobs passed at the captured PR head; optional echarts-render-soak was not run. This is the CI execution identity, not the later evidence commit.'
    elif data['headSha'] == expected_head and data['conclusion'] == 'cancelled':
        disposition = 'A later CI run at the same commit superseded this run. Its completed jobs retain their individual outcomes; cancelled jobs supply no final acceptance. The complete raw job list is retained.'
    elif run_id == '34799493244':
        disposition = 'Coverage, product-reality-consumers and viz-determinism completed with contract failures. The later corrected push cancelled the remaining runtime job. Original failures are retained; the source and test corrections are documented in preparation/ci-correction.json, with 143 passing focused checks and 174 passing pre-freeze contracts. No red job is replaced by a local receipt.'
    elif run_id == '34798798885':
        disposition = 'Superseded by the Plan form correction; GitHub cancelled the unfinished run on the next push. This run supplies no final CI acceptance.'
    else:
        raise AssertionError(f'Unattributed run: {run_id}')
    runs.append({'runId': int(run_id), 'headSha': data['headSha'], 'conclusion': data['conclusion'], 'receipt': retain(f'run-{run_id}.json', raw), 'disposition': disposition})
verification = {'pr': pr, 'prReceipt': pr_receipt, 'runs': runs, 'requiredJobs': sorted(required),
                'reviewStatus': 'BUILT, REVIEW PENDING', 'builderSelfCertified': False,
                'certificationAuthorized': False, 'finalEvidenceHeadCheck': 'The final pushed evidence commit must also finish all required CI jobs; its actual run/head are recorded in CMOS and the completion response.'}
retain('verification.json', (json.dumps(verification, indent=2) + '\n').encode())
print(json.dumps({'head': expected_head, 'run': accepted[0]['databaseId'], 'requiredPassed': len(required), 'optionalSkipped': [row['name'] for row in jobs if row['conclusion'] == 'skipped']}))
