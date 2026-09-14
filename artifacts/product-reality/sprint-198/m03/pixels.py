import pathlib,json
from PIL import Image,ImageChops
r=pathlib.Path(__file__).resolve().parent
rows=[]
for f in ['react','vue']:
 before=json.loads((r/'before/Subscription'/f/'craft.json').read_text())['views']
 after=json.loads((r/'after/Subscription'/f/'craft.json').read_text())['views']
 label=lambda v:next((t['text'] for t in v['craft']['tabs'] if t['selected']=='true'),'Timeline')
 for a in after:
  if a['theme']!='light':continue
  b=next(b for b in before if (b['context'],b['theme'],b['width'],label(b))==(a['context'],a['theme'],a['width'],label(a)))
  bp=r/'before'/b['output']/b['screenshot'];ap=r/'after'/a['output']/a['screenshot']
  old=Image.open(bp).convert('RGB');new=Image.open(ap).convert('RGB');box=(0,0,min(old.width,new.width),min(old.height,new.height));diff=ImageChops.difference(old.crop(box),new.crop(box));moved=sum(1 for pixel in diff.getdata() if any(pixel));total=box[2]*box[3]
  rows.append({'framework':f,'context':a['context'],'panel':label(a),'width':a['width'],'before':str(bp.relative_to(r)),'after':str(ap.relative_to(r)),'beforeSize':list(old.size),'afterSize':list(new.size),'overlapPixels':total,'changedOverlapPixels':moved,'changedOverlapFraction':round(moved/total,6),'heightDelta':new.height-old.height,'attribution':'Detail: full-width header/body, one labelled summary, token-backed surfaces, humanized lifecycle words; unchanged chart SVG bytes. Timeline: authored title plus actual humanized state, preserving date/actor/reason; unchanged chronological event data.'})
(r/'subscription-pixels.json').write_text(json.dumps({'builderSelfCertified':False,'scope':'18 matching light-theme Subscription views; baseline dark charts were light-generated stress captures, so no dark pixel equivalence is claimed.','rows':rows},indent=2)+'\n')
print('Attributed',len(rows),'Subscription view deltas')
