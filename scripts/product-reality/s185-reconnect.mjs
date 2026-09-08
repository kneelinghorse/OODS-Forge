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
  const rederived = sprintId === 'sprint-187'
    ? deriveMovers(movers.s187.head, declaration, ROOT, { sprintId, missionId: argument('--mission') ?? 's187-m06', base: movers.s187.base }) : sprintId === 'sprint-186'
    ? deriveMovers(movers.s186.head, declaration, ROOT, { sprintId, missionId: argument('--mission') ?? 's186-m06', base: movers.s186.base })
    : deriveMovers(movers.s185.head, declaration);
  assert(canonical(movers) === canonical(rederived), 'Mover input is stale.');
  const directory = path.resolve(ROOT, argument('--output') ?? (sprintId !== 'sprint-185' ? `artifacts/product-reality/${sprintId}/m06/reconnect` : OUTPUT)); fs.mkdirSync(directory, { recursive: true });
  const plan = buildNotices(movers, ROOT, { censusPath: argument('--census'), runtimePath: argument('--runtime') });
  const output = path.join(directory, 'notice-plan.json');
  if (process.argv.includes('--check')) assert(fs.readFileSync(output, 'utf8') === canonical(plan), 'Notice plan is stale.');
  else fs.writeFileSync(output, canonical(plan));
  if (process.argv.includes('--deliveries')) {
    const deliveries = JSON.parse(fs.readFileSync(path.join(directory, 'deliveries.json'), 'utf8'));
    process.stdout.write(canonical(verifyDeliveries(plan, deliveries)));
  } else process.stdout.write(canonical({ prepared: plan.notices.length, implementationHead: plan.implementationHead, sendsExecuted: 0 }));
}
