import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { cssVariables } from '../../../../packages/tokens/dist/index.js';
const sha = value => createHash('sha256').update(value).digest('hex');
const attribution = JSON.parse(readFileSync('artifacts/product-reality/sprint-190/m03/golden-attribution.json', 'utf8'));
const files = attribution.files.map(row => {
  const current = sha(readFileSync(row.file)); assert.equal(current, row.afterSha256, row.file);
  return { file: row.file, sha256: current, identicalToM03: true };
});
const flatSha256 = sha(JSON.stringify(cssVariables));
const cssSha256 = sha(readFileSync('packages/tokens/dist/css/tokens.css'));
assert.equal(flatSha256, '0cc0e991e94d1fed98fe04a1ec4e18b1d9efdfa8835bd7eaa43782eb5b66f968');
assert.equal(cssSha256, '2afb1e72954af57c22bd8b279dc8d82306238c8a1ed4717191e7d51953ac2485');
writeFileSync('artifacts/product-reality/sprint-190/m05/preservation.json', JSON.stringify({ flatSha256, cssSha256, files }, null, 2) + '\n');
console.log(JSON.stringify({ flatAndCssUnchanged: true, m03GoldensUnchanged: files.length }));
