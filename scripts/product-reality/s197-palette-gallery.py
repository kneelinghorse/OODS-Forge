"""Verify all retained palette pairs and build a self-contained visual review index."""
import argparse
import hashlib
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'artifacts/product-reality/sprint-197/m06/side-by-side'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check', action='store_true')
args = parser.parse_args()
read = lambda name: json.loads((OUT / name).read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
pairs = []
for surface, expected in [('forge', 72), ('tracelab', 18)]:
    before, after = read(f'{surface}-before.json'), read(f'{surface}-after.json')
    assert len(before['rows']) == len(after['rows']) == expected
    assert before['clock'] == after['clock']
    for old, new in zip(before['rows'], after['rows']):
        assert old['id'] == new['id']
        for row in [old, new]:
            assert sha(OUT / row['file']) == row['sha256'], f'Screenshot bytes moved: {row["file"]}'
            assert not row['errors'] and not row['observed']['overflow'], row['id']
            assert row['observed']['brand'] == row['brand'] and row['observed']['theme'] == row['theme']
        assert old['observed']['textSha256'] == new['observed']['textSha256'], f'Different rendered text: {old["id"]}'
        assert old['sha256'] != new['sha256'], f'Palette did not affect screenshot: {old["id"]}'
        if surface == 'forge':
            assert old['input'] == new['input']
            assert sha(OUT / old['input']['file']) == old['input']['sha256']
            input = read(old['input']['file'])
            for field, name in [('schema', 'schemaSha256'), ('seed', 'seedSha256')]:
                # Node JSON.stringify uses compact separators and literal Unicode.
                value = json.dumps(input[field], separators=(',', ':'), ensure_ascii=False)
                assert hashlib.sha256(value.encode()).hexdigest() == old['input'][name]
        else:
            assert old['fixtureSha256'] == new['fixtureSha256'] == sha(OUT / 'tracelab-fixture.json')
            assert old['sourceHead'] == new['sourceHead']
            assert old['observed']['font'] == new['observed']['font']
            assert all(r['method'] == 'GET' for row in [old, new] for r in row['requests'])
        pairs.append({key: old[key] for key in ['id', 'object', 'context', 'theme', 'brand', 'width']} | {
            'surface': surface, 'before': {'file': old['file'], 'sha256': old['sha256']},
            'after': {'file': new['file'], 'sha256': new['sha256']}, 'sameInputsAndText': True})
report = {'missionId': 's197-m06', 'builderSelfCertified': False, 'pairCount': len(pairs), 'screenshotCount': len(pairs) * 2,
    'forgePairs': 72, 'tracelabPairs': 18, 'horizontalOverflowCount': 0, 'pairs': pairs,
    'paletteEpochs': {'forgeBefore': 'bc12723e9b7a42a4790a98f5d2a0dc4a1f970b99 (m01 preserved bundle)',
        'tracelabBefore': '114a268ea10b9141bc96925c69132179c7c4b334 (existing consumer tarballs)',
        'after': read('forge-after.json')['head']},
    'limitations': ['Independent visual judgment pending.', 'Synthetic local data; no production service was called.',
        'Optional component chrome pass deferred.', 'Nine HC chart pixel families remain outside this light/dark comparison.']}
page = '''<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sprint 197 · Palette review</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#101114;color:#eee;font:16px/1.5 system-ui,sans-serif}main{max-width:1800px;margin:auto;padding:32px}h1{font-size:32px;margin:0}p{max-width:90ch;color:#bec1c9}a{color:#d4c2ff}label{display:flex;flex-direction:column;gap:4px}select{font:inherit;color:inherit;background:#23252b;border:1px solid #72757e;border-radius:6px;padding:8px}nav{display:flex;flex-wrap:wrap;gap:16px;margin:24px 0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}figure{margin:0;min-width:0}figcaption{font-weight:600;margin:0 0 8px}img{width:100%;height:auto;display:block;border:1px solid #5b5e67}code{font-size:12px;overflow-wrap:anywhere}.meta{font-size:14px;color:#bec1c9}details{margin:20px 0}summary{cursor:pointer}button{font:inherit;padding:8px 16px} :focus-visible{outline:3px solid #d4c2ff;outline-offset:3px}@media(max-width:700px){main{padding:16px}.pair{grid-template-columns:1fr}}
</style>
<main><h1>Palette review · Sprint 197</h1>
<p>90 comparisons, 180 retained screenshots. Both sides use the same composition, data, viewport and clock. Forge uses its current React generator on both sides. TraceLab uses an unchanged scratch frontend with synthetic local data. Select a screen and inspect the full-size images.</p>
<p><strong>Independent review pending.</strong> These sheets provide evidence for judging the palette; the builder has not certified that it looks better.</p>
<nav aria-label="Comparison filters"><label>Screen<select id="screen"></select></label><label>Brand<select id="brand"><option>A</option><option>B</option></select></label><label>Theme<select id="theme"><option>dark</option><option>light</option></select></label><label>Viewport<select id="width"><option>1440</option><option>820</option><option>390</option></select></label></nav>
<h2 id="title"></h2><div class="pair"><figure><figcaption>Before</figcaption><a id="beforeLink"><img id="before" alt="Before palette"></a><code id="beforeHash"></code></figure><figure><figcaption>After</figcaption><a id="afterLink"><img id="after" alt="After palette"></a><code id="afterHash"></code></figure></div>
<p class="meta" id="meta"></p>
<details><summary>Sources, scope and reproduction</summary><p>Forge before: bc12723e9, preserved in m01. TraceLab before: its existing 114a268e tarballs. After: the qualified s197 palette. Brand A/B primaries differ; neutral and chart roles are shared. This pass changes palette values only. The optional chrome pass is deferred. High-contrast chart pixels remain a later review.</p><p><a href="comparison.json">All screenshot hashes and pairs</a> · <a href="inputs.json">Forge composition and seed inputs</a> · <a href="tracelab-fixture.json">TraceLab local data</a> · <a href="../tracelab-repin/oods-provenance.json">Prepared package provenance</a> · <a href="../tracelab-repin/README.md">Re-pin commands</a></p></details>
</main><script>
const data = __REPORT__;
const fields=['screen','brand','theme','width'], el=Object.fromEntries(fields.map(k=>[k,document.getElementById(k)]));
const screens=[...new Set(data.pairs.map(p=>p.object+' / '+p.context))];
for(const screen of screens){const option=document.createElement('option');option.textContent=screen;el.screen.append(option)}
el.screen.value='Subscription / workflow';
function render(){const external=el.screen.value.startsWith('TraceLab');el.brand.disabled=external;if(external)el.brand.value='A';const pair=data.pairs.find(p=>p.object+' / '+p.context===el.screen.value&&p.brand===el.brand.value&&p.theme===el.theme.value&&p.width===Number(el.width.value));
 document.getElementById('title').textContent=el.screen.value+' · '+pair.theme+' · Brand '+pair.brand+' · '+pair.width+' px';
 for(const side of ['before','after']){document.getElementById(side).src=pair[side].file;document.getElementById(side).alt=side+' palette: '+document.getElementById('title').textContent;document.getElementById(side+'Link').href=pair[side].file;document.getElementById(side+'Hash').textContent='SHA-256 '+pair[side].sha256}
 document.getElementById('meta').textContent='Identical input and rendered text verified. No horizontal overflow at the captured viewport. Click either image to inspect it at full size.'}
fields.forEach(k=>el[k].addEventListener('change',render));render();
</script></html>
'''.replace('__REPORT__', json.dumps(report, separators=(',', ':')).replace('<', '\\u003c'))
for name, value in [('comparison.json', json.dumps(report, indent=2) + '\n'), ('index.html', page)]:
    if args.check: assert (OUT / name).read_text() == value, f'Stale {name}'
    else: (OUT / name).write_text(value)
print(json.dumps({key: report[key] for key in ['pairCount', 'screenshotCount', 'forgePairs', 'tracelabPairs', 'horizontalOverflowCount']}))
