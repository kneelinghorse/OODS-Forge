import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const [input, output] = process.argv.slice(2);
const names = snapshot => snapshot.split('\n').flatMap(line => {
  const match = line.match(/^\s*-\s+([\w-]+)\s+("(?:[^"\\]|\\.)*")/);
  return match ? [{ role: match[1], name: JSON.parse(match[2]) }] : [];
});
const text = value => value.replace(/\s+/g, ' ').trim();
const rows = [];
for (const screen of ['review-form', 'review-detail']) {
  const react = JSON.parse(fs.readFileSync(path.join(input, screen, 'react/receipt.json')));
  const vue = JSON.parse(fs.readFileSync(path.join(input, screen, 'vue/receipt.json')));
  for (const left of react.views) {
    const right = vue.views.find(view => view.width === left.width);
    assert.equal(typeof left.visibleText, 'string'); assert.equal(typeof right.visibleText, 'string');
    const observed = { react: { text: text(left.visibleText), names: names(left.accessibility) }, vue: { text: text(right.visibleText), names: names(right.accessibility) } };
    const differences = [];
    if (observed.react.text !== observed.vue.text) differences.push('visible text');
    if (JSON.stringify(observed.react.names) !== JSON.stringify(observed.vue.names)) differences.push('accessible names in DOM order');
    rows.push({ screen, width: left.width, differences, observed });
  }
}
const report = { allowlist: [], normalization: 'Collapse whitespace in visible text; retain every visible symbol, letter case and named accessibility role in DOM order.', differenceCount: rows.reduce((sum, row) => sum + row.differences.length, 0), rows };
fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, rows: report.rows.map(({ observed, ...row }) => row) }));
assert.equal(report.differenceCount, 0);
