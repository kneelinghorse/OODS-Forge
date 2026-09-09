"""Invoke the existing design loop and retain every direct and review-state output."""
import json,pathlib,subprocess
base=pathlib.Path('artifacts/product-reality/sprint-189/m06')
screens=['list','detail','form','timeline','workflow','review-list','review-detail','review-form','review-timeline','active-detail','archived','on-demand']
for screen in screens:
 if not (base/'corrective-proof/after'/screen/'render.json').exists():
  subprocess.run(['pnpm','design:loop','render','--input',str(base/'corrective-inputs'/f'{screen}.json')],check=True)
 if screen in screens[:9]:
  baseline='standalone-'+screen if screen in ['list','detail','form','timeline'] else screen
  for framework in ['react','vue']:
   subprocess.run(['pnpm','design:loop','diff',f'artifacts/product-reality/sprint-189/m02/before/{baseline}/{framework}/receipt.json',str(base/'corrective-proof/after'/screen/framework/'receipt.json'),'--output',str((base/'before-after/corrective-diffs'/screen/framework).resolve())],check=True)
subprocess.run(['node',str(base/'corrective-verify-receipts.mjs')],check=True)
