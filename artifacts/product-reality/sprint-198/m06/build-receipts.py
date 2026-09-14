from pathlib import Path
import json, hashlib, html
from PIL import Image, ImageChops
r=Path(__file__).resolve().parent
read=lambda p:json.loads(p.read_text())
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
write=lambda p,v:p.write_text(json.dumps(v,indent=2)+'\n')
screens=read(r/'screens/report.json');head=screens['sourceHead'];gallery=[];references=[];summaries=[]
for result in screens['reports']:
 obj,context=result['object'],result['context'];d=r/'screens'/obj/context
 receipts={x['framework']:x for x in result['receipt']['receipts']}
 assert set(receipts)=={'react','vue'}
 parity=read(d/'text-parity.json');assert parity['texts']['react']==parity['texts']['vue']
 for f,receipt in receipts.items():
  assert receipt['sourceHead']==head and not receipt['errors']
  assert {v['width'] for v in receipt['views']}=={390,820,1440}
  for v in receipt['views']:
   assert v['measurements']['documentWidth']==v['width'] and not v['measurements']['overflow']
   assert sha(d/f/v['screenshot'])==v['screenshotHash']
   other=next(x for x in receipts['vue' if f=='react' else 'react']['views'] if x['width']==v['width'])
   assert v['visibleText']==other['visibleText'] and v['values']==other['values']
   if f=='react':gallery.append({'object':obj,'step':'Direct '+context,'width':str(v['width']),'react':str((d/f/v['screenshot']).relative_to(r)),'vue':str((d/'vue'/other['screenshot']).relative_to(r)),'text':v['visibleText']})
 references.append({'path':str((d/'render.json').relative_to(r)),'sha256':sha(d/'render.json')})
assert len(gallery)==15
pixels=[]
for row in gallery:
 for framework in ['react','vue']:
  current=r/row[framework];before=r/'diagnostic-before-fixes'/row[framework]
  a=Image.open(before).convert('RGB');b=Image.open(current).convert('RGB');w=min(a.width,b.width);h=min(a.height,b.height)
  delta=ImageChops.difference(a.crop((0,0,w,h)),b.crop((0,0,w,h)))
  pixels.append({'object':row['object'],'context':row['step'],'framework':framework,'width':int(row['width']),'before':str(before.relative_to(r)),'after':row[framework],'beforeSha256':sha(before),'afterSha256':sha(current),'beforeSize':list(a.size),'afterSize':list(b.size),'changedOverlapPixels':sum(any(pixel) for pixel in delta.getdata()),'attribution':'m06 shared detail pruning/classification summary; meaningful absence replaces diagnostic optional values; Mission objective examples. No palette or chrome change.'})
write(r/'before-after.json',{'beforeHead':read(r/'diagnostic-before-fixes/screens/report.json')['sourceHead'],'afterHead':head,'rows':pixels,'builderSelfCertified':False})
for obj in ['Evidence','Mission']:
 d=r/'apps'/obj.lower();report=read(d/'report.json');assert report['sourceHead']==head and report['builderSelfCertified'] is False
 assert all(g['status']=='passed' for c in report['cells'] for g in c['gates'])
 assert all(not c['browserErrors'] for c in report['cells'])
 bite=read(d/'navigation-bite.json');assert bite['beforeHash']==bite['restoredHash'] and bite['beforeHash']!=bite['afterHash']
 assert any(x['status']=='failed' for x in bite['red']) and all(x['status']=='passed' for x in bite['restored']+bite['unaffected'])
 proof=read(d/'craft/verification.json');assert not proof['frameworkTextAndValueMismatches'] and not proof['errors']
 views={f:read(d/f'craft/{f}/observations.json') for f in ['react','vue']}
 for f,proof in views.items():
  assert proof['sourceHead']==head and 'Linux' in proof['browser'] and not proof['errors']
  assert len(proof['flows'])==6
  for flow in proof['flows']:assert all(x['status']=='passed' for x in flow.get('flow',flow.get('controls',[])))
  for v in proof['observations']:
   assert not v['layout']['overflow'] and v['layout']['document']==v['width'] and v['emptyPanels']==0
   assert sha(d/v['file'])==v['sha256']
   other=next(x for x in views['vue' if f=='react' else 'react']['observations'] if (x['name'],x['width'])==(v['name'],v['width']))
   assert v['text']==other['text'] and v['controls']==other['controls']
   if f=='react':gallery.append({'object':obj,'step':'App '+v['name'],'width':str(v['width']),'react':str((d/v['file']).relative_to(r)),'vue':str((d/other['file']).relative_to(r)),'text':v['text']})
  references.append({'path':str((d/f'craft/{f}/observations.json').relative_to(r)),'sha256':sha(d/f'craft/{f}/observations.json')})
 summaries.append({'object':obj,'sourceHead':head,'packedGates':sum(len(c['gates']) for c in report['cells']),'craftScreenshots':sum(len(x['observations']) for x in views.values()),'stateObservations':len(report['stateObservations']),'ordinaryScreenshots':len(report['screenshots']),'browserErrors':0,'overflow':0,'textOrValueDifferences':0})
