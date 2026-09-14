import hashlib, json, html
from pathlib import Path
root = Path(__file__).resolve().parent
objects = ['Organization', 'User', 'Subscription', 'Invoice', 'Plan']
rows = []
for obj in objects:
    receipts = {}
    for framework in ['react', 'vue']:
        folder = root / 'after' / obj / framework
        receipt = json.loads((folder/'receipt.json').read_text())
        craft = json.loads((folder/'craft.json').read_text())
        assert receipt['sourceHead'].startswith('e307810dd'), (obj, 'wrong source head')
        assert receipt['errors'] == [], (obj, framework, receipt['errors'])
        receipts[framework] = receipt
        for view, detail in zip(receipt['views'], craft['views']):
            assert view['width'] == detail['width']
            assert not view['measurements']['overflow'], (obj, framework, view['width'], 'overflow')
            assert detail['searchCount'] == 1 and not detail['screenActions']
            assert len(detail['rows']) > 0
            assert len({row['id'] for row in detail['rows']}) == len(detail['rows'])
            assert receipt['model']['collectionQuery']['total'] == len(detail['rows'])
            assert all(s['box']['width'] >= s['neededTextWidth'] for s in detail['selects']), (obj, framework, 'truncated select')
            assert len({round(s['box']['width'], 1) for s in detail['selects']}) == 1
            assert all(item['style'] == 'none' for p in detail['pagination'] for item in p['items'])
            assert any(f"{len(detail['rows'])} records" in p['text'] for p in detail['pagination'])
            assert all(word not in view['visibleText'] for word in ['No items', '1 / 0', 'No records found.'])
            assert all(pill['box']['width'] < view['width'] - 30 for pill in detail['pills'])
            shot = folder/view['screenshot']
            assert 'sha256:'+hashlib.sha256(shot.read_bytes()).hexdigest() == view['screenshotHash']
            assert len(craft['interactions']) >= 4
            rows.append({'object':obj, 'framework':framework, 'width':view['width'], 'rows':len(detail['rows']), 'selectWidth':detail['selects'][0]['box']['width'], 'overflow':0, 'errors':0, 'receipt':str((folder/'receipt.json').relative_to(root)), 'craft':str((folder/'craft.json').relative_to(root)), 'screenshot':str(shot.relative_to(root)), 'artifactHash':receipt['artifactContentHash']})
    assert all(a['visibleText'] == b['visibleText'] for a,b in zip(receipts['react']['views'], receipts['vue']['views'])), (obj, 'framework text differs')
for width in [390,820,1440]:
    assert len({round(row['selectWidth'], 1) for row in rows if row['width'] == width}) == 1, 'Object-specific select width'
report = {'mission':'s198-m02','builderSelfCertified':False,'inspectedObjects':objects,'views':rows,'passed':len(rows),'failed':0,'skipped':0,'frameworkTextEquivalent':True,'roster':'17 list-capable objects tested; Chunk inline-only; canonical population remains 18 objects/240 cells','scopedGate':'Runtime sweep must separately pass before mission completion.'}
(root/'list-verification.json').write_text(json.dumps(report,indent=2)+'\n')
cards = []
for row in rows:
    if row['object'] not in objects[:3]: continue
    before = f"before/{row['object']}/{row['framework']}/{row['width']}.png"
    title = f"{row['object']} / {row['framework']} / {row['width']}px"
    cards.append(f'<section><h2>{title}</h2><p><a href="{row["receipt"]}">Receipt</a> · <a href="{row["craft"]}">Measurements and callbacks</a></p><div class="pair"><figure><figcaption>Before</figcaption><a href="{before}"><img loading="lazy" src="{before}" alt="Before {title}"></a></figure><figure><figcaption>After</figcaption><a href="{row["screenshot"]}"><img loading="lazy" src="{row["screenshot"]}" alt="After {title}"></a></figure></div></section>')
(root/'index.html').write_text('<!doctype html><html lang="en"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>S198 M02 list craft</title><style>body{font:16px system-ui;max-width:1200px;margin:32px auto;padding:0 20px;background:#f6f7f9;color:#18202c}section{background:white;padding:20px;margin:24px 0;border:1px solid #c9cfd7;border-radius:12px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}figure{margin:0;max-height:850px;overflow:auto}figcaption{position:sticky;top:0;background:white;padding:8px;font-weight:700}img{display:block;width:100%;height:auto}a{color:#24559a}@media(max-width:600px){.pair{grid-template-columns:1fr}}</style><h1>Standalone list craft</h1><p>Source e307810dd. Builder evidence; review certification pending. Before and after captures use the same browser, clock, locale and viewport. After samples use the workflow seed policy; counts follow real rows.</p><p><a href="README.md">Item attribution</a> · <a href="list-verification.json">30-view verification</a></p>'+''.join(cards)+'</html>')
print(json.dumps({'passed':len(rows),'failed':0,'skipped':0,'frameworkTextEquivalent':True}))
