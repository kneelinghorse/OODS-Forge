from collections import Counter
from pathlib import Path
import hashlib
import json
import subprocess

ROOT = Path('/Users/systemsystems/.codex/worktrees/s185/OODS-Forge')
FINAL = Path('/tmp/oods-s185-m05-capture-f8d15098/four-suite-closeout/run-1')
OUTPUT = Path(__file__).parent
HEAD = 'f8d15098ba3bfd47231d489d7659027b5c9f50e3'
B1 = '369442d87507b0cba240dd12571cfa974959ac56'
BASELINES = ROOT / 'artifacts/product-reality/sprint-185/m01'
EXCLUDED = {
    'live-workflow-consumers.s184.spec.ts': 4,
    'm06-gate-bites.s184.spec.ts': 1,
    'packed-ported-consumers.s184.spec.ts': 1,
    'emitter-directives.s184.spec.ts': 26,
    'ported-workflow.s184.spec.ts': 5,
    'state-axis.s184.spec.ts': 22,
    'closeout.s184.spec.ts': 10,
    'patch-disposition.s184.spec.ts': 5,
}
EXCLUDED = {'packages/mcp-server/test/product-reality/' + key: value for key, value in EXCLUDED.items()}
STAGE1 = ['packages/mcp-server/test/e2e/action-mappings.e2e.spec.ts',
          'packages/mcp-server/test/e2e/stage1-rollups.e2e.spec.ts']
references = {}

def digest(data):
    return hashlib.sha256(data).hexdigest()

def read(file):
    data = file.read_bytes()
    name = str(file.relative_to(ROOT)) if file.is_relative_to(ROOT) else str(file)
    references[name] = {'path': name, 'sha256': digest(data)}
    return json.loads(data)

def capture(directory, suite):
    receipt = read(directory / (suite + '.json'))
    raw = read(directory / (suite + '.vitest.json'))
    declared = {row['path']: row for row in receipt['vitest']['fileResults']}
    rows = []
    for file in raw['testResults']:
        matches = [name for name in declared if file['name'].endswith('/' + name)]
        assert len(matches) == 1, file['name']
        name = matches[0]
        rows.extend((name, tuple(case['ancestorTitles']), case['title'], case['status'])
                    for case in file['assertionResults'])
    assert len(rows) == receipt['vitest']['tests']['total']
    observed_statuses = Counter(row[3] for row in rows)
    expected_statuses = Counter({key: count for key, count in receipt['vitest']['tests'].items()
                                 if key != 'total' and count})
    assert observed_statuses == expected_statuses
    return receipt, Counter(rows), declared

def skipped(rows):
    return Counter({key: count for key, count in rows.items() if key[3] == 'skipped'})

def named(rows):
    return [{'file': key[0], 'ancestors': list(key[1]), 'title': key[2],
             'status': key[3], 'occurrences': count} for key, count in sorted(rows.items())]

final_native, native, native_files = capture(FINAL, 'mcp-server')
final_root, root, root_files = capture(FINAL, 'root-core')
for receipt, total, passed in [(final_native, 5502, 5486), (final_root, 5896, 5880)]:
    assert receipt['measuredHead'] == HEAD and receipt['exitCode'] == 0
    assert receipt['cleanBefore']['clean'] and receipt['cleanAfter']['clean']
    assert receipt['vitest']['tests'] == {'total': total, 'passed': passed, 'failed': 0, 'skipped': 16, 'todo': 0}
    log_path = FINAL / (receipt['suite'] + '.log')
    log_sha = digest(log_path.read_bytes())
    assert log_sha == receipt['log']['sha256']
    references[str(log_path)] = {'path': str(log_path), 'sha256': log_sha}
assert skipped(native) == skipped(root) and sum(skipped(native).values()) == 16
assert {key[0] for key in skipped(native)} == set(STAGE1)

