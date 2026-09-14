from pathlib import Path
import json,hashlib,html
from PIL import Image,ImageChops
r=Path(__file__).resolve().parent
repo=r.parents[3]
read=lambda p:json.loads(p.read_text())
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
write=lambda p,x:p.write_text(json.dumps(x,indent=2)+'\n')
accepted=r/'accepted'
objects=['organization','user','subscription']
summary=[];gallery=[];heads=set();receipts=[]
for obj in objects:
 d=accepted/obj;report=read(d/'report.json');heads.add(report['sourceHead'])
 assert report['builderSelfCertified'] is False
 assert all(g['status']=='passed' for c in report['cells'] for g in c['gates'])
 assert (d/'navigation-bite.json').is_file()
 proof=read(d/'craft/verification.json');assert not proof['frameworkTextAndValueMismatches'] and not proof['errors']
 views={f:read(d/f'craft/{f}/observations.json') for f in ['react','vue']}
 for f,proof in views.items():
  assert 'Linux' in proof['browser'];assert not proof['errors'];assert proof['sourceHead']==report['sourceHead']
  assert len(proof['flows'])==6
  assert {g['width'] for g in proof['flows']}=={390,820,1440}
  for group in proof['flows']:
   assert all(x['status']=='passed' for x in group.get('flow',group.get('controls',[])))
  for v in proof['observations']:
   assert v['layout']['document']==v['width'] and not v['layout']['overflow']
   assert sha(d/v['file'])==v['sha256']
   other=next(x for x in views['vue' if f=='react' else 'react']['observations'] if (x['name'],x['width'])==(v['name'],v['width']))
   assert v['text']==other['text'] and v['controls']==other['controls']
   if f=='react': gallery.append({'object':obj,'step':v['name'],'width':str(v['width']),'react':str((d/v['file']).relative_to(r)),'vue':str((d/other['file']).relative_to(r)),'text':v['text']})
  receipts.append({'path':str((d/f'craft/{f}/observations.json').relative_to(r)),'sha256':sha(d/f'craft/{f}/observations.json')})
 summary.append({'object':obj,'sourceHead':report['sourceHead'],'packedGates':sum(len(c['gates']) for c in report['cells']),'flowExecutions':6,'craftScreenshots':sum(len(v['observations']) for v in views.values()),'ordinaryScreenshots':len(report['screenshots']),'stateObservations':len(report['stateObservations']),'browserErrors':0,'overflow':0,'textOrValueDifferences':0,'archiveAndCancellation':'Executed: Active/Archived and on-demand cancellation.' if obj=='subscription' else 'Not declared by this object. Edit/Save, address update/readback and timeline navigation executed; no archive or cancellation claim.'})
assert len(heads)==1
sourceHead=heads.pop()
# A matching pinned-Linux, post-m02 baseline isolates the m03/m04 work and the m04-help follow-up.
base=repo/'artifacts/product-reality/sprint-198/m02/runtime/workflows/Subscription'
old=read(base/'report.json');new=read(accepted/'subscription/report.json');pixels=[]
for a in new['screenshots']:
 b=next(v for v in old['screenshots'] if (v['framework'],v['screen'],v['width'])==(a['framework'],a['screen'],a['width']))
 bp=base/b['file'];ap=accepted/'subscription'/a['file'];assert sha(bp)==b['sha256'] and sha(ap)==a['sha256']
 before=Image.open(bp).convert('RGB');after=Image.open(ap).convert('RGB');w=min(before.width,after.width);h=min(before.height,after.height)
 delta=ImageChops.difference(before.crop((0,0,w,h)),after.crop((0,0,w,h)));changed=sum(any(p) for p in delta.getdata())
 item={'list':'m02 list contract retained; m04 tier/name/currency seeds and alphabetic record ordering.', 'archived':'m02 archive contract retained; m04 tier/name/currency seeds.', 'detail':'m03 full-width read-only summary, money/datetime formatting and governed tabs; m04 realistic seeds.', 'payments':'m03 human-readable history and summaries; m04 tier-derived payment amounts.', 'form':'m04 enum/date/required/layout/seed craft, including its shared-help follow-up in m05.', 'timeline':'m03 humanized lifecycle text; m04 actual record event projection and tier-derived amounts.'}[a['screen']]
 pixels.append({'framework':a['framework'],'screen':a['screen'],'width':a['width'],'before':str(bp.relative_to(repo)),'after':str(ap.relative_to(repo)),'beforeSha256':b['sha256'],'afterSha256':a['sha256'],'beforeSize':list(before.size),'afterSize':list(after.size),'overlapPixels':w*h,'changedOverlapPixels':changed,'heightDelta':after.height-before.height,'attribution':item})
