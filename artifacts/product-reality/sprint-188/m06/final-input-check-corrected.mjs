// Bounded Sprint 188 supplemental checks; the Sprint 185 producer/auditor own closeout.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root = process.cwd();
const base = 'artifacts/product-reality/sprint-188/m06';
const proof = `${base}/final-proof-corrected`;
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
  assert.equal(movers.status, 'passed'); assert.equal(movers.s188.head, head);
  const mission = read(`${base}/cmos-mission-corrected.json`); const sprint = read(`${base}/cmos-sprint.json`);
  assert.equal(mission.id, 's188-m06'); assert.equal(sprint.status, 'Active');
  const carries = read(`${base}/carries-corrected.json`); assert.equal(carries.builderSelfCertified, false); assert.equal(carries.separateReviewRequired, true);
  const draft = `PREPARED ONLY — Sprint 189 delivery; no send or PM2 restart in M06.\nImplementation: ${head}\nSprint range: ${movers.s188.base}..${head}\nSubscription now has a generated workflow application in React and Vue, eight trait-declared billing/archive recipes, nucleus discovery truth and build-stamped /health identity. Independent review and craft inspection remain required. Delivery must rebuild the served checkout, verify its revision and reconnect only after Sprint 189 delivery authorization.\n\nAdvertised paths:\n${movers.s188.canonicalPaths.join('\n')}\n\nFull public runtime and documentation movers:\n${movers.s188.publicPaths.join('\n')}\n`;
  write(`${proof}/reconnect/notice-plan.json`, {status:'prepared-unsent', deliverySprint:'sprint-189', implementationHead:head, targets:['cmos://derek/aquex-mcp','cmos://derek/forge-demos'], draft});
  write(`${proof}/reconnect/deliveries.json`, []);
  console.log(`Handoff input checks passed; draft lists ${movers.s188.publicPaths.length} public movers; zero sends.`);
} else throw new Error('Use compatibility or handoff.');
