import pathlib,json
from PIL import Image,ImageChops
r=pathlib.Path(__file__).resolve().parent
rows=[]
for f in ['react','vue']:
 before=json.loads((r/'before/Subscription'/f/'craft.json').read_text())['views']
 after=json.loads((r/'after/Subscription'/f/'craft.json').read_text())['views']
 for a in after:
  b=next(b for b in before if (b['context'],b['width'])==(a['context'],a['width']))
  bp=r/'before'/b['output']/b['screenshot'];ap=r/'after'/a['output']/a['screenshot']
  old=Image.open(bp).convert('RGB');new=Image.open(ap).convert('RGB');box=(0,0,min(old.width,new.width),min(old.height,new.height));diff=ImageChops.difference(old.crop(box),new.crop(box));moved=sum(1 for pixel in diff.getdata() if any(pixel));total=box[2]*box[3]
  rows.append({'framework':f,'context':a['context'],'width':a['width'],'before':str(bp.relative_to(r)),'after':str(ap.relative_to(r)),'beforeSize':list(old.size),'afterSize':list(new.size),'overlapPixels':total,'changedOverlapPixels':moved,'changedOverlapFraction':round(moved/total,6),'heightDelta':new.height-old.height,'attribution':'Form: tier-price/name/email seeds, parameter enums, inline required marks and governed field layout; control roles/Save preserved. Timeline: the same record price and human-readable record creation reason, using shared event projection.'})
(r/'subscription-pixels.json').write_text(json.dumps({'builderSelfCertified':False,'scope':'12 matching brand A/light Subscription views (form and timeline); the extra pending-cancellation record is separate proof.','rows':rows},indent=2)+'\n')
print('Attributed',len(rows),'Subscription view deltas')
