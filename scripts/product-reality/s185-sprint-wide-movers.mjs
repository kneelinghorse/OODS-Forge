#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CANONICAL_ADVERTISED_SCOPE, gitDiffPaths, gitFileBytes, resolveCommit } from './s184-m07-reconnect.mjs';

export { CANONICAL_ADVERTISED_SCOPE };
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const S185_BASE = '1118f436345e160437abfedbe73a19f190a92562';
export const S184_BASE = '2f94e31384949f3030600d18542be20615332b6e';
export const OUTPUT = 'artifacts/product-reality/sprint-185/m05/movers';
export const PUBLIC_RUNTIME_SCOPE = Object.freeze([
  ...CANONICAL_ADVERTISED_SCOPE,
  'packages/component-contracts/package.json', 'packages/component-contracts/src', 'packages/component-contracts/registry',
  'packages/component-styles/package.json', 'packages/component-styles/src', 'packages/component-styles/scripts', 'packages/component-styles/tsup.config.ts',
  'packages/components-react/package.json', 'packages/components-react/src', 'packages/components-react/evidence', 'packages/components-react/tsup.config.ts',
  'packages/components-vue/package.json', 'packages/components-vue/src', 'packages/components-vue/evidence', 'packages/components-vue/tsup.config.ts', 'packages/components-vue/tsup.ported.config.ts',
  'packages/mcp-server/src/codegen', 'packages/mcp-server/src/render', 'packages/mcp-server/src/errors/registry.ts', 'packages/mcp-server/src/tools/code.generate.ts',
]);
export const TABLE_PATHS = Object.freeze(['packages/components-react/src/table.tsx', 'packages/components-vue/src/table.ts']);
const canonical = value => `${JSON.stringify(value, null, 2)}\n`;
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function compareDeclaredPaths(observed, declared) {
  assert(new Set(declared).size === declared.length, 'Declared movers contain duplicates.');
  return { missingFromDeclaration: observed.filter(file => !declared.includes(file)),
    extraInDeclaration: declared.filter(file => !observed.includes(file)) };
}

export function deriveRange(base, head, root = ROOT) {
  const resolvedBase = resolveCommit(base, root);
  const resolvedHead = resolveCommit(head, root);
  const canonicalPaths = gitDiffPaths(resolvedBase, resolvedHead, [...CANONICAL_ADVERTISED_SCOPE], { repositoryRoot: root, excludeTests: true });
  const publicPaths = gitDiffPaths(resolvedBase, resolvedHead, [...PUBLIC_RUNTIME_SCOPE], { repositoryRoot: root, excludeTests: true });
  assert(canonicalPaths.every(file => publicPaths.includes(file)), 'Public scope lost a canonical path.');
  return { base: resolvedBase, head: resolvedHead,
    canonicalCommand: ['git', 'diff', '--name-only', `${resolvedBase}..${resolvedHead}`, '--', ...CANONICAL_ADVERTISED_SCOPE],
    publicCommand: ['git', 'diff', '--name-only', `${resolvedBase}..${resolvedHead}`, '--', ...PUBLIC_RUNTIME_SCOPE],
    excluded: 'Test files only; all commands use the single sprint range, never per-mission ranges.',
    canonicalPaths, publicPaths, supplementalRuntimePaths: publicPaths.filter(file => !canonicalPaths.includes(file)) };
}

