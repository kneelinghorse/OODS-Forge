// Sprint 185 planning census: which components block each vendored saved schema.
// Usage: node reachability-census.mjs <repo-root>
import fs from 'node:fs';
import path from 'node:path';
const W = process.argv[2];
const p = path.join(W, 'artifacts/product-reality/sprint-183/m04/saved-schema-store');
const files = fs.readdirSync(p).filter(f => f.endsWith('.json') && f !== '_index.json');
const nucleus = ['Badge','Banner','Button','Card','Checkbox','DatePicker','Grid','Input','Select','Stack','Table','Tabs','Text','Textarea'];
const ported = ['AuditTimeline','CancellationSummary','PaginationBar','PriceBadge','RelativeTimestamp','SearchInput','StatusBadge','StatusTimeline'];
const wave1 = ['DetailHeader','CardHeader','ColorSwatch','ColorizedBadge','VizAreaPreview'];
function walk(n, acc) { if (!n || typeof n !== 'object') return; if (Array.isArray(n)) { n.forEach(x => walk(x, acc)); return; } if (typeof n.component === 'string') acc.add(n.component); for (const k of Object.keys(n)) if (k !== 'meta') walk(n[k], acc); }
function census(gov) { const g = new Set(gov); const blockers = {}; let reachable = 0; const rows = [];
  for (const f of files) { const s = JSON.parse(fs.readFileSync(path.join(p, f), 'utf8')); const acc = new Set(); walk(s, acc); const missing = [...acc].filter(c => !g.has(c)).sort(); if (!missing.length) reachable++; missing.forEach(m => blockers[m] = (blockers[m] || 0) + 1); rows.push({ schema: f.replace('.json',''), components: acc.size, missing }); }
  return { reachable, total: files.length, blockers, rows }; }
const before = census([...nucleus, ...ported]);
const after = census([...nucleus, ...ported, ...wave1]);
console.log(`governed=${nucleus.length + ported.length} reachable=${before.reachable}/${before.total}`);
before.rows.sort((a, b) => a.missing.length - b.missing.length).forEach(r => console.log(r.schema.padEnd(34), String(r.components).padStart(3), 'missing:', r.missing.join(' ') || '(none)'));
console.log('--- blocker frequency ---'); Object.entries(before.blockers).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(String(v).padStart(2), k));
console.log(`after wave 1 (+${wave1.join(',')}): reachable=${after.reachable}/${after.total}`);
