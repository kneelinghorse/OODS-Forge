import fs from 'node:fs';
import path from 'node:path';
const dir = process.argv[2];
const self = new Map(); // functionKey -> ms
let total = 0;
for (const file of fs.readdirSync(dir)) {
  const p = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  const byId = new Map(p.nodes.map(n => [n.id, n]));
  const counts = new Map();
  for (const id of p.samples) counts.set(id, (counts.get(id) ?? 0) + 1);
  const dur = p.endTime - p.startTime; // microseconds
  const totalSamples = p.samples.length;
  if (!totalSamples) continue;
  const perSample = dur / totalSamples / 1000; // ms
  total += dur / 1000;
  for (const [id, c] of counts) {
    const n = byId.get(id); if (!n) continue;
    const cf = n.callFrame;
    const key = `${cf.functionName || '(anon)'} @ ${(cf.url || '').replace(/^file:\/\/.*?\/s204\//, '')}:${cf.lineNumber + 1}`;
    self.set(key, (self.get(key) ?? 0) + c * perSample);
  }
}
const rows = [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30);
console.log(`total wall across profiles: ${total.toFixed(0)} ms`);
for (const [k, ms] of rows) console.log(`${ms.toFixed(0).padStart(7)} ms  ${(ms/total*100).toFixed(1).padStart(5)}%  ${k}`);