/** The historical scope really missed a committed runtime behavior change. */
export function replayTableOmission(root = ROOT) {
  const recordPath = 'artifacts/product-reality/sprint-184/m05/advertised-movers.json';
  const historical = JSON.parse(gitFileBytes(S185_BASE, recordPath, root));
  const oldScoped = gitDiffPaths(historical.baseCommit, historical.measuredImplementationCommit,
    historical.derivation.includedPaths, { repositoryRoot: root, excludeTests: true });
  const oldRuntime = gitDiffPaths(historical.baseCommit, historical.measuredImplementationCommit,
    [...PUBLIC_RUNTIME_SCOPE], { repositoryRoot: root, excludeTests: true });
  const wholeSprint = deriveRange(S184_BASE, S185_BASE, root);
  const cases = TABLE_PATHS.map(file => {
    const before = gitFileBytes(historical.baseCommit, file, root).toString('utf8');
    const after = gitFileBytes(historical.measuredImplementationCommit, file, root).toString('utf8');
    const row = { path: file, actuallyChangedInMission: oldRuntime.includes(file) && before !== after,
      absentBefore: !before.includes('No rows available.'), presentAfter: after.includes('No rows available.'),
      oldPerMissionCaught: oldScoped.includes(file), canonicalScopeCaught: wholeSprint.canonicalPaths.includes(file),
      publicSprintWideCaught: wholeSprint.publicPaths.includes(file) };
    assert(row.actuallyChangedInMission && row.absentBefore && row.presentAfter && !row.oldPerMissionCaught
      && !row.canonicalScopeCaught && row.publicSprintWideCaught, `Table omission replay no longer discriminates: ${file}`);
    return row;
  });
  return { status: 'passed', historicalRecord: recordPath, base: historical.baseCommit, head: historical.measuredImplementationCommit,
    cases, decision: 1740,
    limitation: 'The legacy canonical schema/tool scope excludes Table. The explicit public runtime supplement is necessary; changing the sprint range alone cannot repair an incomplete scope.' };
}

export function deriveMovers(head, declaration, root = ROOT) {
  const s184 = deriveRange(S184_BASE, S185_BASE, root);
  const s185 = deriveRange(S185_BASE, head, root);
  const comparison = {};
  for (const [sprint, range] of Object.entries({ s184, s185 })) {
    comparison[sprint] = {};
    for (const surface of ['canonicalPaths', 'publicPaths']) {
      assert(Array.isArray(declaration?.[sprint]?.[surface]), `Missing ${sprint}/${surface} declaration.`);
      const result = compareDeclaredPaths(range[surface], declaration[sprint][surface]);
      assert(result.missingFromDeclaration.length === 0 && result.extraInDeclaration.length === 0,
        `${sprint}/${surface}: declared mover union differs: ${canonical(result)}`);
      comparison[sprint][surface] = result;
    }
  }
  return { missionId: 's185-m05', status: 'passed', canonicalScope: CANONICAL_ADVERTISED_SCOPE,
    publicScope: PUBLIC_RUNTIME_SCOPE, s184, s185, comparison, tableControl: replayTableOmission(root) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const headIndex = process.argv.indexOf('--head');
  const head = resolveCommit(headIndex >= 0 ? process.argv[headIndex + 1] : 'HEAD', ROOT);
  const directory = path.join(ROOT, OUTPUT); fs.mkdirSync(directory, { recursive: true });
  const declarationPath = path.join(directory, 'declared-movers.json');
  if (process.argv.includes('--declare')) {
    assert(!fs.existsSync(declarationPath), 'Refusing to replace an existing mover declaration. Review differences explicitly.');
    const declaration = { missionId: 's185-m05', declarationHead: head,
      method: 'One reviewed declaration per sprint range; later checks independently re-run both Git diffs and reject additions or omissions.',
      s184: deriveRange(S184_BASE, S185_BASE), s185: deriveRange(S185_BASE, head) };
    fs.writeFileSync(declarationPath, canonical(declaration));
  }
  const report = deriveMovers(head, JSON.parse(fs.readFileSync(declarationPath, 'utf8')));
  const outputPath = path.join(directory, 'sprint-wide-movers.json');
  if (process.argv.includes('--check')) assert(fs.readFileSync(outputPath, 'utf8') === canonical(report), 'Mover report is stale.');
  else fs.writeFileSync(outputPath, canonical(report));
  process.stdout.write(canonical({ head, s184: { canonical: report.s184.canonicalPaths.length, public: report.s184.publicPaths.length },
    s185: { canonical: report.s185.canonicalPaths.length, public: report.s185.publicPaths.length }, tableControl: report.tableControl.status }));
}
