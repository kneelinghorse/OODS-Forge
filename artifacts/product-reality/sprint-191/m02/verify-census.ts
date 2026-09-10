import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (file: string) => JSON.parse(fs.readFileSync(path.resolve(root, file), 'utf8'));
const before = read('artifacts/product-reality/sprint-190/m06/final/proof/component-census/report.json');
const after = read('artifacts/product-reality/sprint-191/m02/census/report.json');
const key = (row: any) => `${row.input.object}/${row.input.context}`;
const previous = new Map(before.allRows.map((row: any) => [key(row), row]));
const changes = [], singles = [];
assert.equal(after.totalSchemas, 77); assert.equal(after.greenTotalSchemas, 77);
assert.equal(after.totalCells, 154); assert.equal(after.greenTotalCells, 154);
for (const row of after.allRows) {
  const old: any = previous.get(key(row)); assert.ok(old);
  if (old.green !== row.green) changes.push({ schema: key(row), before: {green:old.green,errors:old.cells.map((cell:any)=>cell.errors)}, after: {green:row.green,errors:row.cells.map((cell:any)=>cell.errors)} });
  if (row.input.context === 'workflow') continue;
  for (const cell of row.cells) {
    const oldCell = old.cells.find((item: any) => item.framework === cell.framework);
    const oldArtifact = read(oldCell.response.path).artifact, newArtifact = read(cell.response.path).artifact;
    assert.equal(newArtifact.contentHash, oldArtifact.contentHash, `${key(row)}/${cell.framework} single-screen artifact must remain byte-identical`);
    singles.push({schema:key(row),framework:cell.framework,before:oldArtifact.contentHash,after:newArtifact.contentHash});
  }
}
assert.deepEqual(changes.map(row=>row.schema).sort(), ['Organization/workflow','User/workflow']);
assert.equal(singles.length,132);
fs.writeFileSync('artifacts/product-reality/sprint-191/m02/census-attribution.json',JSON.stringify({status:'passed',schemaCount:77,greenSchemas:77,generationCells:154,greenCells:154,singleScreenSchemas:66,unchangedSingleScreenCells:132,changes,singles},null,2)+'\n');
console.log('77/77 schemas; 154/154 cells; exactly two status changes; 132 single-screen artifact hashes unchanged.');
