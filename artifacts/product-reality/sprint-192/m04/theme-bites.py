from pathlib import Path
import subprocess,json,hashlib
root=Path.cwd(); out=root/'artifacts/product-reality/sprint-192/m04'; results=[]
for framework,ext in [('react','tsx'),('vue','ts')]:
 p=root/f'packages/components-{framework}/test/visual-app.{ext}'; original=p.read_bytes(); needle='document.documentElement.dataset.theme = theme;';assert original.decode().count(needle)==1
 try:
  p.write_text(original.decode().replace(needle,"document.documentElement.dataset.theme = brand === 'A' && theme === 'dark' ? 'light' : theme;"))
  output=out/f'{framework}-theme-bite';log=out/f'{framework}-theme-bite.log'
  with log.open('w') as f:r=subprocess.run(['pnpm','--filter',f'@oods/components-{framework}','run','test:visual',f'--output={output.relative_to(root)}'],cwd=root,stdout=f,stderr=subprocess.STDOUT)
  report=json.loads((output/'report.json').read_text())
  assert r.returncode!=0
  assert any('A-dark: theme attributes differ: actual A/light' in failure for failure in report['failures'])
  assert [cell['cell'] for cell in report['cells'] if cell['status']=='failed']==['A-dark']
  results.append({'framework':framework,'mutation':'A-dark data-theme changed to light','exitCode':r.returncode,'failedCells':['A-dark'],'sourceSha256':hashlib.sha256(original).hexdigest(),'report':str((output/'report.json').relative_to(root))})
 finally:p.write_bytes(original)
 assert p.read_bytes()==original;results[-1]['restoredSha256']=hashlib.sha256(p.read_bytes()).hexdigest()
(out/'theme-bites.json').write_text(json.dumps({'status':'passed','results':results},indent=2)+'\n')
print('Both theme mutations failed only A-dark; source restored byte-for-byte.')