comparisons = []
heavy_identity_differences = []
native_heavy = Counter({key: count for key, count in native.items() if key[0] in EXCLUDED})
for cohort in ['before', 'after']:
    for run in [1, 2]:
        for suite in ['mcp-server', 'root-core']:
            receipt, rows, files = capture(BASELINES / ('four-suite-baseline-' + cohort) / ('run-' + str(run)), suite)
            all_skips = skipped(rows)
            explicit = Counter({key: count for key, count in all_skips.items() if key[0] in STAGE1})
            assert explicit == skipped(native)
            extra = all_skips - explicit
            if suite == 'mcp-server':
                assert not extra
                heavy = Counter({key: count for key, count in rows.items() if key[0] in EXCLUDED})
                old = named(heavy - native_heavy)
                new = named(native_heavy - heavy)
                assert sum(heavy.values()) == 74 and len(old) == len(new) == 1
                assert old[0]['file'] == new[0]['file'] == 'packages/mcp-server/test/product-reality/ported-workflow.s184.spec.ts'
                assert old[0]['title'] == 'keeps the 109-row baseline separate from the exact eight-row, 24-cell overlay'
                assert new[0]['title'] == 'reads all 24 ported surface cells from the unchanged 109-row baseline denominator'
                assert old[0]['status'] == new[0]['status'] == 'passed'
                assert old[0]['occurrences'] == new[0]['occurrences'] == 1
                heavy_identity_differences.append({'cohort': cohort, 'run': run,
                    'old': old, 'new': new})
            else:
                assert sum(extra.values()) == 22
                assert {key[0] for key in extra} == {'packages/mcp-server/test/product-reality/state-axis.s184.spec.ts'}
                assert files['packages/mcp-server/test/product-reality/state-axis.s184.spec.ts']['status'] == 'failed'
            comparisons.append({'cohort': cohort, 'run': run, 'suite': suite,
                'head': receipt['measuredHead'], 'rawSkippedCount': sum(all_skips.values()),
                'explicitStage1SkippedCount': sum(explicit.values()), 'sameExplicitCaseIdentityStatusMultiset': True,
                'additionalSkippedInFailedStateAxisFile': sum(extra.values())})

retained = []
for file, count in EXCLUDED.items():
    cases = Counter({key: n for key, n in native.items() if key[0] == file})
    assert sum(cases.values()) == count and {key[3] for key in cases} == {'passed'}
    assert file not in root_files
    assert native_files[file]['status'] == 'passed'
    retained.append({'file': file, 'finalNativePassed': count, 'finalNativeFailed': 0,
                     'finalNativeSkipped': 0, 'absentFromFinalRoot': True})
assert sum(row['finalNativePassed'] for row in retained) == 74

prior, _, prior_files = capture(ROOT / 'artifacts/product-reality/sprint-185/m05/four-suite-closeout-attempt-1/run-1', 'root-core')
removed = sorted(set(prior_files) - set(root_files))
added = sorted(set(root_files) - set(prior_files))
assert removed == sorted(EXCLUDED)
config_diff = subprocess.check_output(['git', 'diff', '--unified=0', B1, HEAD, '--', 'vitest.config.ts'], cwd=ROOT, text=True)
added_config = sorted(line.strip()[1:].strip().strip("',") for line in config_diff.splitlines()
                      if line.startswith('+') and 'packages/mcp-server/test/product-reality/' in line)
assert added_config == sorted(EXCLUDED)

sources = []
for file in STAGE1:
    hashes = {head: digest(subprocess.check_output(['git', 'show', head + ':' + file], cwd=ROOT))
              for head in ['1118f436345e160437abfedbe73a19f190a92562', '40a9fe2085259a9160125a36fb39a976bedef982', HEAD]}
    assert len(set(hashes.values())) == 1
    sources.append({'file': file, 'sha256ByHead': hashes, 'unchanged': True})

report = {'status': 'passed', 'scope': 'Read-only audit of completed final MCP and root capture records; no tests or builds executed.',
          'executionHead': HEAD, 'sourceAuditCommand': 'python3 ' + str(Path(__file__)),
          'sourceAuditSha256': digest(Path(__file__).read_bytes()),
          'finalCounts': {'mcp-server': final_native['vitest']['tests'], 'root-core': final_root['vitest']['tests']},
          'skipIdentities': named(skipped(native)), 'baselineComparisons': comparisons,
          'skipSourceBytes': sources, 'retainedNativeFiles': retained,
          'rootCollectionComparison': {'beforeHead': prior['measuredHead'], 'afterHead': HEAD,
              'removedExactlyEight': removed, 'addedFiles': added, 'configAddedExclusions': added_config},
          'heavyCaseIdentityDifferences': heavy_identity_differences,
          'caveats': ['The 16 Stage1 cases remain unexecuted fixture-dependent it.runIf gates; they are not counted as passed.',
              'Each root baseline additionally has 22 skipped entries in a failed state-axis file. They are separate from the 16 explicit Stage1 skips; all22 passed in the final native capture.',
              '73 of the74 retained heavy-case identities match each native baseline literally. The ported-workflow baseline-reader caption changed with the intended baseline fold; the old and replacement case both passed.',
              'Removing eight duplicate files from root selection preserves their native proof; it does not establish that shared-dist packers are safe to run concurrently.'],
          'references': list(references.values())}
(OUTPUT / 'root-native-selection-audit.json').write_text(json.dumps(report, indent=2) + '\n')
summary = 'PASS: final root/native16 explicit skips match all accepted baseline Stage1 sets; all8 excluded files passed74 native cases; exact8 files removed from root selection. Caveats: root baselines had22 additional skipped entries in failed state-axis; one intended heavy-case caption changed.\n'
(OUTPUT / 'root-native-selection-audit.log').write_text(summary)
print(summary, end='')
