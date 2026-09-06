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

export function buildNotices(movers, root = ROOT) {
  assert(movers.status === 'passed', 'A checked Git-derived mover record is required.');
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
  const movers = JSON.parse(fs.readFileSync(path.join(ROOT, MOVERS_OUTPUT, 'sprint-wide-movers.json'), 'utf8'));
  const declaration = JSON.parse(fs.readFileSync(path.join(ROOT, MOVERS_OUTPUT, 'declared-movers.json'), 'utf8'));
  const rederived = deriveMovers(movers.s185.head, declaration);
  assert(canonical(movers) === canonical(rederived), 'Mover input is stale.');
  const directory = path.join(ROOT, OUTPUT); fs.mkdirSync(directory, { recursive: true });
  const plan = buildNotices(movers);
  const output = path.join(directory, 'notice-plan.json');
  if (process.argv.includes('--check')) assert(fs.readFileSync(output, 'utf8') === canonical(plan), 'Notice plan is stale.');
  else fs.writeFileSync(output, canonical(plan));
  if (process.argv.includes('--deliveries')) {
    const deliveries = JSON.parse(fs.readFileSync(path.join(directory, 'deliveries.json'), 'utf8'));
    process.stdout.write(canonical(verifyDeliveries(plan, deliveries)));
  } else process.stdout.write(canonical({ prepared: plan.notices.length, implementationHead: plan.implementationHead, sendsExecuted: 0 }));
}
