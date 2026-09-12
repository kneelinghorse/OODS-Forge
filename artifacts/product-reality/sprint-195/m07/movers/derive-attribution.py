#!/usr/bin/env python3
"""One frozen Sprint195 receipt derivation; writes only this artifact directory."""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[5]
OUT = Path(__file__).resolve().parent
BASE = '5b25c3c9ec795315bf52a698d135c96bffd66393'
HEAD = 'e375f4c2db9fe9644caba87690b91b8ddd71e207'
ENV = {**os.environ, 'GIT_CONFIG_COUNT': '1', 'GIT_CONFIG_KEY_0': 'core.quotePath', 'GIT_CONFIG_VALUE_0': 'false'}
def git(*args, absent=False):
    r = subprocess.run(['git', *args], cwd=ROOT, env=ENV, capture_output=True)
    if absent and r.returncode == 128 and (b'does not exist in' in r.stderr or b'exists on disk, but not in' in r.stderr): return None
    if r.returncode: raise RuntimeError(r.stderr.decode())
    return r.stdout
def digest(data): return hashlib.sha256(data).hexdigest() if data is not None else None
def write(name, value): (OUT / name).write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')
def ref(file):
    file = Path(file)
    return {'path': file.relative_to(ROOT).as_posix(), 'sha256': digest(file.read_bytes())}
def chunks(data): return re.split(r'(?=^diff --git )', data.decode(), flags=re.M)
def file_patch(data, file):
    found = [s for s in chunks(data) if s.startswith(f'diff --git a/{file} b/{file}\n')]
    assert len(found) <= 1, file
    return found[0] if found else None
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
 's195-m01': 'Remove stale retired-tool references and align live bridge/adapter rosters with the delivered 19+5 tool surface; retain the historical source only as evidence.',
 's195-m02': 'Add source-derived visualization taxonomy and expose its bounded public coverage summary through health, keeping typed family gaps explicit.',
 's195-m03': 'Expose exact authored pattern identities through source-faithful translation, typed authoring-only reasons, measured pattern census and schema/provenance checks.',
 's195-m04': 'Grade supplied ECharts operands with data-level accuracy, accessibility and determinism rules, preserving failing bubble verdicts and spec-only uncertified limits.',
 's195-m05': 'Qualify minimal categorical palette hue changes and preserve raw HC system colours; admit measured HC charts and retain typed renderer deferrals, with explicit golden migration.',
 's195-m06': 'Place authored Invoice bar and Usage line SVGs in detail/dashboard React/Vue generation while preserving existing content and area behavior; fail missing-palette measurement honestly and retain soak/ECharts/HTML limits.',
 's195-m07': 'Bind the bounded Sprint195 closeout, current runtime pointer, public source inventory, tool census and CI proof; repair generated trait type names and validate the frozen source before fresh runtime qualification.',
}
PREFIX_MISSIONS = {
 '943d2562': 's195-m07', 'c36eadc5': 's195-m07',
 '5f71d081': 's195-m01', 'ffcdc29e': 's195-m02', '86736ca4': 's195-m02',
 'b8f4220f': 's195-m03', 'a10afdff': 's195-m03',
 '86b44639': 's195-m04', '9c75a1db': 's195-m04',
 '52b0da99': 's195-m05', '3c8a7a56': 's195-m05', '22c674c5': 's195-m05',
 'a3158282': 's195-m06', 'c6453c97': 's195-m06', '38eb20c4': 's195-m06',
 '833aaea2': 's195-m07', 'e375f4c2': 's195-m07',
}
EVIDENCE = {
 's195-m01': ['m01/gate/verification.json', 'm01/verification.json', 'm01/gate/retirement-gate-green.log'],
 's195-m02': ['m02/integration-results.json', 'm02/taxonomy/verification.json', 'm02/health/verification.json'],
 's195-m03': ['m03/integration-results.json', 'm03/patterns/verification.json', 'm03/patterns/focused-and-portable.log'],
 's195-m04': ['m04/integration-results.json', 'm04/bite/accuracy-bite.json'],
 's195-m05': ['m05/integration-results.json', 'm05/hc/verification.json', 'm05/golden-migration/golden-attribution.json'],
 's195-m06': ['m06/integration-results.json', 'm06/runtime-verification.json', 'm06/bites/verification.json'],
 's195-m07': ['m07/pre-freeze/report.json', 'm07/pre-freeze/targeted-check-executions.json', 'm07/producer/verification.json', 'm07/pre-freeze/tool-ledger.json'],
}
def evidence(missions):
    return [ref(ROOT / 'artifacts/product-reality/sprint-195' / p) for m in missions for p in EVIDENCE[m]]
