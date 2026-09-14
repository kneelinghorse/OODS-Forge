from pathlib import Path
import subprocess,os,json,hashlib,datetime
root=Path(__file__).resolve().parents[5]
out=root/'artifacts/product-reality/sprint-198/m07'
assert os.environ.get('OODS_PLAYWRIGHT_WS_ENDPOINT')=='ws://127.0.0.1:4788/'
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
commands=[
 ('build-viz-core',['pnpm','--filter','@oods/viz-core','run','build']),
 ('build-mcp-server',['pnpm','--filter','@oods/mcp-server','run','build']),
 ('runtime',['pnpm','exec','tsx','scripts/product-reality/s193-runtime-cells.ts',str(out/'runtime'),'--workflows']),
 ('react-theme',['pnpm','--filter','@oods/components-react','run','test:visual',f'--output={out}/react-theme','--mission=s198-m07']),
 ('vue-theme',['pnpm','--filter','@oods/components-vue','run','test:visual',f'--output={out}/vue-theme','--mission=s198-m07']),
 ('react-measured',['pnpm','--filter','@oods/components-react','exec','vitest','run','test/accessibility.spec.tsx','--reporter=default','--reporter=json',f'--outputFile={out}/react-measured.json']),
 ('vue-measured',['pnpm','--filter','@oods/components-vue','exec','vitest','run','test/accessibility.spec.ts','--reporter=default','--reporter=json',f'--outputFile={out}/vue-measured.json']),
 ('viz',['pnpm','exec','tsx','scripts/product-reality/s190-viz-census.ts',str(out/'viz')]),
 ('patterns',['pnpm','exec','tsx','artifacts/product-reality/sprint-198/m07/preparation/capture-patterns.ts']),
 ('composition',['node','scripts/product-reality/s185-reachability.mjs',str(out/'component-census'),'--fresh','--full-population','--objects','Article,Invoice,Media,Organization,Plan,Product,Relationship,Subscription,Transaction,Usage,User','--mission','s198-m07']),
 ('identities',['node','artifacts/product-reality/sprint-198/m07/preparation/derive-censuses.mjs',head]),
]
folder=out/'census-commands';folder.mkdir(parents=True,exist_ok=True);rows=[]
for name,command in commands:
 started=datetime.datetime.now(datetime.timezone.utc).isoformat();log=folder/f'{name}.log'
 with log.open('w') as f:result=subprocess.run(command,cwd=root,stdout=f,stderr=subprocess.STDOUT)
 rows.append({'name':name,'command':command,'head':head,'startedAt':started,'finishedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':result.returncode,'log':{'path':str(log.relative_to(root)),'sha256':hashlib.sha256(log.read_bytes()).hexdigest()}})
 (folder/'report.json').write_text(json.dumps({'head':head,'reports':rows,'builderSelfCertified':False},indent=2)+'\n')
 print(f'{name}: {result.returncode}',flush=True)
 if result.returncode:raise SystemExit(result.returncode)
