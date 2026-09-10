"""Retain the exact source/expectation movement against the sprint base."""
import hashlib,json,pathlib,subprocess
base=pathlib.Path('artifacts/product-reality/sprint-191/m01')
paths=subprocess.check_output(['git','diff','--name-only','d3a99d39'],text=True).splitlines()
paths=[p for p in paths if (p.startswith('packages/') and (p.endswith(('.spec.ts','.test.ts','.snap')) or p.endswith(('certified-matrix.json','viz-recipes.v1.json'))))]
rows=[]
for file in paths:
 before=subprocess.check_output(['git','show',f'd3a99d39:{file}'])
 after=pathlib.Path(file).read_bytes()
 reason=('s191 dark-scope categorical palette: measured pass replaces known dark failure' if file.endswith('artifact.certify.scope.test.ts') else
         's191 contrastPassed measured by the public census; nine categorical types pass and four remain exempt' if 'viz-recipes' in file else
         'viz.scale.categorical.04: L 0.6558 -> 0.6488, #B78827 -> #B58525; Role-C passes and the six-slot Role-A caution is retained; pristine historical fixtures are unchanged')
 rows.append({'file':file,'beforeSha256':hashlib.sha256(before).hexdigest(),'afterSha256':hashlib.sha256(after).hexdigest(),'reason':reason})
(base/'golden-attribution.json').write_text(json.dumps({'base':'d3a99d39','files':rows},indent=2)+'\n')
print(f'{len(rows)} attributed golden/contract files')