def reasons(missions): return ' '.join(f'{m}: {CAUSES[m]}' for m in missions)

report = json.loads((OUT / 'sprint-wide-movers.json').read_text())
assert report['s195']['base'] == BASE and report['s195']['head'] == HEAD
scope = report['publicScope']
command = ['diff', '--no-ext-diff', '--no-renames', '--unified=0', BASE, HEAD, '--', *scope]
raw = git(*command)
(OUT / 'advertised.patch').write_bytes(raw)
write('patch-command.json', {'base': BASE, 'head': HEAD, 'command': ['git', *command], 'processEnvironment': {k: ENV[k] for k in ['GIT_CONFIG_COUNT', 'GIT_CONFIG_KEY_0', 'GIT_CONFIG_VALUE_0']}})
(OUT / 'commit-diffs').mkdir(exist_ok=True)
(OUT / 'blame').mkdir(exist_ok=True)
commits = git('rev-list', '--reverse', '--first-parent', f'{BASE}..{HEAD}').decode().splitlines()
commit_info = {}
for commit in commits:
    mission = PREFIX_MISSIONS[commit[:8]]
    parent = git('rev-parse', f'{commit}^1').decode().strip()
    delta = git('diff', '--no-ext-diff', '--no-renames', '--unified=0', parent, commit, '--', *scope)
    file = OUT / 'commit-diffs' / f'{commit}.patch'; file.write_bytes(delta)
    commit_info[commit] = {'commit': commit, 'parent': parent, 'missionId': mission, 'subject': git('show', '-s', '--format=%s', commit).decode().strip(), 'cause': CAUSES[mission], 'patch': ref(file), 'evidence': evidence([mission])}
rows = []
unresolved = []
for file_index, file in enumerate(report['s195']['publicPaths']):
    if file_index % 10 == 0: print(f'Attributing {file_index + 1}/{len(report["s195"]["publicPaths"])}: {file}', flush=True)
    patch = file_patch(raw, file); assert patch, file
    changes = hunks(patch)
    before = git('show', f'{BASE}:{file}', absent=True)
    after = git('show', f'{HEAD}:{file}', absent=True)
    records = [{'text': text, 'baseLine': n + 1, 'commit': None} for n, text in enumerate((before or b'').decode().splitlines(keepends=True))]
    removed = {}
    touched = []
    for commit, info in commit_info.items():
        delta = (ROOT / info['patch']['path']).read_bytes()
        fp = file_patch(delta, file)
        if fp is None: continue
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
write('attribution.json', {'base': BASE, 'head': HEAD, 'builderSelfCertified': False, 'unattributedPaths': [], 'patch': ref(OUT / 'advertised.patch'), 'command': ref(OUT / 'patch-command.json'), 'method': 'Exact full public-scope Git diff; row paths equal the existing mover producer inventory. Each actual hunk appears once in sequence. Line attribution replays actual commit diffs and records final Git blame. Planning-lock commit maps to m07 scope provenance, not product execution. Earlier mission evidence remains historically qualified.', 'commitMappings': list(commit_info.values()), 'rows': rows, 'alignmentDisclosures': unresolved, 'summary': {'paths': len(rows), 'canonicalPaths': len(report['s195']['canonicalPaths']), 'hunks': sum(len(r['hunks']) for r in rows), 'addedLines': sum(len(h.get('addedLines', [])) for r in rows for h in r['hunks']), 'removedLines': sum(len(h.get('removedLines', [])) for r in rows for h in r['hunks']), 'alignmentDisclosures': len(unresolved)}})
print(json.dumps(json.loads((OUT / 'attribution.json').read_text())['summary'], indent=2))
