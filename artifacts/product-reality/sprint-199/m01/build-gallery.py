from pathlib import Path
import html
import json
root = Path(__file__).resolve().parent
rows = []
for object in ['organization','user','evidence','mission']:
    for framework in ['react','vue']:
        document = json.loads((root / f'apps/{object}/craft/{framework}/observations.json').read_text())
        for row in document['observations']:
            rows.append({**row,'object':object,'file':f'apps/{object}/'+row['file']})
assert len(rows) == 36
cards = []
for row in rows:
    title = f"{row['object'].title()} · {row['framework']} · {row['width']} px · {row['name']}"
    cards.append(f'<article data-object="{row["object"]}" data-width="{row["width"]}" data-framework="{row["framework"]}"><h2>{html.escape(title)}</h2><a href="{row["file"]}"><img loading="lazy" src="{row["file"]}" alt="{html.escape(title)}"></a><p><a href="{row["file"].replace(".png", ".a11y.txt")}">Accessibility tree</a></p><details><summary>Artifact and image hashes</summary><pre>{html.escape(row["artifactHash"])}\n{html.escape(row["sha256"])}</pre></details></article>')
page = '''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sprint 199 · carry fixes</title><style>body{font:16px/1.5 system-ui;margin:32px;background:#f5f6f8;color:#20242b}h1{margin-bottom:8px}header{max-width:1000px}nav{display:flex;gap:20px;flex-wrap:wrap;margin:24px 0}select{font:inherit;padding:6px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}article{padding:16px;background:white;border:1px solid #ccd0d6;border-radius:8px}article[hidden]{display:none}h2{font-size:16px}img{width:100%;height:520px;object-fit:contain;object-position:top}pre{overflow-wrap:anywhere;white-space:pre-wrap;font-size:12px}a{color:#274b84}</style><header><h1>Sprint 199 · the three carry fixes</h1><p>36 affected checkpoints · React and Vue · 390 / 820 / 1440 px. Pinned Linux Chromium. Builder self-certified: false.</p><p>Address Save replaces the displayed entry. Evidence filters disposition. Mission's timeline uses its record title.</p><p><a href="README.md">Proof notes</a> · <a href="runtime/runtime-cells.v1.json">56 runtime cells</a> · <a href="source-manifest.json">Implementation source hashes</a></p></header><nav>'''
for name, values in [('object',['organization','user','evidence','mission']),('framework',['react','vue']),('width',['390','820','1440'])]:
    page += f'<label>{name.title()} <select data-filter="{name}"><option value="">All</option>'+''.join(f'<option>{v}</option>' for v in values)+'</select></label>'
page += '</nav><main>'+''.join(cards)+'''</main><script>const filters=[...document.querySelectorAll('[data-filter]')];filters.forEach(filter=>filter.addEventListener('change',()=>document.querySelectorAll('article').forEach(card=>card.hidden=filters.some(f=>f.value&&card.dataset[f.dataset.filter]!==f.value))));</script></html>'''
(root/'index.html').write_text(page)
