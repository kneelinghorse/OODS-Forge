#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CANONICAL_ADVERTISED_SCOPE, gitFileBytes, isTestPath, resolveCommit } from './s184-m07-reconnect.mjs';

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
// Sprint 186's form repair changes composition before code generation. Keep the
// historical s185 scope stable while covering both newly advertised operands.
export const S186_PUBLIC_RUNTIME_SCOPE = Object.freeze([
  ...PUBLIC_RUNTIME_SCOPE,
  'packages/mcp-server/src/compose', 'packages/mcp-server/src/tools/design.compose.ts',
]);
// Sprint 187 adds live structured discovery and its retained-obligation contract.
export const S187_BASE = '21c7c31906fbb81d049b943155c64ed78409fb9f';
export const S187_PUBLIC_RUNTIME_SCOPE = Object.freeze([
  ...S186_PUBLIC_RUNTIME_SCOPE,
  'packages/mcp-server/src/tools/catalog.list.ts', 'packages/mcp-server/src/tools/catalog.shared.ts', 'packages/mcp-server/src/tools/types.ts',
  'cmos/scripts/refresh_structured_data.py', 'cmos/planning/component-schema.json',
  'cmos/planning/oods-components.json', 'cmos/planning/oods-tokens.json',
  'artifacts/structured-data', 'docs/mcp/Tool-Specs.md', 'docs/mcp/Structured-Data-Refresh.md', 'docs/api/catalog-list.md', 'docs/how-forge-works.html',
]);
// Sprint 188 adds the generated workflow contract and build-stamped bridge identity.
export const S188_BASE = 'cd8ee986db40e73a3fb9a9f1ec7b7db6de9ca076';
export const S188_PUBLIC_RUNTIME_SCOPE = Object.freeze([
  ...S187_PUBLIC_RUNTIME_SCOPE, 'packages/mcp-bridge/src', 'packages/mcp-bridge/package.json',
  'packages/mcp-server/package.json', 'scripts/build-revision.mjs', 'cmos/foundational-docs/roadmap/near.md',
  'scripts/runtime/assemble.mjs', '.github/workflows/ci.yml',
]);
export const S189_BASE = 'f4cd1ba3cda3d1d52405582e425ecd6d19890b51';
export const S189_PUBLIC_RUNTIME_SCOPE = Object.freeze([...S188_PUBLIC_RUNTIME_SCOPE,
  'scripts/design-loop', 'packages/mcp-server/src/tools/design.preview.ts', 'packages/mcp-server/src/index.ts', 'packages/mcp-server/src/tools/registry.ts', 'agents.md', 'README.md', 'package.json']);
