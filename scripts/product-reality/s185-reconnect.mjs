#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { gitFileBytes } from './s184-m07-reconnect.mjs';
import { ROOT, S185_BASE, OUTPUT as MOVERS_OUTPUT, deriveMovers } from './s185-sprint-wide-movers.mjs';

export const OUTPUT = 'artifacts/product-reality/sprint-185/m05/reconnect';
export const DESTINATIONS = Object.freeze(['cmos://derek/aquex-mcp', 'cmos://derek/forge-demos']);
const canonical = value => `${JSON.stringify(value, null, 2)}\n`;
export const requestHash = request => crypto.createHash('sha256').update(JSON.stringify(request)).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const source = (head, file, root) => gitFileBytes(head, file, root).toString('utf8');
const array = (text, name) => {
  const body = text.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const`))?.[1];
  assert(body, `Missing ${name} source declaration.`);
  return [...body.matchAll(/'([^']+)'/g)].map(match => match[1]);
};

export function buildNotices(movers, root = ROOT, options = {}) {
  assert(movers.status === 'passed', 'A checked Git-derived mover record is required.');
  if (movers.missionId === 's196-m07') {
    assert(/^[a-f0-9]{40}$/.test(options.measurementHead ?? ''), 'Sprint196 requires a full measurement head.');
    const head = movers.s196.head, targets = ['cmos-dashboard', 'forge-demos', 'aquex-mcp'];
    const tools = JSON.parse(source(head, 'packages/mcp-server/registry/tool-capability-ledger.v1.json', root));
    assert(tools.summary.auto === 19 && tools.summary.onDemand === 5 && tools.summary.autoByTier['product-reality'] === 19, 'Sprint196 reconnect requires the actual tool inventory.');
    const body = [
      `Sprint 196 candidate ${head}; reconnect only after independent review and delivery. Refresh discovery: ${tools.summary.auto} advertised tools and ${tools.summary.onDemand} on-demand tools.`,
      'The portable archive now includes the bridge and policy. Its /health revision names the containing bundle commit; /tools and /run use the same registered server boundary as the adapter. Readiness attestation binds source evidence to shipped package bytes, so React/Vue code.generate and pipeline emit real artifacts without shipping source or tests. tokens.build apply:true exports shipped outputs.',
      'brand.apply remains a typed OODS-N020 canonical-brand-source dependency refusal. design.preview remains OODS-N019 because it needs the design-loop service. Structured native errors retain code, retryable and data across the adapter. These two portable limits are explicit; brand.intake inline validation remains available.',
      'health.productReality.release reports the measured 42-cell bundle ledger and its original bundleHead/archiveSha256. The containing archive may carry an earlier measured ledger; its own manifest commit is a different identity. Canonical host runtime154 and portable reference-app42 are separate populations, with the latter comparing generated artifacts against identical host operands.',
      'Temporal Vega-Lite and ECharts rendering is UTC. Documentation counts and rosters are generated from live source inventories with drift checks. Gate 2 is prepared for Derek, not approved: no license grant, public publication, registry entry, MCPB or OCI release is implied.',
      'Component classification and application craft approval remain pending. This candidate is BUILT, REVIEW PENDING; builderSelfCertified:false. The reconnect notices are prepared-unsent and execute no messages.',
      `Advertised/public movers from ${movers.s196.base}..${head}:\n${movers.s196.publicPaths.join('\n')}`,
    ].join('\n\n');
    return { missionId: 's196-m07', implementationHead: head, measurementHead: options.measurementHead, status: 'prepared-unsent', sent: false, sendsExecuted: 0,
      deliveryState: 'pending-independent-review', targets, notices: targets.map(target => {
        const request = { type: 'info_push', targetAddress: `cmos://derek/${target}`, summary: `Forge Sprint196 ${head}; reconnect after reviewed delivery`, body };
        return { request, requestSha256: requestHash(request) };
      }) };
  }
  if (movers.missionId === 's195-m07') {
    const head = movers.s195.head, targets = ['cmos-dashboard', 'forge-demos', 'aquex-mcp'];
    const read = file => JSON.parse(source(head, file, root));
    const tools = read('packages/mcp-server/registry/tool-capability-ledger.v1.json');
    const registry = read('packages/viz-core/src/registry/viz-recipes.v1.json');
    const patterns = read('packages/viz-core/src/registry/viz-patterns.v1.json');
    const taxonomy = read('packages/viz-core/src/registry/viz-taxonomy.v1.json');
    assert(tools.summary.auto === 19 && tools.summary.onDemand === 5 && tools.summary.autoByTier['product-reality'] === 19, 'Sprint195 reconnect requires the current 19 advertised tool proofs.');
    const hc = registry.filter(row => row.themes.hc).map(row => row.chartType);
    const body = [
      `Sprint 195 candidate ${head}; prepared for Sprint 196 after independent review and delivery. Refresh discovery after delivery: 19 advertised tools and five on-demand tools remain.`,
      `viz.render accepts pattern using the full pattern:viz:* identity. ${patterns.filter(row => row.publicSvg).length} of ${patterns.length} patterns have public SVG; the remainder are authoring-only with typed reasons. Conflicting pattern operands fail with OODS-V166; structural authoring-only patterns return OODS-V167.`,
      `theme:'hc' is admitted on viz.render, dashboard.render and artifact.certify. HC chart pixels are measured for ${hc.join(', ')}; ${registry.length - hc.length} types retain typed renderer deferrals. HC uses declared system colours; contrast is exempt with a forced-colors note, not a numeric contrast pass.`,
      'artifact.certify now certifies the eight ECharts types when supplied the matching data operand. A11y, accuracy and determinism remain graded; a real failing verdict stays conformant:false. Spec-only ECharts remain coverage:uncertified/conformant:null. Bubble radius scaling currently yields a measured accuracy failure; certification coverage is not a promise of conformance.',
      `health.productReality.viz reports ${taxonomy.summary.types} types, ${taxonomy.summary.patterns} patterns, ${taxonomy.summary.families} families and ${taxonomy.summary.classified} classified identities; ${taxonomy.summary.coreSurfaceComplete} core cells have public surfaces and ${taxonomy.summary.typedGaps} remain typed gaps. Financial and scientific gaps remain explicit.`,
      'Invoice line_items now supplies bar SVG and Usage samples supplies line SVG in generated React/Vue detail and dashboard views, with authored titles. Usage example rows are explicitly synthetic API-call counts. Existing Subscription area stays. ECharts object placement carries under decision1944; full Invoice/Usage detail HTML remains limited by Tabs normalization, while chart-node HTML contains real SVG.',
      'The categorical palette meets the measured Role-A target with Role-C retained. Historical SVG and matrix evidence remains immutable with the m05 migration receipt. The strict soak result remains OODS-SOAK-1442 observation, not retention certification.',
      'The five Sprint194 portable limits remain carried to Sprint196; current source boundary tiers do not promote those historical outcomes to passing portable execution. Classification and application craft approval remain pending.',
      'Primary delivery remains the certified Sprint194 delivery recorded by s195-m01. This candidate is BUILT, REVIEW PENDING; builderSelfCertified:false. These notices are prepared only; candidate delivery and sends have not occurred.',
      `Advertised/public movers from ${movers.s195.base}..${head}:\n${movers.s195.publicPaths.join('\n')}`,
    ].join('\n\n');
    return { missionId: 's195-m07', implementationHead: head, status: 'prepared-unsent', sent: false, sendsExecuted: 0, deliverySprint: 'sprint-196', targets,
      notices: targets.map(target => { const request = { type: 'info_push', targetAddress: `cmos://derek/${target}`, summary: `Forge Sprint195 ${head}; reconnect after reviewed delivery`, body }; return { request, requestSha256: requestHash(request) }; }) };
  }
  if (movers.missionId === 's194-m07') {
    const head = movers.s194.head;
    const tools = JSON.parse(source(head, 'packages/mcp-server/registry/tool-capability-ledger.v1.json', root));
    const targets = ['cmos-dashboard', 'forge-demos', 'aquex-mcp'];
    const retired = tools.retired.map(row => `${row.name} (decisions ${row.decisionIds.join(', ')})`).join('; ');
    const body = [
      `Sprint 194 candidate ${head}; prepared for Sprint 195 after independent review and delivery.`,
      `Discovery now has 19 advertised and five on-demand tools. Retired: ${retired}. Refresh discovery after delivery; historical handlers do not restore a retired registration.`,
      'health serves the 24-entry ledger:19 product-reality source proofs,5 on-demand contracts,19 portable calls. Built token scopes and defaultScope describe files and environment defaults, not active consumer scope. Component discovery remains109 governed React/Vue implementations; classification approval remains pending.',
      'Host brand intake accepts inline A/B envelopes; brand.apply writes canonical source and captures a real token build. tokens.build selects built brand/theme outputs. Legacy brand-a/brand-b aliases warn. Map is an external mapping resolver; composition/codegen does not consume it. Saved schemas use versions/schemaRef, not ETags.',
      'Dashboard measures resolve by default; resolveMeasures:false opts out. ECharts-primary viz output has echartsSpec and no placeholder spec. repl fragment calls warn for ignored overlays and per-node render errors. Inert request dslVersion and repl output.depth were removed. Release evidence receipts verify hashes and do not re-execute caller evidence. design.preview requires the local design-loop server.',
      'Portable bundle:14 passing tool outcomes and5 documented limits. brand.apply lacks canonical brand source even in dry-run. tokens.build is exercised with apply:false because actual export needs stripped host build inputs. design.preview native N019 loses its code across the adapter. React/Vue code.generate and pipeline refuse with N015 because readiness references are omitted. These are recorded carries, not successful portable generation or brand writes.',
      ...tools.rows.filter(row => row.caveats.length).map(row => `${row.name}: ${row.advertisedClaim.description}`),
      'Primary PM2 remains the reviewed1f69c957 delivery. This candidate is BUILT, REVIEW PENDING, builderSelfCertified:false. No candidate delivery or send is performed by this prepared notice. Viz breadth195 and release proof196 remain the next phase-map increments.',
      `Advertised/public movers from ${movers.s194.base}..${head}:\n${movers.s194.publicPaths.join('\n')}`,
    ].join('\n\n');
    return { missionId: 's194-m07', implementationHead: head, status: 'prepared-unsent', sent: false, sendsExecuted: 0, deliverySprint: 'sprint-195', targets,
      notices: targets.map(target => { const request = { type: 'info_push', targetAddress: `cmos://derek/${target}`, summary: `Forge Sprint194 ${head}; reconnect after reviewed delivery`, body }; return { request, requestSha256: requestHash(request) }; }) };
  }
  if (movers.missionId === 's193-m07') {
    const head = movers.s193.head;
    const targets = ['cmos-dashboard', 'forge-demos', 'aquex-mcp'];
    const body = [
      `Sprint 193 candidate ${head}; prepared for Sprint 194 after independent review and delivery.`,
      'catalog_list productReality.surfaces now serves export 2026-09-11-s193-m07:109 React/Vue implementations and HTML mappings;109 verified accessibility/theme rows;interaction40 verified and69 explicitly static. The34 previously missing rows now have governed implementations. approvedRuntimeCensus remains null; classification approval remains pending.',
      'health productReality.runtime serves the current154-cell single-head,one-pack ledger for all11objects/seven contexts/both frameworks. health productReality.tools serves27entries with source-test tiers7product-reality/12contract/4unit/4none; import tiers and README pointers are not runtime certification.',
      'The optional Cartesian opacity input is validated and reaches renderer output. New visualization authoring controls are measured on bounded real-trait fixtures; no public object schema was hand-edited. Public SVG registry13/13 and dashboard11/11 remain unchanged; HC chart pixels and eight ECharts certifications remain open.',
      'Reconnect after reviewed delivery to refresh discovery. Primary PM2 remains the c098237f delivery; this prepared notice executes no send.',
      `Advertised/public movers from ${movers.s193.base}..${head}:\n${movers.s193.publicPaths.join('\n')}`,
    ].join('\n\n');
    return { missionId: 's193-m07', implementationHead: head, status: 'prepared-unsent', sent: false, sendsExecuted: 0, deliverySprint: 'sprint-194', targets,
      notices: targets.map(target => { const request = { type: 'info_push', targetAddress: `cmos://derek/${target}`, summary: `Forge Sprint193 ${head}; reconnect after reviewed delivery`, body }; return { request, requestSha256: requestHash(request) }; }) };
  }
  if (movers.missionId === 's192-m07') {
    const head = movers.s192.head;
    const targets = ['cmos-dashboard', 'forge-demos', 'aquex-mcp'];
    const body = [
      `Sprint 192 candidate ${head}; prepared for Sprint 193 after independent review and delivery.`,
      'catalog_list productReality.surfaces now serves measured evidence from export 2026-09-10:109 obligations,75 React/Vue implementations,109 HTML mappings;75 verified accessibility/theme rows;interaction24 verified and51 explicitly static not-applicable. The other34 are unavailable with reasons. approvedRuntimeCensus remains null; classifications await Derek.',
      'New governed rows: AuditSummaryCard, SortIndicator, TimelineEntryLabel. The component suites run in CI and the fifth capture suite. Semantic component token aliases resolve colour roles without reachable system-colour fallbacks outside forced-colors; all six formerly unguarded names are defined.',
      'Fresh generation77/77 schemas154/154 cells is separate from packed runtime coverage. Reconnect to refresh discovery after the reviewed head is delivered. dashboard-demos is archived; no notice targets it.',
      `Advertised/public movers from ${movers.s192.base}..${head}:\n${movers.s192.publicPaths.join('\n')}`,
    ].join('\n\n');
    return { missionId: 's192-m07', implementationHead: head, status: 'prepared-unsent', sent: false, sendsExecuted: 0, deliverySprint: 'sprint-193', targets,
      notices: targets.map(target => { const request = { type: 'info_push', targetAddress: `cmos://derek/${target}`, summary: `Forge Sprint192 ${head}; reconnect after reviewed delivery`, body }; return { request, requestSha256: requestHash(request) }; }) };
  }
  if (movers.missionId === 's191-m05') {
    const head = movers.s191.head;
    const targets = ['cmos-dashboard', 'forge-demos', 'aquex-mcp'];
    const body = [
      `Sprint 191 candidate ${head}; prepared only for Sprint 192 after independent review.`,
      'Categorical contrastPassed is light,dark for nine chart types in both brands; four types remain exempt. Public SVG 13/13; dashboard 11/11 with chord and flow_map excluded under #881. HC pixels remain deferred and eight ECharts types remain uncertified.',
      'Generation reaches 77/77 schemas and 154/154 framework cells. Subscription, Organization and User workflows have packed React/Vue proof. Theme shell attributes and shared craft changes, human-readable history, archive frames, amount units and recorded-payment charts are included. Editing amounts does not regenerate recorded-payment SVGs.',
      'Maintenance: adapter executable-path portability checks and OODS-N013 description repaired; package pins must use the separately prepared final bundle notice. Live bridge delivery and reconnect remain pending.',
      `Advertised and public movers from ${movers.s191.base}..${head}:\n${movers.s191.publicPaths.join('\n')}`,
    ].join('\n\n');
    return { missionId: 's191-m05', implementationHead: head, status: 'prepared-unsent', sent: false,
      sendsExecuted: 0, deliverySprint: 'sprint-192', targets, notices: targets.map(target => {
        const request = { type: 'info_push', targetAddress: `cmos://derek/${target}`,
          summary: `Forge Sprint 191 ${head}; reconnect after reviewed delivery`, body };
        return { request, requestSha256: requestHash(request) };
      }) };
  }
  if (movers.missionId === 's187-m06') {
    const head = movers.s187.head;
    const types = 'packages/component-contracts/src/types.ts';
    const nucleus = array(source(head, types, root), 'NUCLEUS_COMPONENT_IDS');
    const prior = array(source(movers.s187.base, types, root), 'NUCLEUS_COMPONENT_IDS');
    const added = nucleus.filter(id => !prior.includes(id));
    assert(nucleus.length === 64 && new Set(nucleus).size === 64 && added.length === 14 && prior.every(id => nucleus.includes(id)), 'Sprint 187 root membership differs.');
    for (const framework of ['react', 'vue']) {
      const exports = JSON.parse(source(head, `packages/components-${framework}/package.json`, root)).exports;
      assert(JSON.stringify(exports['.']) === JSON.stringify(exports['./ported']) && JSON.stringify(exports['./readiness']) === JSON.stringify(exports['./readiness-ported']), 'Compatibility aliases differ from roots.');
    }
    const styles = JSON.parse(source(head, 'packages/component-styles/package.json', root)).exports;
    assert(JSON.stringify(styles['./css']) === JSON.stringify(styles['./css-ported']), 'CSS alias differs.');
    const censusPath = options.censusPath ?? 'artifacts/product-reality/sprint-187/m06/fresh-census.json';
    const runtimePath = options.runtimePath ?? 'artifacts/product-reality/sprint-187/m06/live-consumers/report.json';
    const census = JSON.parse(fs.readFileSync(path.join(root, censusPath), 'utf8'));
    const runtime = JSON.parse(fs.readFileSync(path.join(root, runtimePath), 'utf8'));
    assert(census.head === head && census.greenSchemas === 66 && census.greenCells === 132, 'Fresh census is incomplete or from another implementation.');
    assert(runtime.status === 'passed' && runtime.cellCount === 28 && runtime.failed === 0 && runtime.skipped === 0
      && runtime.cells.every(cell => cell.composition?.sourceHead === head), 'Runtime proof is incomplete or from another implementation.');
    const successor = 'artifacts/product-reality/sprint-187/m05/delivery-final/recomposition.json';
    const adoption = JSON.parse(fs.readFileSync(path.join(root, successor), 'utf8'));
    const body = [
      `Forge Sprint 187 is built for independent review at ${head}. Prepared only: this message has not been sent.`,
      `New governed root families (${added.length}): ${added.join(', ')}. All ${nucleus.length} IDs share root contracts, React/Vue readiness and token CSS. /ported, /readiness-ported and /css-ported remain compatibility aliases because external migration is unproven.`,
      'Emitter movers: authentic default composition preserves StatusTimeline data, numeric zero and boolean false, controlled query updates, owner/role metadata, optional card actions and nullable datetime values. ClassificationEditor and CancellationForm provide local native controls and prevented submission; no persistence, cancellation or policy enforcement is claimed. Consumed-unbound directives and HTML differences are documented.',
      `Fresh coverage: 66/66 schemas and 132/132 React/Vue build generation cells; ${runtime.cellCount} named packed-consumer cells, ${runtime.passed} passed gates, ${runtime.notApplicable} N/A, ${runtime.failed} failed and ${runtime.skipped} skipped. Evidence: ${censusPath}; ${runtimePath}. Selected runtime paths do not prove all 66 paths or a connected application.`,
      'Discovery: catalog_list adds optional obligationScope for accepted retain-109 #1788. approvedRuntimeCensus remains null; historical classifications are unapproved proposals. Legacy status filters describe HTML mapping only. Read each productReality.surfaces entry for target availability and unverified maturity. Current Forge-source refresh replaces historical snippets and stale capability evidence.',
      `Saved adoption operand: authentic User/form v2 in ${adoption.successorStore}; schema SHA256 ${adoption.schemaSha256}; original record SHA256 ${adoption.originalHashes['user-form-showcase.json']}; successor record SHA256 ${adoption.successorHashes['user-form-showcase.json']}. Original inputs and negative receipts remain preserved; final saved-store comparisons disclose actual reachability separately.`,
      'Deployment: pending. The served checkout is separate; no shared PM2 restart, shared-store adoption, publish or outbound notice occurred. The old served schema-load failure is recorded. Use the prepared rollout/backup/identity/rollback packet only in separately authorized delivery. Reconnect after verified served integration; generic health does not attest source revision. #1374/#1379/#1384 remain open.',
      `Sprint 187 canonical schema/tool movers (${movers.s187.canonicalPaths.length}):\n${movers.s187.canonicalPaths.map(file => `- ${file}`).join('\n')}`,
      `Sprint 187 additional public movers (${movers.s187.supplementalRuntimePaths.length}):\n${movers.s187.supplementalRuntimePaths.map(file => `- ${file}`).join('\n')}`,
      'Carries: greenfield workflow partial; visualization public-render closure #1372, unverified maturity #1375, maintenance #1315/#1318–#1322 remain owed. Visualization breadth, Parts Town, publication and surface adapters are outside this build. Dashboard Demos is retired under #1719. builderSelfCertified:false; Sprint 187 stays Active for separate review.',
    ].join('\n\n');
    return { missionId: 's187-m06', implementationHead: head, status: 'prepared', sendsExecuted: 0, deployment: 'pending',
      addedNucleus: added, nucleusCount: nucleus.length, aliasDisposition: 'retained; migration unproven', censusPath, runtimePath, successor,
      retired: { targetAddress: 'cmos://derek/dashboard-demos', decisionId: 1719, disposition: 'retired; not sent', messageId: null },
      notices: DESTINATIONS.map(targetAddress => {
        const request = { type: 'info_push', targetAddress, summary: `Forge Sprint 187 candidate ${head}; reconnect after verified delivery`, body };
        return { request, requestSha256: requestHash(request) };
      }) };
  }
  if (movers.missionId === 's186-m06') {
    const head = movers.s186.head;
    const types = 'packages/component-contracts/src/types.ts';
    const nucleus = array(source(head, types, root), 'NUCLEUS_COMPONENT_IDS');
    const priorNucleus = array(source(movers.s186.base, types, root), 'NUCLEUS_COMPONENT_IDS');
    const formerPorted = array(source(movers.s186.base, types, root), 'PORTED_COMPONENT_IDS');
    const added = nucleus.filter(id => !priorNucleus.includes(id) && !formerPorted.includes(id));
    assert(nucleus.length === 50 && new Set(nucleus).size === nucleus.length && added.length === 23
      && formerPorted.every(id => nucleus.includes(id)) && priorNucleus.every(id => nucleus.includes(id)), 'Unified component membership differs from the sprint scope.');
    const styleIds = array(source(head, 'packages/component-styles/src/index.ts', root), 'COMPONENT_STYLE_IDS');
    assert(JSON.stringify([...nucleus].sort()) === JSON.stringify([...styleIds].sort()), 'Style surface differs from nucleus.');
    for (const framework of ['react', 'vue']) {
      const readiness = JSON.parse(source(head, `packages/components-${framework}/evidence/${framework}-readiness.v1.json`, root));
      assert(JSON.stringify(readiness.rows.map(row => row.componentId).sort()) === JSON.stringify([...nucleus].sort())
        && readiness.rows.every(row => row.emissionEligible), 'Root readiness differs from the unified component set.');
      const exports = JSON.parse(source(head, `packages/components-${framework}/package.json`, root)).exports;
      assert(exports['./ported'] && exports['./readiness-ported'], 'Compatibility subpaths were removed before their horizon.');
    }
    assert(JSON.parse(source(head, 'packages/component-styles/package.json', root)).exports['./css-ported'], 'CSS compatibility alias was removed.');
    const censusPath = options.censusPath ?? 'artifacts/product-reality/sprint-186/m05/recomposed-reachability/report.json';
    const census = JSON.parse(source(head, censusPath, root));
    assert(census.total === 16 && census.reachable === 16 && census.generatedCells === 32
      && census.rows.length === census.total && census.rows.every(row => row.reachable && row.cells.length === 2
        && ['react', 'vue'].every(framework => row.cells.some(cell => cell.framework === framework && cell.status === 'ok' && cell.artifactPresent))), 'The disclosed successor store census is incomplete.');
    const body = [
      `Forge Sprint 186 is built for independent review at ${head}. Sprint range: ${movers.s186.base}..${head}.`,
      'Closeout correction: this implementation supersedes the earlier Sprint 186 notice. The first frozen four-suite capture exposed a Banner title styling regression after the root CSS fold; OODS titles now retain their 700 weight in both frameworks. The failed capture and the two original sent requests remain retained under artifacts/product-reality/sprint-186/m06/four-suite-closeout-attempt-1 and recovery/first-execution-inputs.',
      `New root component families (${added.length}): ${added.join(', ')}.`,
      `Union fold: all ${nucleus.length} governed components now share NUCLEUS_COMPONENT_IDS, root contracts, root readiness and root CSS. The eight former ported families are additive root exports: ${formerPorted.join(', ')}. The /ported, /readiness-ported and /css-ported import paths remain compatibility aliases through Sprint 186; their one-sprint retirement horizon is Sprint 187.`,
      'Emitter movers: React and Vue generation now imports governed components and shared CSS from package roots. Recipe directives lower to the existing runtime props. The User form composer selects controls whose field kinds match their contracts; the successor User form is authentically recomposed, with the frozen defective fixture and its 15/16 census retained as historical evidence.',
      `Reachability: ${census.reachable}/${census.total} schemas and ${census.generatedCells} React/Vue generation cells pass for the disclosed successor store ${census.schemaStore}; evidence: ${censusPath}. Generation is distinct from the retained per-schema packed-consumer runtime proofs. The capability baseline keeps 109 identities/classifications/reconciliation states and approvedRuntimeCensus remains null.`,
      'Deployment: the Sprint 186 worktree is not the checkout PM2 serves. No live bridge rebuild/restart was performed. Review or vendor the named implementation commit; refresh the MCP connection after that build is integrated into the served checkout.',
      `Sprint 186 canonical schema/tool movers (${movers.s186.canonicalPaths.length}):\n${movers.s186.canonicalPaths.map(file => `- ${file}`).join('\n')}`,
      `Sprint 186 additional public runtime movers (${movers.s186.supplementalRuntimePaths.length}):\n${movers.s186.supplementalRuntimePaths.map(file => `- ${file}`).join('\n')}`,
      'Dashboard Demos remains retired under decision #1719. This is builder evidence; the sprint remains Active and a separate reviewer decides close.',
    ].join('\n\n');
    return { missionId: 's186-m06', implementationHead: head, addedNucleus: added, nucleusCount: nucleus.length,
      formerPorted, aliasHorizon: 'sprint-187', censusPath,
      retired: { targetAddress: 'cmos://derek/dashboard-demos', decisionId: 1719, disposition: 'retired; not sent', messageId: null },
      notices: DESTINATIONS.map(targetAddress => {
        const request = { type: 'info_push', targetAddress, summary: `Forge Sprint 186 build ${head}; unified root components and reconnect after serving the build`, body };
        return { request, requestSha256: requestHash(request) };
      }) };
  }
  const head = movers.s185.head;
  const types = 'packages/component-contracts/src/types.ts';
  const nucleus = array(source(head, types, root), 'NUCLEUS_COMPONENT_IDS');
  const prior = array(source(S185_BASE, types, root), 'NUCLEUS_COMPONENT_IDS');
  const ported = array(source(head, types, root), 'PORTED_COMPONENT_IDS');
  const added = nucleus.filter(id => !prior.includes(id));
  assert(prior.every(id => nucleus.includes(id)), 'A prior nucleus component was removed.');
  const styleIds = array(source(head, 'packages/component-styles/src/index.ts', root), 'COMPONENT_STYLE_IDS');
  assert(JSON.stringify([...nucleus].sort()) === JSON.stringify([...styleIds].sort()), 'Style surface differs from nucleus.');
  const manifests = ['packages/components-react/evidence/react-readiness.v1.json', 'packages/components-vue/evidence/vue-readiness.v1.json']
    .map(file => ({ path: file, manifest: JSON.parse(source(head, file, root)) }));
  for (const { manifest } of manifests) assert(manifest.rows.length === nucleus.length && manifest.rows.every(row => row.emissionEligible), 'Readiness count or eligibility differs.');
  const owed = ['packages/components-react/src/table.tsx', 'packages/components-vue/src/table.ts',
    'packages/mcp-server/src/codegen/state-contract.ts', 'packages/mcp-server/src/codegen/validation-profile.ts', 'packages/mcp-server/src/codegen/syntax-preflight.ts'];
  assert(owed.every(file => movers.s184.publicPaths.includes(file)), 'Owed Sprint 184 behavior is absent from Git diff.');
  const codeGenerate = source(head, 'packages/mcp-server/src/tools/code.generate.ts', root);
  assert(codeGenerate.includes('OODS-N018'), 'HTML/Tailwind diagnostic has not landed at the notice head.');
  const body = [
    `Forge Sprint 185 is built for independent review at ${head}. This is a combined notice for the Sprint 184 movers still owed after review and the Sprint 185 changes.`,
    'Deployment: the Sprint 185 worktree is not the checkout PM2 serves. No live bridge rebuild/restart was performed. Use the named build commit for review or vendoring; refresh the MCP connection when that build is integrated into the served checkout.',
    `Sprint 184 range: ${movers.s184.base}..${movers.s184.head}. Its React and Vue nucleus Table now render the zero-row message “No rows available.”; state-contract.ts adds OODS-V164, validation-profile.ts checks state-contract, and syntax-preflight.ts reserves uiState/GeneratedUIState. These runtime changes were missed by the per-mission schema/tool scopes. The complete Git-derived path list is included below.`,
    `Sprint 185 range: ${movers.s185.base}..${head}. New root exports and versioned contracts: ${added.join(', ')}. Both framework readiness manifests and COMPONENT_STYLE_IDS now cover ${nucleus.length} nucleus components. VizAreaPreview is a sized preview frame with slot/placeholder content, not a chart renderer. DetailHeader and CardHeader preserve visible semantic headings; the Plan form’s read-only heading subscribes to its valid shared field writer.`,
    'Additional runtime changes: React Badge now uses an explicit tone for its actual color tokens even when status is present. CardHeader consumes the existing Labelled recipe directives titleField/supportingField through the field resolver without leaking them as component props. At the unchanged Product detail input, React/Vue now report the remaining PriceSummary OODS-N015 gap; Product/card/HTML still reaches the release-evidence OODS-V162 gate. Local binding validation now checks the handler’s own state update and the Vue setter chain; a hash-resealed no-op body is rejected.',
    'HTML styling gap: code.generate with framework=html and styling=tailwind reports OODS-N018 as a warning at draft and an error at build/release. The HTML path emits token-referenced inline styles only. The input-schema description states this limitation; tokens/inline HTML and React/Vue Tailwind retain their existing paths.',
    `Two unions remain separate (decision #1729): ${nucleus.length} nucleus families at package roots and ${ported.length} ported families on /ported: ${ported.join(', ')}. The capability-baseline fold updates evidence cells only, retaining 109 ids/classifications/reconciliation states; approvedRuntimeCensus remains null. The old capability overlay file and ./registry/capabilities/ported export are removed.`,
    'Measured scope: the six new saved schemas plus the two historical Subscription schemas pass 124 of 124 applicable packed-consumer gates over 16 framework cells. Four interaction rows are N/A and excluded. Generation succeeds for 11 of 16 saved schemas; the other three generating schemas do not acquire packed runtime proof from that census. Plan form initial values follow existing target APIs (React model props; Vue internal defaults); both targets prove edits update the heading. Increment 3 remains PARTIAL: four workflow states were proven on a script-built schema, while the real Subscription schemas were proven state-neutral.',
    `Sprint 184 canonical schema/tool movers (${movers.s184.canonicalPaths.length}):\n${movers.s184.canonicalPaths.map(file => `- ${file}`).join('\n')}`,
    `Sprint 184 additional public runtime movers (${movers.s184.supplementalRuntimePaths.length}):\n${movers.s184.supplementalRuntimePaths.map(file => `- ${file}`).join('\n')}`,
    `Sprint 185 canonical schema/tool movers (${movers.s185.canonicalPaths.length}):\n${movers.s185.canonicalPaths.map(file => `- ${file}`).join('\n')}`,
    `Sprint 185 additional public runtime movers (${movers.s185.supplementalRuntimePaths.length}):\n${movers.s185.supplementalRuntimePaths.map(file => `- ${file}`).join('\n')}`,
    'Dashboard Demos is excluded as retired under decision #1719. This notice records build evidence, not sprint certification; a separate reviewer decides close.',
  ].join('\n\n');
  return { missionId: 's185-m05', implementationHead: head, addedNucleus: added, nucleusCount: nucleus.length, portedCount: ported.length,
    retired: { targetAddress: 'cmos://derek/dashboard-demos', decisionId: 1719, disposition: 'retired; not sent', messageId: null },
    notices: DESTINATIONS.map(targetAddress => {
      const request = { type: 'info_push', targetAddress, summary: `Forge Sprint 184 owed movers + Sprint 185 build ${head}; reconnect after serving the build`, body };
      return { request, requestSha256: requestHash(request) };
    }) };
}

