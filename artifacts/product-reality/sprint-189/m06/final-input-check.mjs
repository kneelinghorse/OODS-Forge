// Bounded Sprint 189 supplemental checks; the Sprint 185 producer/auditor own closeout.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root = process.cwd();
const base = 'artifacts/product-reality/sprint-189/m06';
const proof = `${base}/final-proof`;
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const ref = file => ({ path: file, sha256: sha(fs.readFileSync(file)) });
const write = (file, value) => { assert(!fs.existsSync(file), `Evidence exists: ${file}`); fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n'); };
const head = execFileSync('git', ['rev-parse', 'HEAD'], {encoding:'utf8'}).trim();
if (process.argv[2] === 'compatibility') {
  const original = read(`${proof}/saved-original/report.json`);
  const successor = read(`${proof}/saved-successor/report.json`);
  const oldPath = 'artifacts/product-reality/sprint-186/m05/reachability/report.json';
  const adoptionPath = 'artifacts/product-reality/sprint-188/m01/adoption.json';
  const hashes = report => Object.fromEntries(report.rows.map(row => [row.schema + '.json', row.input.sha256]));
  assert.deepEqual(hashes(original), hashes(read(oldPath)));
  const adoption = read(adoptionPath);
  assert.deepEqual(hashes(successor), Object.fromEntries(Object.entries(adoption.after).filter(([file]) => file !== '_index.json')));
  assert.equal(original.reachable, 15); assert.equal(successor.reachable, 16);
  const liveRoot = '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge/packages/mcp-server/.oods/schemas';
  const live = Object.fromEntries(fs.readdirSync(liveRoot).filter(file => file.endsWith('.json')).sort().map(file => [file, sha(fs.readFileSync(path.join(liveRoot, file)))]));
  assert.deepEqual(live, adoption.after);
  write(`${proof}/saved-compatibility.json`, {sourceHead:head, originalInputsUnchanged:true, successorInputsUnchanged:true, liveStoreUnchanged:true,
    originalMeasured:15, successorMeasured:16, liveStore:{path:liveRoot, hashes:live}, references:[ref(oldPath),ref(adoptionPath)],
    reason:'The frozen original User-form remains the historical negative; the authentic successor was adopted in M01. All 17 live store hashes still equal that adoption, including the index. This read-only check does not rewrite either store.'});
  console.log('Saved compatibility passed: original 15/16, successor 16/16; 17 live hashes unchanged.');
} else if (process.argv[2] === 'handoff') {
  const movers = read(`${proof}/movers/sprint-wide-movers.json`);
  assert.equal(movers.status, 'passed'); assert.equal(movers.s189.head, head);
  const mission = read(`${base}/cmos-mission.json`); const sprint = read(`${base}/cmos-sprint.json`);
  assert.equal(mission.id, 's189-m06'); assert.equal(sprint.status, 'Active');
  const carries = read(`${base}/carries.json`); assert.equal(carries.builderSelfCertified, false); assert.equal(carries.separateReviewRequired, true);
  const draft = `PREPARED ONLY — Sprint 190 delivery; no send or PM2 restart in M06.\nImplementation: ${head}\nSprint range: ${movers.s189.base}..${head}\nSubscription collection list/timeline, reconciled form/detail, shared lifecycle text, realistic seed dates and design.preview now share the browser design loop. Independent review and craft inspection remain required. Delivery must rebuild the served checkout, verify its revision and reconnect only after Sprint 190 delivery authorization.\n\nAdvertised paths:\n${movers.s189.canonicalPaths.join('\n')}\n\nFull public runtime and documentation movers:\n${movers.s189.publicPaths.join('\n')}\n`;
  write(`${proof}/reconnect/notice-plan.json`, {status:'prepared-unsent', deliverySprint:'sprint-190', implementationHead:head, targets:['cmos://derek/aquex-mcp','cmos://derek/forge-demos'], draft});
  write(`${proof}/reconnect/deliveries.json`, []);
  console.log(`Handoff input checks passed; draft lists ${movers.s189.publicPaths.length} public movers; zero sends.`);
} else if (process.argv[2] === 'census') {
  const baselinePath = 'artifacts/product-reality/sprint-189/m03/census-before.json';
  const middlePath = 'artifacts/product-reality/sprint-189/m03/census-after.json';
  const reconciledPath = 'artifacts/product-reality/sprint-189/m04/census-after.json';
  const planningPath = 'cmos/planning/forge-s189-planning-probe/fresh-composition-census.json';
  const baseline = read(baselinePath), middle = read(middlePath), reconciled = read(reconciledPath), final = read(`${proof}/wide-census.json`);
  const classifications = ['m03', 'm04'].map(mission => ({ ...ref(`artifacts/product-reality/sprint-189/${mission}/census-diff.json`), mission: `s189-${mission}` }));
  const planning = read(planningPath); assert.equal(planning.head, baseline.head); assert.equal(final.head, head);
  assert.equal(final.rows.length, 77);
  const rows = final.rows.map(row => {
    const match = candidate => JSON.stringify(candidate.input) === JSON.stringify(row.input);
    const before = baseline.rows.find(match), planned = planning.rows.find(match), after = reconciled.rows.find(match);
    assert.deepEqual(before.cells.map(cell => ({framework:cell.framework,status:cell.status})), planned.cells.map(cell => ({framework:cell.framework,status:cell.status})));
    assert.deepEqual(row.schema, after.schema, 'post-m04 schema changes are outside the approved classes');
    const changes = classifications.flatMap(file => read(file.path).rows.find(match).changes.map(change => ({mission:file.mission,...change})));
    const changed = JSON.stringify(before.schema) !== JSON.stringify(row.schema);
    assert(!changed || changes.length > 0);
    return {input:row.input, changed, beforeHash:sha(JSON.stringify(before.schema)), afterHash:sha(JSON.stringify(row.schema)), changes};
  });
  write(`${proof}/census-diff.json`, {status:'passed',head,baseline:ref(baselinePath),middle:ref(middlePath),reconciled:ref(reconciledPath),planning:ref(planningPath),classifications,changedSchemas:rows.filter(row => row.changed).length, rows});
  console.log(`All 77 schemas compared to f4cd1ba3; ${rows.filter(row => row.changed).length} changed schemas have m03/m04 classifications; post-m04 schema changes: zero.`);
} else throw new Error('Use compatibility, census or handoff.');