export const S190_BASE = 'c3a68d5f';
export const S190_PUBLIC_RUNTIME_SCOPE = Object.freeze([...S189_PUBLIC_RUNTIME_SCOPE, 'packages/tokens', 'packages/viz-core', 'packages/viz-render', 'packages/mcp-server/src/tools/viz.render.ts', 'packages/mcp-server/src/tools/dashboard.render.ts', 'packages/mcp-server/src/tools/artifact.certify.ts', 'packages/mcp-server/src/tools/certify-contrast.ts', 'packages/mcp-server/src/tools/certify-echarts-emit.ts', 'packages/mcp-server/src/tools/certify-echarts-render-contrast.ts', 'objects', 'traits', 'src/types/oods-tokens.d.ts', 'src/registry/trait-loader.ts', 'src/registry/parameter-applier.ts', 'schemas/traits/mark-area.parameters.schema.json', 'generated/types/traits/mark-area.parameters.ts', 'cmos/foundational-docs/roadmap/product-reality-program.md']);
export const S191_BASE = 'd3a99d39';
export const S191_PUBLIC_RUNTIME_SCOPE = Object.freeze([...S190_PUBLIC_RUNTIME_SCOPE, 'scripts/runtime']);
export const S192_BASE = '5fdf8a18';
export const S192_PUBLIC_RUNTIME_SCOPE = Object.freeze([...S191_PUBLIC_RUNTIME_SCOPE, 'scripts/product-reality/component-package-suite.mjs', 'scripts/product-reality/component-theme-proof.mjs', 'scripts/product-reality/s192-token-resolution.mjs', 'scripts/product-reality/scenario-interactions.ts', 'packages/components-react/scripts', 'packages/components-vue/scripts']);
export const S193_BASE = 'c098237f1a1d026df4f1ad5c0ca51b15ebab0f4d';
export const S193_PUBLIC_RUNTIME_SCOPE = Object.freeze([...S192_PUBLIC_RUNTIME_SCOPE, 'packages/mcp-server/src/lib/runtime-ledger.ts', 'packages/mcp-server/src/lib/tool-ledger.ts', 'packages/mcp-server/src/tools/health.ts', 'packages/mcp-server/registry', 'scripts/product-reality/s193-runtime-cells.ts', 'scripts/product-reality/s193-workflow-cells.ts', 'scripts/product-reality/s193-tool-truth.mjs', 'scripts/product-reality/s193-tool-caveats.json', 'scripts/product-reality/s184-m06-live-consumers.ts', 'scripts/product-reality/s185-m04-consumer-contract.ts', 'scripts/product-reality/s185-closeout.mjs', 'scripts/product-reality/s185-audit-closeout.mjs', 'scripts/product-reality/s185-suite-accounting.mjs', 'scripts/product-reality/s185-sprint-wide-movers.mjs', 'scripts/product-reality/s185-reconnect.mjs', 'packages/component-contracts/fixtures/viz-preview-samples.v1.json', 'scripts/product-reality/s188-m03-app-consumers.ts', 'scripts/product-reality/trait-recipe-assertions.ts', 'scripts/product-reality/viz-recipe-assertions.ts', 'schemas/traits', 'generated/types/traits', 'generated/types/index.ts', 'cmos/foundational-docs/closeout-checklist.md']);
export const S194_BASE = '1f69c957f4435a0a2f18b168b684de050f7a5f22';
export const S194_PUBLIC_RUNTIME_SCOPE = Object.freeze([...S193_PUBLIC_RUNTIME_SCOPE, 'packages/mcp-server/src', 'packages/mcp-adapter', 'packages/mcp-sdk', 'configs/agent/policy.json', 'docs/api', 'docs/mcp', 'docs/runtime', 'docs/how-forge-works.html', 'scripts/product-reality/s194-input-options.mjs']);
export const S195_BASE = '5b25c3c9ec795315bf52a698d135c96bffd66393';
export const S195_PUBLIC_RUNTIME_SCOPE = Object.freeze([...S194_PUBLIC_RUNTIME_SCOPE,
  'domains/saas-billing', 'src/core/trait-definition.ts', 'docs/viz', 'docs/authoring-traits-viz.md',
  'examples/viz/patterns-v2', 'scripts/product-reality/s190-viz-census.ts',
  'scripts/product-reality/s195-attribute-viz-goldens.py', 'scripts/product-reality/s195-certify-profile-migration.mjs',
  'scripts/product-reality/s195-certify-profile-receipt.ts', 'scripts/product-reality/s195-certify-profile-schema.ts',
  'scripts/product-reality/s195-chart-declaration-schema.ts', 'scripts/product-reality/s195-hc-browser.ts',
  'scripts/product-reality/s195-hc-built-receipt.ts', 'scripts/product-reality/s195-hc-schema.ts',
  'scripts/product-reality/s195-health-viz-schema.ts', 'scripts/product-reality/s195-palette.ts',
  'scripts/product-reality/s195-pattern-census.ts', 'scripts/product-reality/s195-pattern-input-schema.ts',
  'scripts/product-reality/s195-pattern-sources.ts', 'scripts/product-reality/s195-qualify-viz-matrix.ts',
  'scripts/product-reality/s195-soak-observation.mjs', 'scripts/product-reality/s195-viz-accuracy-bite.mjs',
  'scripts/product-reality/s195-viz-bite-probe.ts', 'scripts/product-reality/s195-viz-certification-migration.mjs',
  'scripts/product-reality/s195-viz-matrix.ts', 'scripts/product-reality/s195-viz-mutation-bites.mjs',
  'scripts/product-reality/s195-viz-taxonomy.ts']);
