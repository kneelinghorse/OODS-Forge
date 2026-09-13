from pathlib import Path
import json, subprocess
root=Path(__file__).resolve().parents[5]
out=Path(__file__).resolve().parent
baseline=json.loads((out/'baseline.json').read_text())
files=[r['file'].replace('/__snapshots__/','/').removesuffix('.snap') for r in baseline['files'] if r['file'].endswith('.snap') and not r['file'].startswith('artifacts/')]
groups=[('root',[f for f in files if f.startswith('tests/')]), *[(pkg,[f.removeprefix('packages/'+pkg+'/') for f in files if f.startswith('packages/'+pkg+'/')]) for pkg in ['mcp-server','viz-core','viz-render']]]
results=[]
for package,specs in groups:
 cwd=root if package=='root' else root/'packages'/package
 command=['pnpm','exec','vitest','run',*specs,'--coverage.enabled=false','--no-file-parallelism','--reporter=json','--outputFile='+str(out/(package+'.json'))]
 if package=='root':command+=['--project=core']
 with (out/(package+'.log')).open('w') as log:r=subprocess.run(command,cwd=cwd,stdout=log,stderr=subprocess.STDOUT)
 results.append({'package':package,'command':command,'exitCode':r.returncode})
 (out/'runs.json').write_text(json.dumps(results,indent=2)+'\n')
 print(package,r.returncode,flush=True)