verification={'mission':'s198-m06','sourceHead':head,'builderSelfCertified':False,'directScreenshots':30,'apps':summaries,'hashBoundReceipts':references,'carry':['Optional chrome pass deferred to Sprint200: direct standalone typography and externally handled action buttons retain existing contracts.','These are deterministic Forge fixtures, not API parity or live TraceLab data. Generic related IDs/optional metadata remain synthetic; Mission can show queued/started/completed timestamps together pending state-aware research fixtures.','ClassificationEditor is the existing presentational recipe; persistence claims cover the governed application form and declared record fields, not new taxonomy management.']}
write(r/'verification.json',verification)
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>S198 M06 research application review</title><style>body{font:16px system-ui;max-width:1500px;margin:30px auto;padding:0 24px;background:#15191f;color:#edf1f7}p{line-height:1.5;max-width:1100px}a{color:#a8d5ff}nav{display:flex;gap:16px;flex-wrap:wrap;margin:24px 0}select{padding:8px;font:inherit}.pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}.shot{overflow:auto;max-height:1000px;background:#252b34;padding:10px}img{width:100%;display:block}small{display:block;margin:8px 0}pre{white-space:pre-wrap;font:14px system-ui;color:#bbc7d8}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><h1>Evidence and Mission — research review</h1><p><b>Built for independent review. Builder self-certification: false.</b> Evidence list/detail/timeline and Mission detail/workflow are composed through Forge in React and Vue at 390, 820 and 1440. The full packed applications additionally exercise edit/Save/readback, timeline navigation, exact search/filter/sort order, collection states and a deliberate navigation break/restore. Mission also exercises immediate cancellation and its history. Evidence disposition remains classification.</p><p>Source HEAD · Pinned Linux Chromium 141.0.7390.37 · Brand A/light. COUNTS. Zero browser errors, overflow or exact text/control-value mismatches across accepted views. Application checkpoints use an advancing fixed-start clock; direct views use the existing design-loop clock.</p><p>These are deterministic Forge fixtures, not live TraceLab data or API parity evidence. No TraceLab writes or messages occurred. Mission’s generic fixture timestamps can show queued/started/completed together; state-aware research metadata is an explicit carry. Optional chrome work is deferred to Sprint200: standalone typography and external-action controls retain their current presentation. The classification recipe remains presentational; new taxonomy management is not claimed.</p><p><a href="verification.json">Hash-verified measurements</a> · <a href="README.md">Validation, corrections and limits</a> · <a href="diagnostic-before-fixes/screens/report.json">Initial direct screen receipt</a> · <a href="diagnostic-before-fixes/apps/evidence/craft/verification.json">Initial selector parity failure</a></p><nav id="controls"></nav><section class="pair"><article><h2>React</h2><small id="react-label"></small><div class="shot"><a id="react-link"><img id="react-img"></a></div></article><article><h2>Vue</h2><small id="vue-label"></small><div class="shot"><a id="vue-link"><img id="vue-img"></a></div></article></section><details><summary>Exact visible text (equal across frameworks)</summary><pre id="text"></pre></details><script>const rows=ROWS;const chosen={object:'Evidence',step:'Direct detail',width:'390'};const selects={};for(const key of Object.keys(chosen)){const label=document.createElement('label');label.textContent=key+' ';const select=document.createElement('select');selects[key]=select;label.append(select);document.getElementById('controls').append(label);select.onchange=()=>{chosen[key]=select.value;update()}}function update(){for(const key of Object.keys(chosen)){const values=[...new Set(rows.filter(row=>key==='object'||row.object===chosen.object).map(row=>row[key]))];if(!values.includes(chosen[key]))chosen[key]=values[0];selects[key].replaceChildren(...values.map(value=>{const o=document.createElement('option');o.value=value;o.textContent=value;o.selected=value===chosen[key];return o}))}const row=rows.find(row=>Object.keys(chosen).every(key=>row[key]===chosen[key]));for(const f of ['react','vue']){document.getElementById(f+'-img').src=row[f];document.getElementById(f+'-img').alt=chosen.object+' '+chosen.step+' '+f;document.getElementById(f+'-link').href=row[f];document.getElementById(f+'-label').textContent=row[f]}document.getElementById('text').textContent=row.text}update();</script></html>'''
page=page.replace('HEAD',html.escape(head)).replace('COUNTS',f'30 direct views + {sum(x["craftScreenshots"] for x in summaries)} application checkpoints').replace('ROWS',json.dumps(gallery).replace('</','<\\/'))
(r/'index.html').write_text(page)
print(json.dumps(verification,indent=2))
