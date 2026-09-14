"""Verify the retained chrome before/after pairs and build a self-contained review index."""
import argparse
import hashlib
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'artifacts/product-reality/sprint-200/m02/sheets'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check', action='store_true')
args = parser.parse_args()
read = lambda name: json.loads((OUT / name).read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
before, after = read('before.json'), read('after.json')
inputs = read('inputs.json')
assert before['clock'] == after['clock'] == inputs['clock']
# Both sides may run at the same commit (the mission commits at close); the built chrome sources are the discriminator.
assert before['sources'] != after['sources'], 'the built chrome must differ between sides'
changed_sources = sorted(f for f in before['sources']['files'] if before['sources']['files'][f] != after['sources']['files'][f])
# The chrome pass removes a caption that duplicated the graph's own title; nothing else may change visible text.
DECLARED_TEXT_CHANGES = {f'Relationship-detail-{theme}-{framework}-{width}': 'the placed graph no longer repeats its title as a figcaption'
    for theme in ['light', 'dark'] for framework in ['react', 'vue'] for width in [390, 820, 1440]}
DECLARED_TEXT_CHANGES |= {f'Subscription-detail-{theme}-{framework}-{width}': 'the placed payment chart renders at 720x400 and labels more axis ticks'
    for theme in ['light', 'dark'] for framework in ['react', 'vue'] for width in [390, 820, 1440]}
pairs, unchanged_pixels, text_changes = [], [], []
old_rows = {row['id']: row for row in before['rows']}
new_rows = {row['id']: row for row in after['rows']}
assert old_rows.keys() == new_rows.keys(), 'row sets differ'
for row_id, old in old_rows.items():
    new = new_rows[row_id]
    assert old['kind'] == new['kind']
    if old['kind'] == 'computed':
        pairs.append({'id': row_id, 'kind': 'computed', 'framework': old['framework'], 'theme': old['theme'], 'before': old['observed'], 'after': new['observed']})
        continue
    for row in [old, new]:
        assert sha(OUT / row['file']) == row['sha256'], f'Screenshot bytes moved: {row["file"]}'
        assert not row['errors'], row_id
    if old['kind'] == 'screen':
        assert old['input'] == new['input'] and sha(OUT / old['input']['file']) == old['input']['sha256']
        assert not old['observed']['overflow'] and not new['observed']['overflow'], f'horizontal overflow: {row_id}'
        if old['observed']['textSha256'] != new['observed']['textSha256']:
            text_changes.append(row_id)
    if old['sha256'] == new['sha256']: unchanged_pixels.append(row_id)
    pair = {key: old.get(key) for key in ['id', 'kind', 'object', 'context', 'theme', 'framework', 'width']}
    pair |= {'before': {'file': old['file'], 'sha256': old['sha256']}, 'after': {'file': new['file'], 'sha256': new['sha256']},
             'pixelsChanged': old['sha256'] != new['sha256'], 'textChanged': old['kind'] == 'screen' and old['observed']['textSha256'] != new['observed']['textSha256']}
    if old['kind'] == 'focus': pair['focus'] = {'before': old['observed'], 'after': new['observed']}
    pairs.append(pair)
undeclared = sorted(row_id for row_id in text_changes if row_id not in DECLARED_TEXT_CHANGES)
assert not undeclared, f'undeclared text changes: {undeclared}'
screens = [pair for pair in pairs if pair['kind'] == 'screen']
expected = {f'{o}-{c}-{t}-{f}-{w}' for o in ['Subscription', 'Organization', 'Relationship'] for c in ['list', 'detail', 'form', 'timeline'] for t in ['light', 'dark'] for f in ['react', 'vue'] for w in [390, 820, 1440]}
assert {pair['id'] for pair in screens} == expected, 'screen coverage differs from the promised population'
assert len([pair for pair in pairs if pair['kind'] == 'components']) == 8 and len([pair for pair in pairs if pair['kind'] == 'focus']) == 8
report = {'missionId': 's200-m02', 'builderSelfCertified': False, 'heads': {'before': before['head'], 'after': after['head']}, 'sources': {'before': before['sources']['files'], 'after': after['sources']['files'], 'changed': changed_sources},
          'pairCount': len([p for p in pairs if p['kind'] != 'computed']), 'screenPairs': len(screens), 'componentPairs': 8, 'focusPairs': 8,
          'screenshotCount': 2 * len([p for p in pairs if p['kind'] != 'computed']), 'horizontalOverflowCount': 0,
          'declaredTextChanges': {row_id: DECLARED_TEXT_CHANGES[row_id] for row_id in sorted(text_changes)}, 'unchangedPixels': sorted(unchanged_pixels), 'pairs': pairs,
          'limitations': ['Independent visual judgment pending.', 'Brand A only; both frameworks, both themes, three widths.', 'Synthetic seed data from the composed schemas; no live service.']}
if args.check:
    print(json.dumps({'pairCount': report['pairCount'], 'screenPairs': report['screenPairs'], 'screenshotCount': report['screenshotCount'], 'textChanges': len(text_changes), 'unchangedPixels': len(unchanged_pixels), 'horizontalOverflowCount': 0}))
    existing = json.loads((OUT / 'comparison.json').read_text())
    assert existing == report, 'comparison.json is stale; rerun without --check'
    raise SystemExit(0)
(OUT / 'comparison.json').write_text(json.dumps(report, indent=2) + '\n')
options = lambda values: ''.join(f'<option>{html.escape(str(v))}</option>' for v in values)
computed = {pair['id']: pair for pair in pairs if pair['kind'] == 'computed'}
computed_rows = ''.join(f"<tr><th>{html.escape(k)}</th><td><code>{html.escape(json.dumps(pair['before'][k]))}</code></td><td><code>{html.escape(json.dumps(pair['after'][k]))}</code></td></tr>"
    for pair_id, pair in computed.items() if pair['framework'] == 'react' and pair['theme'] == 'light' for k in pair['before'])
page = f'''<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sprint 200 · Chrome pass review</title>
<style>
*{{box-sizing:border-box}}body{{margin:0;background:#101114;color:#eee;font:16px/1.5 system-ui,sans-serif}}main{{max-width:1800px;margin:auto;padding:32px}}h1{{font-size:32px;margin:0}}h2{{font-size:20px;margin:32px 0 8px}}p{{max-width:90ch;color:#bec1c9}}label{{display:flex;flex-direction:column;gap:4px}}select{{font:inherit;color:inherit;background:#23252b;border:1px solid #72757e;border-radius:6px;padding:8px}}nav{{display:flex;flex-wrap:wrap;gap:16px;margin:24px 0}}.pair{{display:grid;grid-template-columns:1fr 1fr;gap:16px}}figure{{margin:0;min-width:0}}figcaption{{font-weight:600;margin:0 0 8px}}img{{width:100%;height:auto;display:block;border:1px solid #5b5e67}}code{{font-size:12px;overflow-wrap:anywhere}}.meta{{font-size:14px;color:#bec1c9}}table{{border-collapse:collapse;font-size:14px}}td,th{{border:1px solid #3a3c44;padding:4px 8px;text-align:left;vertical-align:top}} :focus-visible{{outline:3px solid #d4c2ff;outline-offset:3px}}@media(max-width:700px){{main{{padding:16px}}.pair{{grid-template-columns:1fr}}}}
</style>
<main><h1>Chrome pass review · Sprint 200 m02</h1>
<p>{report['pairCount']} comparisons, {report['screenshotCount']} retained screenshots: {report['screenPairs']} generated screens (Subscription, Organization, Relationship × list, detail, form, timeline × React, Vue × light, dark × 390/820/1440), eight component sheets and eight keyboard-focus crops. Both sides use the same composition, seed data, viewport and clock; before was captured from the untouched tree at {before['head'][:9]}, after from the chrome-pass tree ({len(changed_sources)} built sources changed: {html.escape(', '.join(changed_sources))}).</p>
<p><strong>Independent review pending.</strong> The builder has not certified that it looks better. {len(text_changes)} screens changed visible text, all declared: the placed graph no longer repeats its title and the larger payment chart labels more ticks. {len(unchanged_pixels)} pairs are pixel-identical.</p>
<nav aria-label="Comparison filters"><label>Kind<select id="kind"><option>screen</option><option>components</option><option>focus</option></select></label><label>Screen<select id="screen">{options([f'{o}-{c}' for o in ['Subscription', 'Organization', 'Relationship'] for c in ['list', 'detail', 'form', 'timeline']])}</select></label><label>Framework<select id="framework"><option>react</option><option>vue</option></select></label><label>Theme<select id="theme"><option>light</option><option>dark</option></select></label><label>Viewport<select id="width"><option>1440</option><option>820</option><option>390</option></select></label></nav>
<div class="pair"><figure><figcaption>Before</figcaption><img id="before" alt="Before"><p class="meta" id="before-meta"></p></figure><figure><figcaption>After</figcaption><img id="after" alt="After"><p class="meta" id="after-meta"></p></figure></div>
<h2>Computed chrome, React light component sheet</h2><table><thead><tr><th>Probe</th><th>Before</th><th>After</th></tr></thead><tbody>{computed_rows}</tbody></table>
<script>
const pairs = {json.dumps([p for p in pairs if p['kind'] != 'computed'])};
const byId = Object.fromEntries(pairs.map(p => [p.id, p]));
const select = id => document.getElementById(id);
function render() {{
  const kind = select('kind').value, framework = select('framework').value, theme = select('theme').value, width = select('width').value;
  const id = kind === 'screen' ? `${{select('screen').value}}-${{theme}}-${{framework}}-${{width}}` : kind === 'components' ? `components-${{framework}}-${{theme}}-${{width === '390' ? '390' : '1440'}}` : `components-${{framework}}-${{theme}}-focus-${{width === '390' ? 'field' : 'button'}}`;
  const pair = byId[id]; if (!pair) return;
  select('before').src = pair.before.file; select('after').src = pair.after.file;
  select('before-meta').textContent = `${{id}} · ${{pair.before.sha256.slice(0, 12)}}`; select('after-meta').textContent = `${{pair.after.sha256.slice(0, 12)}} · pixels ${{pair.pixelsChanged ? 'changed' : 'identical'}}${{pair.textChanged ? ' · text changed (declared)' : ''}}`;
}}
for (const id of ['kind', 'screen', 'framework', 'theme', 'width']) select(id).addEventListener('change', render);
render();
</script></main></html>
'''
(OUT / 'index.html').write_text(page)
print(json.dumps({'pairCount': report['pairCount'], 'screenPairs': report['screenPairs'], 'screenshotCount': report['screenshotCount'], 'textChanges': len(text_changes), 'unchangedPixels': len(unchanged_pixels)}))