write(r/'subscription-pixels.json',{'beforeHead':old['sourceHead'],'afterHead':sourceHead,'browser':'Pinned Linux Chromium, matching framework/screen/viewport. Ordinary packed-harness snapshots follow its real clock; the additional craft checkpoints use an advancing fixed-start clock. Cancellation timestamps reflect the run date; those time differences are capture inputs, not producer changes.','scope':'36 post-flow views; m02 list changes are already present in the baseline and their original before/after attribution remains in m02.','rows':pixels,'builderSelfCertified':False})
classify=lambda name: ('m04 deterministic seeds/payment prices' if name=='src/sample-data.ts' or '/charts/' in name else 'm04 actual-record history projection' if name=='src/store.ts' else 'm03 read-only fields, formatting and tab grouping' if '/Detail.' in name else 'm04 form controls/seeds and help follow-up in m05' if '/Form.' in name else 'm03 humanized titles / m04 timestamp history' if '/Timeline.' in name else 'm04 field-owned label layout' if name=='src/app.css' else 'm04 supplemental field help follow-up in m05' if name=='src/application.ts' else 'm03/m04 component and node-map provenance' if 'node-map' in name else None)
artifacts=[]
for f in ['react','vue']:
 a=read(accepted/f'subscription/{f}-generation.json')['artifact'];b=read(base/f'{f}-generation.json')['artifact'];am={v['path']:v for v in a['files']};bm={v['path']:v for v in b['files']};changes=[]
 for name in sorted(am.keys()|bm.keys()):
  if am.get(name,{}).get('contentHash')==bm.get(name,{}).get('contentHash'):continue
  reason=classify(name);assert reason, f'Unattributed generated-file change: {name}'
  changes.append({'path':name,'before':bm.get(name,{}).get('contentHash'),'after':am.get(name,{}).get('contentHash'),'attribution':reason})
 artifacts.append({'framework':f,'beforeArtifactHash':b['contentHash'],'afterArtifactHash':a['contentHash'],'changedFiles':changes})
