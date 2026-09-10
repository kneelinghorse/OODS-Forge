import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { validateReceipt, verifyTheme } from '../../../../scripts/design-loop/common.js';
const base = 'artifacts/product-reality/sprint-191/m01';
const hash = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const read = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'));
const receipts = [], parity = [], appChanges = [];
for (const theme of ['light', 'dark']) for (const context of ['list', 'detail', 'workflow', 'workflow-detail']) {
  const observations = [];
  for (const framework of ['react', 'vue']) {
    const file = `${base}/browser/${theme}/${context}/${framework}/receipt.json`;
    const receipt = read(file);
    await validateReceipt(receipt); verifyTheme(receipt);
    assert.equal(receipt.version, '1.1'); assert.equal(receipt.theme, theme);
    assert.equal(receipt.brand, theme === 'dark' ? 'B' : 'A');
    assert.deepEqual(receipt.errors, []);
    assert.deepEqual(receipt.views.map((view: any) => view.width), [390, 820, 1440]);
    for (const view of receipt.views) {
      assert.deepEqual(view.measurements.overflow, []);
      assert.equal(view.measurements.documentWidth, view.width);
      assert.equal(view.measurements.chartCanvasFills.length, context.endsWith('detail') ? 1 : 0);
      assert.equal('sha256:' + hash(fs.readFileSync(path.join(path.dirname(file), view.screenshot))), view.screenshotHash);
    }
    observations.push(receipt.views.map((view: any) => ({ width: view.width, bodyBackground: view.measurements.bodyBackground, chartCanvasFills: view.measurements.chartCanvasFills, overflow: view.measurements.overflow })));
    receipts.push({file,sha256:hash(fs.readFileSync(file)),theme,context,framework,sourceHead:receipt.sourceHead});
    if (theme === 'light' && context === 'workflow') {
      const previousPath = `artifacts/product-reality/sprint-190/m06/final/after/light/${framework}/artifact.json`;
      const previous = read(previousPath), current = read(file.replace('receipt.json', 'artifact.json'));
      const old = new Map(previous.files.map((entry: any) => [entry.path, entry]));
      const changes = current.files.filter((entry: any) => (old.get(entry.path) as any)?.contentHash !== entry.contentHash)
        .map((entry: any) => ({file:entry.path,before:(old.get(entry.path) as any)?.contentHash,after:entry.contentHash,reason:entry.path==='src/app.css'?'governed surface/text/border/button colors and native color-scheme':'theme/brand selection on shell and at mount'}));
      assert.deepEqual(changes.map((entry: any)=>entry.file),['index.html','src/app.css',framework==='react'?'src/main.tsx':'src/main.ts']);
      appChanges.push({framework,previousPath,changes});
    }
  }
  assert.deepEqual(observations[0], observations[1], `${theme}/${context} theme parity`);
  parity.push({theme,context,differences:[]});
}
fs.writeFileSync(`${base}/browser-proof.json`,JSON.stringify({status:'passed',receipts:receipts.length,screenshots:receipts.length*3,allowlist:[],parity,files:receipts,appChanges,scope:'Theme/canvas/error/overflow parity. Existing craft differences belong to s191-m03; this is not a claim of complete visual equivalence.'},null,2)+'\n');
console.log(JSON.stringify({receipts:receipts.length,screenshots:receipts.length*3,themeParityDifferences:0,errors:0,overflow:0,lightWorkflowChangedFiles:3}));
