from pathlib import Path
import subprocess,json,hashlib
root=Path.cwd(); out=root/'artifacts/product-reality/sprint-192/m03'; rows=[]
sha=lambda b:hashlib.sha256(b).hexdigest()
for framework,ext in [('react','tsx'),('vue','ts')]:
 p=root/f'packages/components-{framework}/src/tabs.{ext}'
 original=p.read_bytes(); text=original.decode()
 before="if (key === 'ArrowRight') nextIndex = enabled[(Math.max(0, position) + 1) % enabled.length];" if framework=='react' else "if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % available.length;"
 after="if (key === 'ArrowRight') return;" if framework=='react' else "if (event.key === 'ArrowRight') return;"
 assert text.count(before)==1
 try:
  p.write_text(text.replace(before,after))
  log=out/f'{framework}-arrowright-bite.log'
  with log.open('w') as f:r=subprocess.run(['pnpm','--filter',f'@oods/components-{framework}','exec','vitest','run',f'test/scenario-interactions.spec.{ext}'],cwd=root,stdout=f,stderr=subprocess.STDOUT)
  assert r.returncode!=0 and 'Tabs: 1 keyboard ArrowRight' in log.read_text()
  rows.append({'framework':framework,'mutation':'remove Tabs ArrowRight handler','file':str(p.relative_to(root)),'beforeSha256':sha(original),'exitCode':r.returncode,'log':str(log.relative_to(root))})
 finally:p.write_bytes(original)
 assert p.read_bytes()==original;rows[-1]['restoredSha256']=sha(p.read_bytes())
 p=root/f'packages/components-{framework}/test/accessibility.spec.{ext}'; original=p.read_bytes();text=original.decode();assert text.count('const axeScenarios = sharedScenarios;')==1
 try:
  p.write_text(text.replace('const axeScenarios = sharedScenarios;', 'const axeScenarios = sharedScenarios.slice(1);'))
  log=out/f'{framework}-axe-count-bite.log'
  with log.open('w') as f:r=subprocess.run(['pnpm','--filter',f'@oods/components-{framework}','exec','vitest','run',f'test/accessibility.spec.{ext}'],cwd=root,stdout=f,stderr=subprocess.STDOUT)
  assert r.returncode!=0 and 'runs every governed root through the axe loop exactly once' in log.read_text()
  rows.append({'framework':framework,'mutation':'drop first axe scenario','file':str(p.relative_to(root)),'beforeSha256':sha(original),'exitCode':r.returncode,'log':str(log.relative_to(root))})
 finally:p.write_bytes(original)
 assert p.read_bytes()==original;rows[-1]['restoredSha256']=sha(p.read_bytes())
(out/'mutation-bites.json').write_text(json.dumps({'status':'passed','rows':rows},indent=2)+'\n')
print('Four mutations failed as intended; all source bytes restored.')