export function verifyDeliveries(plan, deliveries) {
  if (plan.missionId === 's187-m06') {
    assert(plan.status === 'prepared' && plan.sendsExecuted === 0 && plan.deployment === 'pending', 'Sprint 187 delivery must remain prepared only.');
    assert(deliveries.length === DESTINATIONS.length && plan.notices.length === DESTINATIONS.length, 'Exactly two prepared destinations required.');
    assert(JSON.stringify(plan.notices.map(row => row.request.targetAddress).sort()) === JSON.stringify([...DESTINATIONS].sort()), 'Prepared destination coverage differs.');
    for (const { request, requestSha256 } of plan.notices) {
      assert(requestHash(request) === requestSha256, 'Notice request hash changed.');
      const rows = deliveries.filter(row => row.targetAddress === request.targetAddress);
      assert(rows.length === 1 && rows[0].status === 'prepared' && rows[0].messageId === null
        && rows[0].requestSha256 === requestSha256, 'Prepared notice must have exact bytes and no fabricated delivery.');
    }
    assert(plan.retired.messageId === null && !deliveries.some(row => row.targetAddress === plan.retired.targetAddress), 'Retired destination received a fabricated delivery.');
    return { status: 'passed', preparedNotices: deliveries.length, successfulDeliveries: 0, uniqueMessageIds: [] };
  }
  assert(deliveries.length === DESTINATIONS.length, 'Exactly two active deliveries required.');
  const ids = new Set();
  for (const { request, requestSha256 } of plan.notices) {
    assert(requestHash(request) === requestSha256, 'Notice request hash changed.');
    const rows = deliveries.filter(row => row.targetAddress === request.targetAddress);
    assert(rows.length === 1, 'Destination coverage differs.');
    const row = rows[0];
    assert(row.status === 'sent' && typeof row.messageId === 'string' && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(row.messageId), 'Delivery has no real message id.');
    assert(!ids.has(row.messageId), 'Delivery message ids must be unique.'); ids.add(row.messageId);
    assert(row.requestSha256 === requestSha256, 'Delivered request differs from notice.');
  }
  assert(plan.retired.messageId === null && !deliveries.some(row => row.targetAddress === plan.retired.targetAddress), 'Retired destination received a fabricated delivery.');
  return { status: 'passed', successfulDeliveries: ids.size, uniqueMessageIds: [...ids] };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argument = name => { const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1]; };
  const sprintId = argument('--sprint') ?? 'sprint-185';
  const moversPath = path.resolve(ROOT, argument('--movers') ?? `${sprintId !== 'sprint-185' ? `artifacts/product-reality/${sprintId}/m06/movers` : MOVERS_OUTPUT}/sprint-wide-movers.json`);
  const movers = JSON.parse(fs.readFileSync(moversPath, 'utf8'));
  const declaration = JSON.parse(fs.readFileSync(path.resolve(ROOT, argument('--declaration') ?? path.join(path.dirname(moversPath), 'declared-movers.json')), 'utf8'));
  const rederived = sprintId === 'sprint-196'
    ? deriveMovers(movers.s196.head, declaration, ROOT, { sprintId, missionId: argument('--mission') ?? 's196-m07', base: movers.s196.base }) : sprintId === 'sprint-195'
    ? deriveMovers(movers.s195.head, declaration, ROOT, { sprintId, missionId: argument('--mission') ?? 's195-m07', base: movers.s195.base }) : sprintId === 'sprint-187'
    ? deriveMovers(movers.s187.head, declaration, ROOT, { sprintId, missionId: argument('--mission') ?? 's187-m06', base: movers.s187.base }) : sprintId === 'sprint-186'
    ? deriveMovers(movers.s186.head, declaration, ROOT, { sprintId, missionId: argument('--mission') ?? 's186-m06', base: movers.s186.base })
    : deriveMovers(movers.s185.head, declaration);
  assert(canonical(movers) === canonical(rederived), 'Mover input is stale.');
  const directory = path.resolve(ROOT, argument('--output') ?? (sprintId !== 'sprint-185' ? `artifacts/product-reality/${sprintId}/m06/reconnect` : OUTPUT)); fs.mkdirSync(directory, { recursive: true });
  const plan = buildNotices(movers, ROOT, { censusPath: argument('--census'), runtimePath: argument('--runtime'), measurementHead: argument('--measurement-head') });
  const output = path.join(directory, 'notice-plan.json');
  if (process.argv.includes('--check')) assert(fs.readFileSync(output, 'utf8') === canonical(plan), 'Notice plan is stale.');
  else fs.writeFileSync(output, canonical(plan));
  if (process.argv.includes('--deliveries')) {
    const deliveries = JSON.parse(fs.readFileSync(path.join(directory, 'deliveries.json'), 'utf8'));
    process.stdout.write(canonical(verifyDeliveries(plan, deliveries)));
  } else process.stdout.write(canonical({ prepared: plan.notices.length, implementationHead: plan.implementationHead, sendsExecuted: 0 }));
}
