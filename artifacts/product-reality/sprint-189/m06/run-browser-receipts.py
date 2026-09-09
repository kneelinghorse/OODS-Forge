"""Invoke the existing design loop and retain every direct and review-state output."""
import json,pathlib,subprocess
base=pathlib.Path('artifacts/product-reality/sprint-189/m06')
screens=['list','detail','form','timeline','workflow','review-list','review-detail','review-form','review-timeline','active-detail','archived','on-demand']
for screen in screens:
 subprocess.run(['pnpm','design:loop','render','--input',str(base/'inputs'/f'{screen}.json')],check=True)
 if screen in screens[:9]:
  for framework in ['react','vue']:
   subprocess.run(['pnpm','design:loop','diff',f'artifacts/product-reality/sprint-189/m02/before/{screen}/{framework}/receipt.json',str(base/'final-proof/after'/screen/framework/'receipt.json'),'--output',str((base/'before-after/diffs'/screen/framework).resolve())],check=True)
subprocess.run(['node',str(base/'verify-receipts.mjs')],check=True)
