"""Read-only validation of immutable GitHub receipts; write compact audit evidence only."""
from pathlib import Path
import hashlib, json, re, shutil, subprocess
from datetime import datetime, timezone

root = Path(__file__).resolve().parents[5]
out = Path(__file__).resolve().parent
release = Path('/tmp/forge-s196-ci-34679856153-release')
read = lambda path: json.loads(path.read_text())
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
source_head = '944f4dda5f784e266310978b31f65b3d452e6387'
manifest = read(release/'archive/forge-runtime.manifest.json')
sbom = read(release/'archive/runtime-sbom-lite.json')
ledger = read(release/'release-cells.v1.json')
identity = read(release/'bundle-identity.json')
source_after = read(release/'source-after.json')
merge = read(out/'merge-commit.remote.json')
source = read(out/'source-commit.remote.json')
assert merge['sha'] == manifest['commit'] == ledger['bundleHead'] == identity['bundleHead']
assert merge['parents'][1]['sha'] == source['sha'] == source_head
assert merge['tree']['sha'] == source['tree']['sha']
assert manifest['dirty'] is False
assert manifest['archive']['sha256'] == ledger['archiveSha256'] == identity['archiveSha256']
assert (release/'archive/forge-runtime.tar.gz.sha256').read_text() == f"{ledger['archiveSha256']}  forge-runtime.tar.gz\n"
assert sha(release/'archive/runtime-sbom-lite.json') == manifest['sbomLite']['sha256']
assert len(sbom['packages']) == manifest['thirdPartyCount'] == manifest['sbomLite']['packageCount'] == 283
assert identity['manifestVerified'] is True
assert identity['payload'] == {'algorithm': manifest['payloadTreeDigestAlgorithm'], 'entryCount': manifest['payloadTreeEntryCount'], 'sha256': manifest['payloadTreeSha256']}
for state in [identity['source'], source_after]:
    assert state == {'sourceHead': merge['sha'], 'productSourcesMatch': True, 'ignoredChangedPaths': []}
assert read(release/'validation.json') == {'issues': []}
assert ledger['summary'] == {'cells':42, 'pass':42, 'typedGap':0, 'fail':0}
assert ledger['packCount'] == 1 and ledger['historicalReceiptsUnioned'] is False
expected = {(obj,ctx,framework) for obj in ['User','Organization','Subscription'] for ctx in ['card','detail','form','inline','list','timeline','workflow'] for framework in ['react','vue']}
assert len(ledger['rows']) == len(expected) == 42
assert {(r['object'],r['context'],r['framework']) for r in ledger['rows']} == expected
hashed_gate_artifacts = 0
workflow_accessibility_files = []
parity_comparisons = 0
for row in ledger['rows']:
    assert row['head'] == row['bundleHead'] == merge['sha']
    assert row['archiveSha256'] == ledger['archiveSha256'] and row['runId'] == ledger['runId']
    assert row['status'] == 'pass' and row['hashEqualToHost'] is True
    assert row['hostArtifactHash'] == row['artifactHash'] and re.fullmatch(r'sha256:[a-f0-9]{64}',row['artifactHash'])
    assert read(release/row['report']) == row
    gates = {g['name']:g for g in row['gates']}
    assert all(g['status']=='pass' for g in gates.values())
    assert gates['generation']['detail']['artifactHash'] == row['artifactHash']
    assert {'generation','fresh-exact-tarball-install','strict-typecheck','production-build','mount','accessibility-tree','screenshots'} <= gates.keys()
    for gate in [gates['accessibility-tree']['detail'],*gates['screenshots']['detail']]:
        if 'hash' in gate:
            assert 'sha256:'+sha(release/gate['path']) == gate['hash']
            hashed_gate_artifacts += 1
        else:
            assert row['context'] == 'workflow' and gate['path'].endswith('accessibility-tree.txt')
            assert (release/gate['path']).stat().st_size > 0
            workflow_accessibility_files.append({'path':gate['path'],'sha256':sha(release/gate['path']),'recordedExpectedHash':None})
    parity_root = release/f"workflows/{row['object']}" if row['context'] == 'workflow' else (release/row['report']).parent
    parity = [comparison for comparison in read(parity_root/'parity/generation-comparisons.json') if comparison['framework'] == row['framework']]
    assert parity
    for comparison in parity:
        assert comparison['hashEqualToHost'] is True
        assert comparison['bundleArtifactHash'] == comparison['hostArtifactHash']
        assert comparison['bundleHead'] == merge['sha']
        parity_comparisons += 1
for filename in ['archive/forge-runtime.manifest.json','archive/runtime-sbom-lite.json','archive/forge-runtime.tar.gz.sha256','release-cells.v1.json','bundle-identity.json','source-after.json','validation.json','browser.json']:
    target=out/'release'/filename
    target.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(release/filename,target)
    assert target.read_bytes() == (release/filename).read_bytes()
