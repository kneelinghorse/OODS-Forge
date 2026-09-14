from pathlib import Path
import json, subprocess

root = Path(__file__).resolve().parents[5]
base = root / 'artifacts/product-reality/sprint-198/m07'
read = lambda file: json.loads(file.read_text())
runtime = read(base / 'runtime/runtime-cells.v1.json')
assert len(runtime['rows']) == 240 and all(row['status'] == 'pass' for row in runtime['rows'])
assert read(base / 'runtime/validation.json')['issues'] == []
themes = [read(base / f'{target}-theme/report.json') for target in ['react', 'vue']]
assert all(row['status'] == 'passed' and row['failed'] == row['skipped'] == 0 for row in themes)
assert sum(row['rootCells'] for row in themes) == 1308
composition = read(base / 'component-census/report.json')
assert composition['greenTotalSchemas'] == 77 and composition['greenTotalCells'] == 154
assert len(composition['objects']) == 11 and len(composition['availableObjects']) == 18
stores = read(base / 'saved-compatibility.json')
assert stores['cohortFiles'] == 17 and stores['liveStoreFiles'] == 37
assert stores['changedCohortFiles'] == stores['changedLiveFiles'] == 0
assert sum(len(row['renderScopes']) for row in read(base / 'viz/viz-census.json')) == 78
assert len(read(base / 'patterns/pattern-observations.json')['cells']) == 84
assert len(read(root / 'packages/mcp-server/registry/tool-capability-ledger.v1.json')['rows']) == 24
file = root / 'cmos/foundational-docs/roadmap/near.md'
current = file.read_text()
marker = '\n---\n\n# Retained record —'
top, retained = current.split(marker, 1)
original = subprocess.check_output(['git', 'show', '2ea59fe9cf7f3d0fbfa05ee50ef920815defe1bb:cmos/foundational-docs/roadmap/near.md'], cwd=root, text=True)
assert original.split(marker, 1)[1] == retained
assert '198 — **LOCKED 2026-09-13**' in top
top = top.replace('198 — **LOCKED 2026-09-13**', '198 — **BUILT, REVIEW PENDING**', 1)
top = top.replace('### Sprint 198 — Application craft — LOCKED 2026-09-13', '### Sprint 198 — Application craft — BUILT, REVIEW PENDING', 1)
row = next(line for line in top.splitlines() if '| 198 — **BUILT, REVIEW PENDING**' in line)
cells = row.split('|')
assert len(cells) == 6
cells[3] = cells[3].rstrip() + '; measured **240/240 runtime cells**, **1,308/1,308 component cells**, **77/77 retained schemas**, and **18 canonical objects** '
top = top.replace(row, '|'.join(cells), 1)
anchor = "The Product Reality Program's eighth exit criterion"
assert anchor in top
record = f'''Build evidence: canonical runtime **240/240** from frozen implementation `{runtime['head']}`, across **18 objects** (Chunk inline-only); component themes **1,308/1,308** across React/Vue, both brands and light/dark/HC. The separate retained comparison is **77/77 schemas / 154 cells over 11 objects**, not the full 18-object population. The 78-cell chart census and 84-cell pattern census retain their existing typed gaps and registry hashes. Tool ledger: **24 rows (19 auto, 5 on-demand)**. Saved compatibility: the original **17-file cohort** and the current **37-file store** are unchanged. [Application receipts](../../../artifacts/product-reality/sprint-198/m05/index.html) and [research receipts](../../../artifacts/product-reality/sprint-198/m06/index.html) support independent review. `builderSelfCertified:false`; usable certification is pending. The release-profile claim is explicitly narrowed: **References are format-checked and hash-bound, not re-executed.** Optional visual chrome is carried to Sprint200; research sample-timestamp and classification limits remain disclosed in m06. No reconnect, delivery or consumer notice is included.

'''
top = top.replace(anchor, record + anchor, 1)
file.write_text(top + marker + retained)
assert file.read_text().split(marker, 1)[1] == retained
print('Updated only the current Sprint198 roadmap section and row; retained history is byte-identical.')
