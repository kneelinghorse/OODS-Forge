import json, pathlib, hashlib, re, difflib
root=pathlib.Path(__file__).resolve().parent
objects=['Organization','User','Subscription','Invoice','Plan']
source='7bc0aebbcd241b2fda9b9c87649e25efa4ea14b3'
rows=[]; attribution=[]
key=lambda v:(v['context'],v['theme'],v['tab'],v['width'])
sha=lambda text:hashlib.sha256(text.encode()).hexdigest()
for obj in objects:
    frameworks={f:json.loads((root/'after'/obj/f/'craft.json').read_text()) for f in ['react','vue']}
    for f,d in frameworks.items():
        assert not d['errors'], (obj,f,d['errors'])
        assert len(d['views'])==(18 if obj=='Subscription' else 12), (obj,f,len(d['views']))
        for view in d['views']:
            assert view['generatedTheme']==view['theme']
            assert not view['measurements']['overflow'], (obj,f,key(view),'overflow')
            assert not view['craft']['editable'], (obj,f,key(view),'editable')
            assert not view['craft']['emptyCards'], (obj,f,key(view),'emptyCards')
            assert not re.search(r'\b(?:false|true|billing_cycle_started|pending_cancellation|customer_request|good_standing|past_due|private_beta|charge_automatically|send_invoice)\b|\d{4}-\d{2}-\d{2}T\d{2}',view['visibleText']), (obj,f,key(view),'raw value')
            labels=[tab['text'] for tab in view['craft']['tabs']]
            assert len(labels)==len(set(labels))
            expected=view['craft']['tokens']
            for surface in view['craft']['surfaces']:
                if surface['component']=='Tabs':continue # transparent tab group inherits the measured Card
                assert surface['background']==expected['surface'],(obj,f,key(view),surface,expected)
                assert surface['color']==expected['text'],(obj,f,key(view),surface,expected)
                assert surface['border']==expected['border'],(obj,f,key(view),surface,expected)
            if obj=='Subscription' and view['context']=='detail':
                assert view['measurements']['chartCanvasFills']==(['#F9FAFC'] if view['theme']=='light' else ['#101215'])
            rows.append({'object':obj,'framework':f,'context':view['context'],'theme':view['theme'],'tab':view['tab'],'width':view['width'],'tokens':expected,'screenshot':view['output']+'/'+view['screenshot'],'screenshotHash':view['screenshotHash']})
        a=json.loads((root/'before'/obj/'mount'/f/'artifact.json').read_text())
        b=json.loads((root/'after'/obj/'mount/light'/f/'artifact.json').read_text())
        receipt=json.loads((root/'after'/obj/'mount/light'/f/'receipt.json').read_text())
        assert receipt['sourceHead']==source,receipt['sourceHead']
        a={i['path']:i['contents'] for i in a['files']};b={i['path']:i['contents'] for i in b['files']}
        moved=[name for name in sorted(a.keys()|b.keys()) if a.get(name)!=b.get(name)]
        allowed={'src/application.ts','src/screens/Detail.tsx','src/screens/Detail.vue','src/screens/Timeline.tsx','src/screens/Timeline.vue'}
        assert set(moved)<=allowed,(obj,f,moved)
        # Only the node-to-field dispatch map changes in the application. Store,
        # actions, samples, lifecycle logic, list/form, chart SVG bytes stay intact.
        strip=lambda text:'\n'.join(line for line in text.splitlines() if not line.startswith('const fieldByNodeId:'))
        assert strip(a['src/application.ts'])==strip(b['src/application.ts'])
        attribution.append({'object':obj,'framework':f,'movedFiles':[{'path':name,'beforeSha256':sha(a.get(name,'')),'afterSha256':sha(b.get(name,''))} for name in moved], 'unchangedFiles':sorted(name for name in a if a[name]==b.get(name)), 'applicationDelta':'node-to-field dispatch map only','chartFilesUnchanged':sum(name.endswith('.svg') and a[name]==b.get(name) for name in a)})
    vue={key(v):v for v in frameworks['vue']['views']}
    for view in frameworks['react']['views']:
        assert view['visibleText']==vue[key(view)]['visibleText'],(obj,key(view),'text mismatch')
    assert frameworks['react']['views'][0]['craft']['tokens']!=next(v for v in frameworks['react']['views'] if v['theme']=='dark')['craft']['tokens']
assert len(rows)==132
html=json.loads((root/'html/proof.json').read_text());assert html['sourceHead']==source
assert len(html['views'])==6 and all(not v['measurements']['overflow'] for v in html['views'])
report={'sourceHead':source,'builderSelfCertified':False,'status':'pass','views':132,'htmlViews':6,'objects':objects,'frameworks':['react','vue'],'widths':[390,820,1440],'themes':['light','dark'],'errors':0,'overflow':0,'editableReadFields':0,'emptyCards':0,'rawValues':0,'textDifferences':0,'baselineNote':'Before dark images are root-theme-switch stress captures with light-generated chart assets. Pixel attribution uses the 66 matching light views. Accepted dark images use artifacts generated with dark theme.','attribution':attribution,'screenshots':rows}
(root/'verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ['attribution','screenshots']}))