export const S196_BASE = '1d100e20bcc0911031192406625357638adecbe5';
export const S196_PUBLIC_RUNTIME_SCOPE = Object.freeze([...S195_PUBLIC_RUNTIME_SCOPE,
  'docs/components', 'docs/history/components', 'docs/README.md', 'docs/adoption',
  'packages/mcp-server/README.md', 'packages/mcp-bridge/README.md', 'scripts/docs',
  'cmos/planning/forge-gate2-decision-packet.md',
  'scripts/product-reality/s182-m04-consumer-harness.mjs', 'scripts/product-reality/s182-m04-consumer-harness.d.mts',
  'scripts/product-reality/s196-bundle-runtime.ts', 'scripts/product-reality/s196-attribute-temporal-goldens.py',
  'scripts/product-reality/s196-bundle-bites.mjs', 'scripts/product-reality/s196-m05-doc-bites.mjs',
  'scripts/product-reality/s196-release-readiness.ts', 'scripts/product-reality/s196-temporal-bite.mjs',
  'scripts/product-reality/s196-temporal-placement-receipt.mjs', 'scripts/product-reality/s196-temporal-probe.ts']);
export const TABLE_PATHS = Object.freeze(['packages/components-react/src/table.tsx', 'packages/components-vue/src/table.ts']);
const canonical = value => `${JSON.stringify(value, null, 2)}\n`;
const assert = (condition, message) => { if (!condition) throw new Error(message); };

// Git's text path format quotes Unicode and control characters. Preserve the
// actual paths for both current ranges and historical omission replays.
export const S197_BASE = 'bc12723e9b7a42a4790a98f5d2a0dc4a1f970b99';
export const S197_PUBLIC_RUNTIME_SCOPE = Object.freeze([...S196_PUBLIC_RUNTIME_SCOPE,
  'scripts/product-reality/s185-reachability.mjs', 'scripts/tokens', 'tools/a11y/guardrails', 'testing/a11y/status-provenance.spec.ts', 'tests/tokens', 'packages/mcp-server/test', 'cmos/foundational-docs/roadmap/README.md', 'cmos/planning/forge-s197-palette-decision-memo.md', 'cmos/planning/forge-s197-build-handoff.md', 'scripts/product-reality/capture-s185-m01-baseline.mjs', 'scripts/product-reality/s197-attribute-palette-goldens.py', 'scripts/product-reality/s197-categorical-search.ts', 'scripts/product-reality/s197-dark-palette.ts', 'scripts/product-reality/s197-hc-scope.ts', 'scripts/product-reality/s197-light-palette.mjs', 'scripts/product-reality/s197-palette-baseline.py', 'scripts/product-reality/s197-palette-consumer-goldens.ts', 'scripts/product-reality/s197-palette-gallery.py', 'scripts/product-reality/s197-palette-sheets.ts', 'scripts/product-reality/s197-tracelab-repin.py', 'scripts/product-reality/s197-tracelab-sheets.mjs', 'scripts/product-reality/s197-viz-palette.ts']);

