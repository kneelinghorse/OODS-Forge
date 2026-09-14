import json, pathlib, re, sys, hashlib, difflib
root=pathlib.Path(__file__).resolve().parent
source=sys.argv[1]
objects=['Organization','User','Subscription','Invoice','Plan']
key=lambda v:(v['context'],v['width'])
rows=[]; issues=[]; attribution=[]
for obj in objects:
 data={f:json.loads((root/'after'/obj/f/'craft.json').read_text()) for f in ['react','vue']}
 for framework,d in data.items():
  if d['errors']:issues.append([obj,framework,'browser errors',d['errors']])
  if len(d['views'])!=6:issues.append([obj,framework,'view count',len(d['views'])])
  for view in d['views']:
   if view['measurements']['overflow']:issues.append([obj,framework,key(view),'overflow',view['measurements']['overflow']])
   if re.search(r' sample \d+',view['visibleText']):issues.append([obj,framework,key(view),'placeholder text'])
   if view['context']=='timeline' and 'No events yet' in view['visibleText']:issues.append([obj,framework,key(view),'empty timeline'])
   if view['context']=='form':
    if any(not mark['sameLine'] for mark in view['craft'].get('requiredMarks',[])):issues.append([obj,framework,key(view),'required marker wraps'])
    if sum(a['text']=='Save' for a in view['craft']['actions'])!=1:issues.append([obj,framework,key(view),'one Save'])
    if any(a['text'] in ['Change','Submit'] for a in view['craft']['actions']):issues.append([obj,framework,key(view),'stray action'])
    if obj in ['Organization','User']:
     for component,count in [('PreferenceEditor',1),('RoleAssignmentForm',1),('TemplatePicker',2)]:
      selects=[i for i in view['craft']['inputs'] if i.get('component')==component and i['type']=='select-one']
      if len(selects)!=count or any(not i['options'] or any(not o['value'] or o['label']==o['value'] and re.match(r'^[a-f0-9]{8}-',o['value']) for o in i['options']) for i in selects):issues.append([obj,framework,key(view),component,'catalog choices'])
    for i in view['craft']['inputs']:
     if i['type']=='datetime-local' and i['value'] and not re.match(r'^2026-09-01T12:00',i['value']):issues.append([obj,framework,key(view),'datetime seed',i])
     if re.search(r' sample \d+',i['value']):issues.append([obj,framework,key(view),'placeholder control',i])
   rows.append({'object':obj,'framework':framework,'context':view['context'],'width':view['width'],'screenshot':'after/'+view['output']+'/'+view['screenshot'],'hash':view['screenshotHash']})
  receipt=json.loads((root/'after'/obj/'mount'/framework/'receipt.json').read_text())
  if receipt['sourceHead']!=source:issues.append([obj,framework,'head',receipt['sourceHead'],source])
  before=json.loads((root/'before'/obj/'mount'/framework/'artifact.json').read_text());after=json.loads((root/'after'/obj/'mount'/framework/'artifact.json').read_text())
  a={f['path']:f['contents'] for f in before['files']};b={f['path']:f['contents'] for f in after['files']}
  reasons={'src/store.ts':'Shared record event projection and parameter-derived field types','src/application.ts':'Field-to-control dispatch and resolved enums','src/sample-data.ts':'One deterministic seed policy, authored catalogs and coherent prices/dates','src/app.css':'Governed component field frames own label and required-mark layout'}
  moved=[]
  for name in sorted(a.keys()|b.keys()):
   if a.get(name)==b.get(name):continue
   reason=reasons.get(name)
   if name.startswith('src/screens/'):reason='Producer control/label corrections, structured document binding and resolved field enums'
   if name.endswith('.svg') or name=='src/chart-assets.ts':reason='Chart of the same seeded records, amounts derived from new record prices'
   if reason is None:issues.append([obj,framework,'unattributed artifact file',name])
   moved.append({'path':name,'reason':reason,'beforeSha256':hashlib.sha256(a.get(name,'').encode()).hexdigest(),'afterSha256':hashlib.sha256(b.get(name,'').encode()).hexdigest()})
  attribution.append({'object':obj,'framework':framework,'changed':moved,'unchanged':sorted(name for name in a if a[name]==b.get(name))})
 vue={key(v):v for v in data['vue']['views']}
 for v in data['react']['views']:
  other=vue[key(v)]
  if v['visibleText']!=other['visibleText']:issues.append([obj,key(v),'visible text mismatch',list(difflib.unified_diff(v['visibleText'].splitlines(),other['visibleText'].splitlines()))])
  # Identical logical controls and choices; wrapper IDs and CSS class names may differ.
  control=lambda i:{k:i.get(k) for k in ['type','value','checked','required','options']}
  if [control(i) for i in v['craft']['inputs']]!=[control(i) for i in other['craft']['inputs']]:issues.append([obj,key(v),'control values differ'])
seeds=[json.loads(p.read_text()) for p in sorted((root/'seeds').glob('*/seed-table.json'))]
if len(seeds)!=18 or any(s['sourceHead']!=source for s in seeds):issues.append(['seed tables',len(seeds),'expected18 at accepted head'])
extra={}
for framework in ['react','vue']:
 p=root/'after/Subscription/seeded-cancellation'/framework/'proof.json';d=json.loads(p.read_text());extra[framework]=d
 if d['errors']:issues.append([framework,'seeded cancellation errors',d['errors']])
 receipt=json.loads((p.parent.parent/'mount'/framework/'receipt.json').read_text())
 if receipt['sourceHead']!=source:issues.append([framework,'seeded cancellation source head'])
 if len(d['views'])!=3:issues.append([framework,'seeded cancellation views'])
 for v in d['views']:
  if v['measurements']['overflow']:issues.append([framework,v['width'],'seeded cancellation overflow'])
  controls=v['controls']
  checkbox=next(i for i in controls if i['type']=='checkbox')
  if not checkbox['checked'] or checkbox['checkboxLabelCenterDelta']>1:issues.append([framework,v['width'],'checked checkbox alignment'])
  if next(i for i in controls if i['type']=='datetime-local')['value']!='2026-09-01T12:00':issues.append([framework,v['width'],'seeded datetime empty'])
  if next(i for i in controls if i.get('label')=='Reason Code')['value']!='customer_request':issues.append([framework,v['width'],'seeded reason code'])
for a,b in zip(extra['react']['views'],extra['vue']['views']):
 if a['visibleText']!=b['visibleText'] or a['controls']!=b['controls']:issues.append([a['width'],'seeded cancellation framework parity'])
report={'status':'fail' if issues else 'pass','sourceHead':source,'builderSelfCertified':False,'views':len(rows),'seededCancellationViews':6,'totalViews':len(rows)+6,'objects':objects,'frameworks':['react','vue'],'widths':[390,820,1440],'contexts':['form','timeline'],'seedTables':len(seeds),'seedRecords':sum(s['records'] for s in seeds),'issues':issues,'screenshots':rows,'attribution':attribution}
(root/'verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ['screenshots','attribution']},indent=2))
assert not issues, f'{len(issues)} verification issues'
