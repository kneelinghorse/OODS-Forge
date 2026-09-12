#!/usr/bin/env python3
"""One frozen Sprint196 receipt derivation; writes only this artifact directory."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[5]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output-dir', type=Path, default=Path(__file__).resolve().parent)
OUT = parser.parse_args().output_dir.resolve()
BASE = '1d100e20bcc0911031192406625357638adecbe5'
HEAD = json.loads((OUT / 'sprint-wide-movers.json').read_text())['s196']['head']
ENV = dict(os.environ)
def git(*args, absent=False):
    r = subprocess.run(['git', '--literal-pathspecs', *args], cwd=ROOT, env=ENV, capture_output=True)
    if absent and r.returncode == 128 and (b'does not exist in' in r.stderr or b'exists on disk, but not in' in r.stderr): return None
    if r.returncode: raise RuntimeError(r.stderr.decode())
    return r.stdout
def digest(data): return hashlib.sha256(data).hexdigest() if data is not None else None
def write(name, value): (OUT / name).write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')
def ref(file):
    file = Path(file)
    return {'path': file.relative_to(ROOT).as_posix(), 'sha256': digest(file.read_bytes())}
def hunks(patch):
    result = []
    for block in re.split(r'(?=^@@ )', patch, flags=re.M)[1:]:
        header = block.split('\n')[0]
        m = re.match(r'@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@', header)
        assert m, header
        a, an, b, bn = int(m[1]), int(m[2] or 1), int(m[3]), int(m[4] or 1)
        result.append({'header': header, 'oldStart': a, 'oldCount': an, 'newStart': b, 'newCount': bn, 'patch': block})
    return result

CAUSES = {
 's196-m01': 'Deliver the certified baseline and exact notices, preserve NUL-delimited Git paths and make portable fixture checks execute in CI.',
 's196-m02': 'Ship the bridge, policy, declarations and hash-bound readiness in the bundle; preserve native errors and resolve portable generation/token behavior.',
 's196-m03': 'Measure the three reference applications from extraction, preserve artifact equality and publish the canonical runtime and release ledgers through health.',
 's196-m04': 'Generate component and tool documentation and bind claims, inventory, retirement and CI carriers to executable source.',
 's196-m05': 'Make temporal output UTC-stable with declared golden migration and real doc, bundle and timezone mutation/restore proofs.',
 's196-m06': 'Prepare generated Gate 2 decision facts and protect root publishing without changing package license or public flags.',
 's196-m07': 'Bind current proof, canonical measured ledgers, advertised changes and prepared reconnect through the bounded existing closeout tools; planning provenance is not execution proof.',
}
PREFIX_MISSIONS = {
 '9a7fa9b1':'s196-m07', '6e66d3f7':'s196-m01', 'b70c8f69':'s196-m01', 'd0ae4bdf':'s196-m01',
 '2d80ae01':'s196-m02', 'decba77c':'s196-m02', '2148c93e':'s196-m03', '415c7cc0':'s196-m03', 'd1661992':'s196-m03',
 '944f4dda':'s196-m04', '2a7d0a7c':'s196-m05', '8fd3d04d':'s196-m05', '2bae454a':'s196-m06',
}
EVIDENCE = {
 's196-m01':['m01/verification.json','m01/path/verification.json'],
 's196-m02':['m02/README.md','m02/e2e-clean-node20.json','m02/e2e-clean-node24.json'],
 's196-m03':['m03/README.md','m03/runtime-ledger-migration.json','m03/e2e-node24.json'],
 's196-m04':['m04/verification.json'],
 's196-m05':['m05/verification.json','m05/bites-index.json'],
 's196-m06':['m06/verification.json'],
 's196-m07':['m07/pre-freeze/report.json'],
}
def evidence(missions):
    return [ref(ROOT / 'artifacts/product-reality/sprint-196' / p) for m in missions for p in EVIDENCE[m]]
def reasons(missions): return ' '.join(f'{m}: {CAUSES[m]}' for m in missions)

report = json.loads((OUT / 'sprint-wide-movers.json').read_text())
assert report['s196']['base'] == BASE and report['s196']['head'] == HEAD
scope = report['s196']['publicPaths']
# Only advertised non-test paths participate; include both endpoints of renames.
command = ['diff', '--no-ext-diff', '--no-renames', '--unified=0', BASE, HEAD, '--', *scope]
raw = git(*command)
(OUT / 'advertised.patch').write_bytes(raw)
write('patch-command.json', {'base': BASE, 'head': HEAD, 'command': ['git', '--literal-pathspecs', *command], 'pathHandling': 'Default Git quoting; NUL-delimited no-renames inventories, literal pathspecs and per-file diffs. Test paths excluded from both patch and attribution.'})
(OUT / 'commit-diffs').mkdir(exist_ok=True)
(OUT / 'blame').mkdir(exist_ok=True)
commits = git('rev-list', '--reverse', '--first-parent', f'{BASE}..{HEAD}').decode().splitlines()
commit_info = {}
for commit in commits:
    mission = PREFIX_MISSIONS.get(commit[:8])
    if mission is None:
        git('merge-base', '--is-ancestor', '2bae454ad3094042c9f0113e1ef852c9d440a088', commit)
        mission = 's196-m07'
    parent = git('rev-parse', f'{commit}^1').decode().strip()
    delta = git('diff', '--no-ext-diff', '--no-renames', '--unified=0', parent, commit, '--', *scope)
    file = OUT / 'commit-diffs' / f'{commit}.patch'; file.write_bytes(delta)
    commit_info[commit] = {'commit': commit, 'parent': parent, 'missionId': mission, 'subject': git('show', '-s', '--format=%s', commit).decode().strip(), 'cause': CAUSES[mission], 'patch': ref(file), 'evidence': evidence([mission])}
rows = []
unresolved = []
for file_index, file in enumerate(report['s196']['publicPaths']):
    if file_index % 10 == 0: print(f'Attributing {file_index + 1}/{len(report["s196"]["publicPaths"])}: {file}', flush=True)
    patch = git('diff', '--no-ext-diff', '--no-renames', '--unified=0', BASE, HEAD, '--', file).decode(); assert patch, file
    changes = hunks(patch)
    before = git('show', f'{BASE}:{file}', absent=True)
    after = git('show', f'{HEAD}:{file}', absent=True)
    records = [{'text': text, 'baseLine': n + 1, 'commit': None} for n, text in enumerate((before or b'').decode().splitlines(keepends=True))]
    removed = {}
    touched = []
    for commit, info in commit_info.items():
        fp = git('diff', '--no-ext-diff', '--no-renames', '--unified=0', info['parent'], commit, '--', file).decode()
        if not fp: continue
        touched.append(commit)
        next_bytes = git('show', f'{commit}:{file}', absent=True)
        next_lines = (next_bytes or b'').decode().splitlines(keepends=True)
        new_records, cursor = [], 0
        for h in hunks(fp):
            old_index = h['oldStart'] - 1 if h['oldCount'] else h['oldStart']
            new_index = h['newStart'] - 1 if h['newCount'] else h['newStart']
            new_records.extend(records[cursor:old_index])
            for offset, old in enumerate(records[old_index:old_index + h['oldCount']]):
                if old['baseLine'] is not None:
                    removed[old['baseLine']] = {'commit': commit, 'parent': info['parent'], 'lineAtParent': old_index + offset + 1, 'text': old['text'], 'header': h['header'], 'commitPatch': info['patch']}
            new_records.extend({'text': text, 'baseLine': None, 'commit': commit, 'lineAtIntroduction': new_index + n + 1} for n, text in enumerate(next_lines[new_index:new_index + h['newCount']]))
            cursor = old_index + h['oldCount']
        new_records.extend(records[cursor:])
        assert ''.join(r['text'] for r in new_records) == ''.join(next_lines), (file, commit, 'timeline reconstruction differs')
        records = new_records
    assert touched and ''.join(r['text'] for r in records).encode() == (after or b''), file
    blame_rows, blame_ref = {}, None
    ranges = [h for h in changes if h['newCount']]
    if after is not None and ranges:
        args = ['blame', '--porcelain']
        for h in ranges: args += ['-L', f"{h['newStart']},{h['newStart'] + h['newCount'] - 1}"]
        args += [HEAD, '--', file]
        blame = git(*args); target = OUT / 'blame' / (hashlib.sha256(file.encode()).hexdigest()[:20] + '.txt'); target.write_bytes(blame); blame_ref = ref(target)
        current = None
        for line in blame.decode().splitlines():
            m = re.match(r'^([0-9a-f]{40}) (\d+) (\d+)(?: \d+)?$', line)
            if m: current = {'commit': m[1], 'originalLine': int(m[2]), 'finalLine': int(m[3])}
            elif line.startswith('\t'):
                assert current; blame_rows[current['finalLine']] = {**current, 'text': line[1:]}; current = None
    attributed = []
    for h in changes:
        old_lines, new_lines, exact_commits = [], [], set()
        for n in range(h['oldStart'], h['oldStart'] + h['oldCount']):
            text = (before or b'').decode().splitlines(keepends=True)[n - 1]
            event = removed.get(n)
            if event:
                assert event['text'] == text
                old_lines.append({'baseLine': n, 'text': text, 'removal': event}); exact_commits.add(event['commit'])
            else:
                surviving = [j + 1 for j, r in enumerate(records) if r['baseLine'] == n]
                assert surviving, (file, n)
                old_lines.append({'baseLine': n, 'text': text, 'disposition': 'Survives at final lines; aggregate Git alignment represents this occurrence as removed, so no unique physical deletion commit is asserted.', 'survivingFinalLines': surviving})
                unresolved.append({'path': file, 'header': h['header'], 'baseLine': n, 'kind': 'aggregate-alignment-survival'})
        for n in range(h['newStart'], h['newStart'] + h['newCount']):
            lineage, blamed = records[n - 1], blame_rows[n]
            assert blamed['text'] == lineage['text'].rstrip('\n')
            entry = {'finalLine': n, 'text': lineage['text'], 'gitBlame': blamed}
            if lineage['commit']:
                entry['introduction'] = {'commit': lineage['commit'], 'lineAtCommit': lineage['lineAtIntroduction'], 'commitPatch': commit_info[lineage['commit']]['patch']}; exact_commits.add(lineage['commit'])
            else:
                entry['baseLine'] = lineage['baseLine']; entry['disposition'] = 'Pre-existing line aligned as added in the aggregate diff; no new authorship is asserted.'
            new_lines.append(entry)
        h_commits = [c for c in touched if c in exact_commits] or touched
        missions = sorted({commit_info[c]['missionId'] for c in h_commits})
        attributed.append({**h, 'missions': missions, 'commits': h_commits, 'reason': reasons(missions), 'removedLines': old_lines, 'addedLines': new_lines, 'attributionMethod': 'Actual first-parent Git hunk replay maps introduction/removal occurrences; raw final blame is retained independently. Aggregate alignment exceptions are explicit.'})
    if not attributed:
        missions = sorted({commit_info[c]['missionId'] for c in touched})
        attributed = [{'header': 'file-metadata', 'missions': missions, 'commits': touched, 'reason': reasons(missions), 'patch': patch}]
    missions = sorted({commit_info[c]['missionId'] for c in touched})
    rows.append({'path': file, 'missions': missions, 'commits': touched, 'reason': reasons(missions), 'beforeSha256': digest(before), 'afterSha256': digest(after), 'evidence': evidence(missions), 'filePatchSha256': digest(patch.encode()), 'addedLineBlame': blame_ref, 'hunks': attributed})
write('attribution.json', {'base': BASE, 'head': HEAD, 'builderSelfCertified': False, 'unattributedPaths': [], 'patch': ref(OUT / 'advertised.patch'), 'command': ref(OUT / 'patch-command.json'), 'method': 'Exact Git diff over the independently checked public non-test inventory, including both rename endpoints; row paths equal the existing mover producer inventory. Each actual hunk appears once in sequence. Line attribution replays actual commit diffs and records final Git blame. Planning-lock commit maps to m07 scope provenance, not product execution. Earlier mission evidence remains historically qualified.', 'commitMappings': list(commit_info.values()), 'rows': rows, 'alignmentDisclosures': unresolved, 'summary': {'paths': len(rows), 'canonicalPaths': len(report['s196']['canonicalPaths']), 'hunks': sum(len(r['hunks']) for r in rows), 'addedLines': sum(len(h.get('addedLines', [])) for r in rows for h in r['hunks']), 'removedLines': sum(len(h.get('removedLines', [])) for r in rows for h in r['hunks']), 'alignmentDisclosures': len(unresolved)}})
print(json.dumps(json.loads((OUT / 'attribution.json').read_text())['summary'], indent=2))
