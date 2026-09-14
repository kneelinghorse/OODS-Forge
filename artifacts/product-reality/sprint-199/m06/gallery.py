"""Index retained graph screenshots without altering evidence pixels."""
from pathlib import Path
import json
root = Path(__file__).resolve().parent
report = json.loads((root / 'graph-browser/report.json').read_text())
assert report['selected'] == 12 and report['failed'] == report['skipped'] == 0
cells = [(row['id'], 'graph-browser/' + row['screenshot']) for row in report['cells']]
for framework in ['react', 'vue']:
    apps = json.loads((root / f'apps/relationship/graph-{framework}.json').read_text())
    cells += [(f"{framework} {row['name']} {row['width']}px", 'apps/relationship/' + row['screenshot']) for row in apps['rows'] if 'screenshot' in row]
(root / 'index.html').write_text('<!doctype html><meta charset="utf-8"><title>S199 Relationship graph proofs</title><style>body{font:16px system-ui;max-width:1200px;margin:2em auto;padding:1em}img{max-width:100%;max-height:900px;border:1px solid #aaa}figure{display:inline-block;vertical-align:top;margin:1em}figcaption{margin:.5em 0}</style><h1>Relationship graph proof</h1><p>Static public SVG, synthetic neighborhood edges. Builder self-certified: false. Light/dark categorical contrast remains ungradeable for this ungrouped operand; browser-visible marks and named wrappers are measured.</p>' + ''.join(f'<figure><figcaption>{name}</figcaption><a href="{file}"><img src="{file}"></a></figure>' for name, file in cells))
print(f'{len(cells)} existing screenshots indexed')
