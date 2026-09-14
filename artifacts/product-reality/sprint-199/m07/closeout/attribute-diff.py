"""Attribute the frozen Sprint 199 source diff; does not write into the worktree."""
from pathlib import Path
import argparse, hashlib, json, subprocess
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--workspace', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
args=parser.parse_args(); ROOT=args.workspace.resolve(); OUT=args.output.resolve(); OUT.mkdir(parents=True,exist_ok=True)
BASE='b7a96ab0f34d38bdfdf98d128c1886676becde4c'
IMPL='65d1f0a70de517d9e581e7c9b90ba5d08c0035c4'
HEAD='c28e50e3bf3b16e9a043bb2a8a0ab2b95708dba6'
def git(*args): return subprocess.check_output(['git','--literal-pathspecs',*args],cwd=ROOT)
canonical=['configs/agent/policy.json','docs/api','packages/mcp-adapter/tool-descriptions.json','packages/mcp-server/src/schemas','packages/mcp-server/src/security/policy.json','packages/mcp-server/src/tools/registry.json']
excluded=['artifacts/product-reality/sprint-199/','cmos/db/']
missions={
 '6b7dd54cd':'planning','e001bfeac':'s199-m01','2a0f3c63b':'s199-m02','7b7bb651e':'s199-m03',
 '1d4213a81':'s199-m04','b5b1294e9':'s199-m05','2a8b0a50e':'s199-m06',
 '49005987e':'s199-m07','65d1f0a70':'s199-m07','d28add31b':'s199-m07','c28e50e3b':'s199-m07'}
reasons={
 'planning':'Locked sprint scope and roadmap; planning-only DB backup removal is outside the advertised source inventory.',
 's199-m01':'Fix address replacement, classification filtering and Mission identity; establish local chart gate and sprint-parametric migration.',
 's199-m02':'Remove unused timezone metadata, settle soak and Cartesian limits, and generate per-scope coverage.',
 's199-m03':'Preserve complete pattern scenes, close public pattern and core profile gaps, and regenerate served declarations.',
 's199-m04':'Scale bubble areas honestly and render interval bounds through the real ECharts engine with fidelity assertions.',
 's199-m05':'Render declared HC paints for all types, fix named light/dark defects, and attribute the shared chart golden migration.',
 's199-m06':'Place the synthetic directed Relationship graph in both frameworks, with explicit intake and measured evidence.',
 's199-m07':'Close current census and historical epoch contracts, correct graph shared styles/ordering and bridge prose, and bind final measured readiness/docs.'}
commits=git('rev-list','--reverse',f'{BASE}..{HEAD}').decode().splitlines()
events={}; mappings=[]
for commit in commits:
 mission=missions[commit[:9]]
 paths=git('diff-tree','--no-commit-id','--name-only','--no-renames','-r','-z',commit).decode().split('\0')
 for path in filter(None,paths): events.setdefault(path,[]).append({'commit':commit,'mission':mission})
 mappings.append({'commit':commit,'mission':mission,'reason':reasons[mission]})
all_paths=sorted(filter(None,git('diff','--name-only','--no-renames','-z',BASE,HEAD).decode().split('\0')))
public_paths=[p for p in all_paths if not p.startswith(tuple(excluded))]
canonical_paths=sorted(filter(None,git('diff','--name-only','--no-renames','-z',BASE,HEAD,'--',*canonical).decode().split('\0')))
assert set(canonical_paths)<=set(public_paths)
def digest(ref,path):
 r=subprocess.run(['git','show',f'{ref}:{path}'],cwd=ROOT,capture_output=True)
 if r.returncode:
  assert r.returncode==128 and (b'does not exist in' in r.stderr or b'exists on disk' in r.stderr),r.stderr
  return None
 return hashlib.sha256(r.stdout).hexdigest()
rows=[]
for path in public_paths:
 assert events.get(path),path
 rows.append({'path':path,'beforeSha256':digest(BASE,path),'afterSha256':digest(HEAD,path),'missions':events[path]})
command=['diff','--no-ext-diff','--no-renames','--unified=0',BASE,HEAD,'--',*public_paths]
patch=git(*command); (OUT/'advertised.patch').write_bytes(patch)
result={'base':BASE,'implementationHead':IMPL,'comparedHead':HEAD,'correctiveExecutionHead':'d28add31bc7726a153c7e6062ff408acdb41aa3b','builderSelfCertified':False,
 'method':'Every changed tracked path except this sprint\'s retained receipts and planning DB backups. Tests, generators, structured exports, registries, docs, schemas, examples and planning source are included. Mission attribution lists every actual modifying commit; raw patch retains the complete final source diff.',
 'canonicalScope':canonical,'canonicalPaths':canonical_paths,'excludedPrefixes':excluded,
 'excludedPaths': [p for p in all_paths if p not in set(public_paths)],
 'paths':len(rows),'unattributed':0,'commitMappings':mappings,'rows':rows,
 'patch':{'path':'advertised.patch','sha256':hashlib.sha256(patch).hexdigest(),'bytes':len(patch)},
 'literalCommand':['git','--literal-pathspecs',*command]}
(OUT/'advertised-diff.json').write_text(json.dumps(result,indent=2)+'\n')
print({'publicPaths':len(rows),'canonicalPaths':len(canonical_paths),'patchBytes':len(patch),'unattributed':0})