function gitDiffPaths(base, head, scope, { repositoryRoot, excludeTests, noRenames = false }) {
  return execFileSync('git', ['diff', '--name-only', '-z', ...(noRenames ? ['--no-renames'] : []), `${base}..${head}`, '--', ...scope],
    { cwd: repositoryRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split('\0').filter(file => file && (!excludeTests || !isTestPath(file))).sort();
}

export function compareDeclaredPaths(observed, declared) {
  assert(new Set(declared).size === declared.length, 'Declared movers contain duplicates.');
  return { missingFromDeclaration: observed.filter(file => !declared.includes(file)),
    extraInDeclaration: declared.filter(file => !observed.includes(file)) };
}

export function deriveRange(base, head, root = ROOT, publicScope = PUBLIC_RUNTIME_SCOPE) {
  // Sprint196 must advertise both endpoints of documentation moves. Historical
  // ranges retain their original rename behavior and command representation.
  const noRenames = [S196_PUBLIC_RUNTIME_SCOPE, S197_PUBLIC_RUNTIME_SCOPE].includes(publicScope);
  const resolvedBase = resolveCommit(base, root);
  const resolvedHead = resolveCommit(head, root);
  const canonicalPaths = gitDiffPaths(resolvedBase, resolvedHead, [...CANONICAL_ADVERTISED_SCOPE], { repositoryRoot: root, excludeTests: true, noRenames });
  const publicPaths = gitDiffPaths(resolvedBase, resolvedHead, [...publicScope], { repositoryRoot: root, excludeTests: publicScope !== S197_PUBLIC_RUNTIME_SCOPE, noRenames });
  assert(canonicalPaths.every(file => publicPaths.includes(file)), 'Public scope lost a canonical path.');
  return { base: resolvedBase, head: resolvedHead,
    canonicalCommand: ['git', 'diff', '--name-only', '-z', ...(noRenames ? ['--no-renames'] : []), `${resolvedBase}..${resolvedHead}`, '--', ...CANONICAL_ADVERTISED_SCOPE],
    publicCommand: ['git', 'diff', '--name-only', '-z', ...(noRenames ? ['--no-renames'] : []), `${resolvedBase}..${resolvedHead}`, '--', ...publicScope],
    excluded: publicScope === S197_PUBLIC_RUNTIME_SCOPE ? 'None from the advertised public scope; token, golden and spec changes remain attributable.' : 'Test files only; all commands use the single sprint range, never per-mission ranges.',
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

export function deriveMovers(head, declaration, root = ROOT, options = {}) {
  if (options.sprintId === 'sprint-197') {
    assert(options.missionId === 's197-m07' && resolveCommit(options.base, root) === S197_BASE, 'Sprint197 requires its mission and locked build base.');
    const range = deriveRange(S197_BASE, head, root, S197_PUBLIC_RUNTIME_SCOPE), comparison = { s197: {} };
    for (const surface of ['canonicalPaths', 'publicPaths']) {
      assert(Array.isArray(declaration?.s197?.[surface]), `Missing s197/${surface} declaration.`);
      const result = compareDeclaredPaths(range[surface], declaration.s197[surface]);
      assert(result.missingFromDeclaration.length === 0 && result.extraInDeclaration.length === 0, `s197/${surface}: declared mover union differs: ${canonical(result)}`);
      comparison.s197[surface] = result;
    }
    return { missionId: 's197-m07', sprintId: 'sprint-197', status: 'passed', canonicalScope: CANONICAL_ADVERTISED_SCOPE,
      publicScope: S197_PUBLIC_RUNTIME_SCOPE, s197: range, comparison };
  }
  if (options.sprintId === 'sprint-196') {
    assert(options.missionId === 's196-m07' && resolveCommit(options.base, root) === S196_BASE, 'Sprint196 requires its mission and locked build base.');
    const range = deriveRange(S196_BASE, head, root, S196_PUBLIC_RUNTIME_SCOPE), comparison = { s196: {} };
    for (const surface of ['canonicalPaths', 'publicPaths']) {
      assert(Array.isArray(declaration?.s196?.[surface]), `Missing s196/${surface} declaration.`);
      const result = compareDeclaredPaths(range[surface], declaration.s196[surface]);
      assert(result.missingFromDeclaration.length === 0 && result.extraInDeclaration.length === 0, `s196/${surface}: declared mover union differs: ${canonical(result)}`);
      comparison.s196[surface] = result;
    }
    return { missionId: 's196-m07', sprintId: 'sprint-196', status: 'passed', canonicalScope: CANONICAL_ADVERTISED_SCOPE,
      publicScope: S196_PUBLIC_RUNTIME_SCOPE, s196: range, comparison };
  }
  if (options.sprintId === 'sprint-195') {
    assert(options.missionId === 's195-m07' && resolveCommit(options.base, root) === S195_BASE, 'Sprint195 requires its mission and locked build base.');
    const range = deriveRange(S195_BASE, head, root, S195_PUBLIC_RUNTIME_SCOPE), comparison = { s195: {} };
    for (const surface of ['canonicalPaths', 'publicPaths']) {
      assert(Array.isArray(declaration?.s195?.[surface]), `Missing s195/${surface} declaration.`);
      const result = compareDeclaredPaths(range[surface], declaration.s195[surface]);
      assert(result.missingFromDeclaration.length === 0 && result.extraInDeclaration.length === 0, `s195/${surface}: declared mover union differs: ${canonical(result)}`);
      comparison.s195[surface] = result;
    }
    return { missionId: 's195-m07', sprintId: 'sprint-195', status: 'passed', canonicalScope: CANONICAL_ADVERTISED_SCOPE,
      publicScope: S195_PUBLIC_RUNTIME_SCOPE, s195: range, comparison };
  }
  if (['sprint-186', 'sprint-187', 'sprint-188', 'sprint-189', 'sprint-190', 'sprint-191', 'sprint-192', 'sprint-193', 'sprint-194'].includes(options.sprintId)) {
    const toolTruth = options.sprintId === 'sprint-194';
    const scale = options.sprintId === 'sprint-193';
    const truth = options.sprintId === 'sprint-192';
    const paydown = options.sprintId === 'sprint-191';
    const visualization = options.sprintId === 'sprint-190';
    const browser = options.sprintId === 'sprint-189';
    const workflow = options.sprintId === 'sprint-188';
    const fresh = options.sprintId === 'sprint-187';
    const key = toolTruth ? 's194' : scale ? 's193' : truth ? 's192' : paydown ? 's191' : visualization ? 's190' : browser ? 's189' : workflow ? 's188' : fresh ? 's187' : 's186';
    const missionId = toolTruth ? 's194-m07' : scale ? 's193-m07' : truth ? 's192-m07' : paydown ? 's191-m05' : visualization ? 's190-m06' : browser ? 's189-m06' : workflow ? 's188-m06' : fresh ? 's187-m06' : 's186-m06';
    const scope = toolTruth ? S194_PUBLIC_RUNTIME_SCOPE : scale ? S193_PUBLIC_RUNTIME_SCOPE : truth ? S192_PUBLIC_RUNTIME_SCOPE : paydown ? S191_PUBLIC_RUNTIME_SCOPE : visualization ? S190_PUBLIC_RUNTIME_SCOPE : browser ? S189_PUBLIC_RUNTIME_SCOPE : workflow ? S188_PUBLIC_RUNTIME_SCOPE : fresh ? S187_PUBLIC_RUNTIME_SCOPE : S186_PUBLIC_RUNTIME_SCOPE;
    assert(options.missionId === missionId && options.base, `${options.sprintId} requires its mission and explicit build base.`);
    const range = deriveRange(options.base, head, root, scope);
    assert(range.base === resolveCommit(toolTruth ? S194_BASE : scale ? S193_BASE : truth ? S192_BASE : paydown ? S191_BASE : visualization ? S190_BASE : browser ? S189_BASE : workflow ? S188_BASE : fresh ? S187_BASE : '5aa53b3a', root), `${options.sprintId} mover base differs from the locked build base.`);
    const comparison = { [key]: {} };
    for (const surface of ['canonicalPaths', 'publicPaths']) {
      assert(Array.isArray(declaration?.[key]?.[surface]), `Missing ${key}/${surface} declaration.`);
      const result = compareDeclaredPaths(range[surface], declaration[key][surface]);
      assert(result.missingFromDeclaration.length === 0 && result.extraInDeclaration.length === 0,
        `${key}/${surface}: declared mover union differs: ${canonical(result)}`);
      comparison[key][surface] = result;
    }
    return { missionId: options.missionId, sprintId: options.sprintId, status: 'passed',
      canonicalScope: CANONICAL_ADVERTISED_SCOPE, publicScope: scope, [key]: range, comparison };
  }
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
  const argument = name => { const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1]; };
  const options = { sprintId: argument('--sprint') ?? 'sprint-185', missionId: argument('--mission') ?? 's185-m05', base: argument('--base') };
  assert(['sprint-185', 'sprint-186', 'sprint-187', 'sprint-188', 'sprint-189', 'sprint-190', 'sprint-191', 'sprint-192', 'sprint-193', 'sprint-194', 'sprint-195', 'sprint-196', 'sprint-197'].includes(options.sprintId), 'Unsupported sprint.');
  const headIndex = process.argv.indexOf('--head');
  if (['sprint-196', 'sprint-197'].includes(options.sprintId)) assert(headIndex >= 0, 'Sprint196 requires an explicit --head.');
  const head = resolveCommit(headIndex >= 0 ? process.argv[headIndex + 1] : 'HEAD', ROOT);
  const directory = path.resolve(ROOT, argument('--output') ?? (options.sprintId !== 'sprint-185' ? `artifacts/product-reality/${options.sprintId}/m06/movers` : OUTPUT)); fs.mkdirSync(directory, { recursive: true });
  const declarationPath = path.join(directory, 'declared-movers.json');
  if (process.argv.includes('--declare')) {
    assert(!fs.existsSync(declarationPath), 'Refusing to replace an existing mover declaration. Review differences explicitly.');
    const declaration = { missionId: options.missionId, declarationHead: head,
      method: 'One reviewed declaration per sprint range; later checks independently re-run both Git diffs and reject additions or omissions.',
      ...(options.sprintId === 'sprint-197' ? { s197: deriveRange(options.base, head, ROOT, S197_PUBLIC_RUNTIME_SCOPE) } : options.sprintId === 'sprint-196' ? { s196: deriveRange(options.base, head, ROOT, S196_PUBLIC_RUNTIME_SCOPE) } : options.sprintId === 'sprint-195' ? { s195: deriveRange(options.base, head, ROOT, S195_PUBLIC_RUNTIME_SCOPE) } : options.sprintId === 'sprint-194' ? { s194: deriveRange(options.base, head, ROOT, S194_PUBLIC_RUNTIME_SCOPE) } : options.sprintId === 'sprint-193' ? { s193: deriveRange(options.base, head, ROOT, S193_PUBLIC_RUNTIME_SCOPE) } : options.sprintId === 'sprint-192' ? { s192: deriveRange(options.base, head, ROOT, S192_PUBLIC_RUNTIME_SCOPE) } : options.sprintId === 'sprint-191' ? { s191: deriveRange(options.base, head, ROOT, S191_PUBLIC_RUNTIME_SCOPE) } : options.sprintId === 'sprint-190' ? { s190: deriveRange(options.base, head, ROOT, S190_PUBLIC_RUNTIME_SCOPE) } : options.sprintId === 'sprint-189' ? { s189: deriveRange(options.base, head, ROOT, S189_PUBLIC_RUNTIME_SCOPE) } : options.sprintId === 'sprint-188' ? { s188: deriveRange(options.base, head, ROOT, S188_PUBLIC_RUNTIME_SCOPE) } : options.sprintId === 'sprint-187' ? { s187: deriveRange(options.base, head, ROOT, S187_PUBLIC_RUNTIME_SCOPE) } : options.sprintId === 'sprint-186' ? { s186: deriveRange(options.base, head, ROOT, S186_PUBLIC_RUNTIME_SCOPE) }
        : { s184: deriveRange(S184_BASE, S185_BASE), s185: deriveRange(S185_BASE, head) }) };
    fs.writeFileSync(declarationPath, canonical(declaration));
  }
  const report = deriveMovers(head, JSON.parse(fs.readFileSync(declarationPath, 'utf8')), ROOT, options);
  const outputPath = path.join(directory, 'sprint-wide-movers.json');
  if (process.argv.includes('--check')) assert(fs.readFileSync(outputPath, 'utf8') === canonical(report), 'Mover report is stale.');
  else fs.writeFileSync(outputPath, canonical(report));
  process.stdout.write(canonical(options.sprintId === 'sprint-197' ? { head, s197: { canonical: report.s197.canonicalPaths.length, public: report.s197.publicPaths.length } } : options.sprintId === 'sprint-196' ? { head, s196: { canonical: report.s196.canonicalPaths.length, public: report.s196.publicPaths.length } } : options.sprintId === 'sprint-195' ? { head, s195: { canonical: report.s195.canonicalPaths.length, public: report.s195.publicPaths.length } } : options.sprintId === 'sprint-194' ? { head, s194: { canonical: report.s194.canonicalPaths.length, public: report.s194.publicPaths.length } } : options.sprintId === 'sprint-193' ? { head, s193: { canonical: report.s193.canonicalPaths.length, public: report.s193.publicPaths.length } } : options.sprintId === 'sprint-192' ? { head, s192: { canonical: report.s192.canonicalPaths.length, public: report.s192.publicPaths.length } } : options.sprintId === 'sprint-191' ? { head, s191: { canonical: report.s191.canonicalPaths.length, public: report.s191.publicPaths.length } } : options.sprintId === 'sprint-190' ? { head, s190: { canonical: report.s190.canonicalPaths.length, public: report.s190.publicPaths.length } } : options.sprintId === 'sprint-189' ? { head, s189: { canonical: report.s189.canonicalPaths.length, public: report.s189.publicPaths.length } } : options.sprintId === 'sprint-188' ? { head, s188: { canonical: report.s188.canonicalPaths.length, public: report.s188.publicPaths.length } } : options.sprintId === 'sprint-187' ? { head, s187: { canonical: report.s187.canonicalPaths.length, public: report.s187.publicPaths.length } } : options.sprintId === 'sprint-186' ? { head,
    s186: { canonical: report.s186.canonicalPaths.length, public: report.s186.publicPaths.length } }
    : { head, s184: { canonical: report.s184.canonicalPaths.length, public: report.s184.publicPaths.length },
    s185: { canonical: report.s185.canonicalPaths.length, public: report.s185.publicPaths.length }, tableControl: report.tableControl.status }));
}