logs = {name: re.sub(r'\x1b\[[0-9;]*m','',(out/f'{name}-job.log').read_text()) for name in ['release','coverage']}
assert f'"archiveByteSize": {manifest["archive"]["byteSize"]}' in logs['release']
assert f'"archiveSha256": "{manifest["archive"]["sha256"]}"' in logs['release']
assert re.search(r'Tests\s+26 passed\s+\(26\)',logs['release'])
assert re.search(r'Tests\s+7011 passed\s+\|\s+16 skipped\s+\(7027\)',logs['coverage'])
files = {'tests/verification/closeout-checklist.contract.test.ts':8,'tests/verification/runtime-placement-ci.s195.test.ts':3,'tests/verification/generated-docs-ci.s196.test.ts':2}
executed=[]
for path,count in files.items():
    matching=[{'line':i,'text':line} for i,line in enumerate(logs['coverage'].splitlines(),1) if path in line]
    assert len(matching)==1 and f'({count} tests)' in matching[0]['text'] and '✓' in matching[0]['text']
    contents=subprocess.check_output(['git','show',f'{source_head}:{path}'],cwd=root,text=True)
    assert not re.search(r'\b(?:it|test|describe)\.(?:skip|todo)\b',contents)
    executed.append({'path':path,'sourceSha256':hashlib.sha256(contents.encode()).hexdigest(),'passedTests':count,'logEvidence':matching})
artifacts=read(out/'artifacts.json')['artifacts']
release_artifact=next(a for a in artifacts if a['name']=='release-runtime')
coverage_artifact=next(a for a in artifacts if a['name']=='coverage-34679856153')
assert release_artifact['id']==10292973606
runtime=read(out/'runtime-job-latest.json')
verification={'verifiedAt':datetime.now(timezone.utc).isoformat(),'scope':'Read-only downloaded hosted release metadata and actual42 ledger, coverage integration repairs; runtime followthrough separately reported.','runId':34679856153,'runUrl':'https://github.com/kneelinghorse/OODS-Forge/actions/runs/34679856153','builderSelfCertified':False,
'provenance':{'sourceHead':source_head,'executedMergeCommit':merge['sha'],'treeSha':source['tree']['sha'],'treesEqual':True,'sourceIsSecondMergeParent':True},
'release':{'jobId':103516340942,'jobConclusion':read(out/'release-job.json')['conclusion'],'artifact':release_artifact,'originalArchiveMetadataRetained':True,'originalMetadataFiles':['forge-runtime.manifest.json','runtime-sbom-lite.json','forge-runtime.tar.gz.sha256'],'archive':manifest['archive'],'bundleManifestVerifiedByHostedHarness':True,'payload':identity['payload'],'summary':ledger['summary'],'packCount':ledger['packCount'],'runId':ledger['runId'],'allRowsShareHeadArchiveRunId':True,'hostArtifactEqualityCount':42,'parityComparisonCount':parity_comparisons,'independentlyHashedScreenshotsAndAccessibilityTrees':hashed_gate_artifacts,'workflowAccessibilityFilesWithoutDeclaredHashes':workflow_accessibility_files,'hostedContractTests':{'passed':26,'skipped':0},'rawDownloadedTree':str(release)},
'coverage':{'jobId':103516340987,'jobConclusion':read(out/'coverage-job.json')['conclusion'],'artifact':coverage_artifact,'passed':7011,'failed':0,'skipped':16,'filesPassed':620,'filesSkipped':1,'repairedSourceFilesExecuted':executed,'threePreviouslyFailingExpectations':['closeout carrier enumerates release-runtime among19jobs','runtime sweep uses current sprint196 receipt path','runtime validation uses current sprint196 receipt path'],'rawDownloadedTree':'/tmp/forge-s196-ci-34679856153-coverage'},
'runtime':{'jobId':runtime['id'],'status':runtime['status'],'conclusion':runtime['conclusion'],'stepStatuses':[{'name':s['name'],'status':s['status'],'conclusion':s['conclusion']} for s in runtime['steps']]},
'limitations':['Original runtime archive binary is not uploaded; archive byte size and SHA are independently matched across original manifest, checksum sidecar, actual42 ledger, bundle identity, and hosted assembler stdout.','The complete42-cell source and browser tree remains in the downloaded GitHub artifact and local temp directory; selected original metadata and ledger are copied byte-for-byte here.','Coverage has16skipped tests and one skipped file; passing repaired files contain no skipped tests.','No overall CI pass is claimed while runtime or another job remains running.']}
(out/'verification.json').write_text(json.dumps(verification,indent=2)+'\n')
print(json.dumps({'release':verification['release']['summary'],'archive':manifest['archive'],'coverage':{'passed':7011,'skipped':16},'runtime':verification['runtime']['status'],'tree':source['tree']['sha']}))