write(r/'artifact-attribution.json',{'sourceHead':sourceHead,'baselineHead':old['sourceHead'],'rows':artifacts,'builderSelfCertified':False})
write(r/'verification.json',{'mission':'s198-m05','sourceHead':sourceHead,'builderSelfCertified':False,'separateReviewRequired':True,'objects':summary,'totalCraftScreenshots':sum(x['craftScreenshots'] for x in summary),'hashBoundReceipts':receipts})
limit='References are format-checked and hash-bound, not re-executed.'
write(r/'release-profile-record.json',{'programExitCriterion':6,'disposition':'Closed through the explicitly permitted narrowed-claim branch. Proof re-execution is not implemented or claimed.','limit':limit,'source':'packages/mcp-server/src/codegen/validation-profile.ts','publicTools':['code.generate','pipeline'],'receiptField':'evidenceVerification: hash-bound-not-re-executed','boundarySpec':'packages/mcp-server/test/product-reality/release-limit.s198.spec.ts','behavior':'Both public tools accept a correct artifact hash with a deliberately unreadable report reference. Missing classes fail OODS-V162; hash mismatch fails OODS-V163. Accepted references are caller assertions.','docsCheck':'Canonical runtime phrase is required in both tool descriptions and both ledger caveats during docs:claims --check; generated narrative and Tool-Specs retain it identically.','sourceHead':sourceHead,'builderSelfCertified':False})
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>S198 M05 — application review</title><style>body{font:16px system-ui;max-width:1500px;margin:32px auto;padding:0 24px;background:#15191f;color:#edf1f7}p{line-height:1.5;max-width:1100px}a{color:#a8d5ff}table{border-collapse:collapse}td,th{border:1px solid #536174;padding:10px;text-align:left}nav{display:flex;gap:16px;flex-wrap:wrap;margin:24px 0}select{padding:8px;font:inherit}.pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}.shot{overflow:auto;max-height:1000px;background:#252b34;padding:10px}img{width:100%;display:block}small{display:block;margin:8px 0}pre{white-space:pre-wrap;font:14px system-ui;color:#bbc7d8}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><h1>Organization, User and Subscription — application review</h1><p><b>Built for independent review. Builder self-certification: false.</b> Every declared flow runs in both packed frameworks at 390, 820 and 1440. All captured checkpoints have zero browser errors, viewport overflow, or exact text/control-value differences. Each object passes 16 package/application gates and a deliberate broken-navigation test that fails, then passes after restoration.</p><p>Organization and User support editing, Save, address update/readback, list search/filter/sort, and timeline navigation. They have no archive or cancellation traits; those actions are not claimed. Subscription also proves Active/Archived views, billing amount and interval persistence, and cancellation through its on-demand form with timeline readback.</p><p>SOURCE · Pinned Linux Chromium · brand A/light · advancing capture clock starts 2026-09-08 12:00 UTC for reproducibility.</p><table><thead><tr><th>Object</th><th>Craft screenshots</th><th>Viewport flow runs</th><th>Errors / overflow / differences</th></tr></thead><tbody>SUMMARY</tbody></table><p>The release profile checks caller evidence envelopes. <b>References are format-checked and hash-bound, not re-executed.</b> Both public tools retain this disclosure; the boundary test and docs gate enforce the narrowed claim. No external proof execution or independent certification is implied.</p><p><a href="verification.json">Hash-verified measurements</a> · <a href="subscription-pixels.json">36 Subscription pixel comparisons and attribution</a> · <a href="artifact-attribution.json">Generated-file attribution</a> · <a href="release-profile-record.json">Exit criterion 6 record</a> · <a href="README.md">Validation and limitations</a></p><nav id="controls"></nav><section class="pair"><article><h2>React</h2><small id="react-label"></small><div class="shot"><a id="react-link"><img id="react-img"></a></div></article><article><h2>Vue</h2><small id="vue-label"></small><div class="shot"><a id="vue-link"><img id="vue-img"></a></div></article></section><details><summary>Exact visible text (equal across frameworks)</summary><pre id="text"></pre></details><script>const rows=ROWS;const chosen={object:'organization',step:'edit-seeded-values',width:'390'};const selects={};for(const key of Object.keys(chosen)){const label=document.createElement('label');label.textContent=key+' ';const select=document.createElement('select');selects[key]=select;label.append(select);document.getElementById('controls').append(label);select.onchange=()=>{chosen[key]=select.value;update()}}function update(){for(const key of Object.keys(chosen)){const values=[...new Set(rows.filter(row=>key==='object'||row.object===chosen.object).map(row=>row[key]))];if(!values.includes(chosen[key]))chosen[key]=values[0];selects[key].replaceChildren(...values.map(value=>{const o=document.createElement('option');o.value=value;o.textContent=value;o.selected=value===chosen[key];return o}))}const row=rows.find(row=>Object.keys(chosen).every(key=>row[key]===chosen[key]));for(const f of ['react','vue']){document.getElementById(f+'-img').src=row[f];document.getElementById(f+'-img').alt=chosen.object+' '+chosen.step+' '+f;document.getElementById(f+'-link').href=row[f];document.getElementById(f+'-label').textContent=row[f]}document.getElementById('text').textContent=row.text}update();</script></html>'''
page=page.replace('SOURCE',html.escape(sourceHead)).replace('SUMMARY',''.join(f'<tr><td>{s["object"].title()}</td><td>{s["craftScreenshots"]}</td><td>6</td><td>0 / 0 / 0</td></tr>' for s in summary)).replace('ROWS',json.dumps(gallery).replace('</','<\\/'))
(r/'index.html').write_text(page)
print(json.dumps({'sourceHead':sourceHead,'objects':summary,'subscriptionComparisons':len(pixels)},indent=2))
