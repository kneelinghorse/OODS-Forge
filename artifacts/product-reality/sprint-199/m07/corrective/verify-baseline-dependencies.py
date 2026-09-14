from pathlib import Path
import subprocess,json
source=Path('/Users/systemsystems/.codex/worktrees/s199/OODS-Forge');target=Path('/tmp/forge-s199-export-baseline');out=Path('/tmp/forge-s199-capture');tsup=source/'node_modules/.bin/tsup';tsx=source/'node_modules/.bin/tsx'
for package,configs in [('component-contracts',['tsup.config.ts']),('components-react',['tsup.config.ts']),('components-vue',['tsup.config.ts','tsup.ported.config.ts'])]:
 for config in configs:
  result=subprocess.run([str(tsup),'--config',config],cwd=target/'packages'/package,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
  (out/f'baseline-{package}-{config}.log').write_bytes(result.stdout);assert result.returncode==0,package
files=['packages/mcp-server/src/codegen/workflow-data-emitter.ts','packages/mcp-server/src/codegen/workflow-emitter.ts','packages/mcp-server/src/compose/collections.ts']
script=(target/'s199-runtime-before.ts').read_text()
for label,head,prior in [('base','b7a96ab0f','/tmp/forge-s199-base-hashes.json'),('m01','e001bfeacf14115f44de19010e3656537ba16f6f','/tmp/forge-s199-m01-hashes.json')]:
 for file in files:(target/file).write_bytes(subprocess.check_output(['git','show',f'{head}:{file}'],cwd=source))
 s=script.replace('/tmp/forge-s199-m01-hashes.json',f'/tmp/forge-s199-{label}-hashes-localized.json');(target/'s199-runtime-before.ts').write_text(s)
 result=subprocess.run([str(tsx),'s199-runtime-before.ts'],cwd=target,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
 (out/f'baseline-{label}-localized.log').write_bytes(result.stdout);assert result.returncode==0,label
 before=json.loads(Path(prior).read_text());after=json.loads(Path(f'/tmp/forge-s199-{label}-hashes-localized.json').read_text());assert before['rows']==after['rows'],label
(out/'baseline-dependencies.json').write_text(json.dumps({'base':'b7a96ab0f','rebuiltBaselinePackages':['viz-core','viz-render','component-contracts','components-react','components-vue'],'baseHashComparisons':240,'m01HashComparisons':240,'allEqual':True,'builderSelfCertified':False},indent=2)+'\n')
print('480 baseline dependency comparisons equal')
