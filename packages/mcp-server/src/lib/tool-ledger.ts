import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import registry from '../tools/registry.json' with { type: 'json' };

const TIERS = ['product-reality', 'contract', 'unit', 'none'] as const;
type Tier = typeof TIERS[number];
type ImportRef = { path: string; line: number; handler: string };
type ToolRow = { name: string; registration: 'auto' | 'on-demand'; proofTier: Tier; testImports: Record<Exclude<Tier, 'none'>, ImportRef[]>; advertisedClaim: { description: string; inputSchemaDescription: string }; claimHash: string };
type ToolLedger = { schemaVersion: string; head: string; builderSelfCertified: false; rows: ToolRow[]; summary: { entries: number; auto: number; onDemand: number; byTier: Record<Tier, number>; autoByTier: Record<Tier, number>; onDemandByTier: Record<Tier, number>; portableE2E: number } };
export type ToolSummary = { entries: number; byTier: Record<Tier, number>; head: string };
const counts = (rows: ToolRow[]) => Object.fromEntries(TIERS.map(tier => [tier, rows.filter(row => row.proofTier === tier).length])) as Record<Tier, number>;

/** Validate the finite roster and evidence-derived tier before serving any count. */
export function projectToolSummary(value: unknown): ToolSummary {
  const ledger = value as ToolLedger;
  const reject = (reason: string): never => { throw new Error(`Tool ledger rejected: ${reason}`); };
  if (!ledger || ledger.schemaVersion !== '1.0.0' || !/^[0-9a-f]{40}$/.test(ledger.head ?? '') || ledger.builderSelfCertified !== false || !Array.isArray(ledger.rows)) reject('invalid identity or approval state');
  const expected = [...registry.auto, ...registry.onDemand];
  if (JSON.stringify(ledger.rows.map(row => row?.name)) !== JSON.stringify(expected)) reject('exact registered population required');
  for (const row of ledger.rows) {
    if (row.registration !== (registry.auto.includes(row.name) ? 'auto' : 'on-demand')) reject(`${row.name}: registration mismatch`);
    for (const tier of TIERS.slice(0, 3) as Exclude<Tier, 'none'>[]) {
      const refs = row.testImports?.[tier];
      if (!Array.isArray(refs) || refs.some(ref => typeof ref.path !== 'string' || !ref.path || !Number.isInteger(ref.line) || ref.line < 1 || typeof ref.handler !== 'string' || !ref.handler)) reject(`${row.name}: malformed test imports`);
    }
    const derived = TIERS.find(tier => tier !== 'none' && row.testImports[tier].length) ?? 'none';
    if (derived !== row.proofTier) reject(`${row.name}: tier differs from test imports`);
    const claim = row.advertisedClaim;
    if (!claim || typeof claim.description !== 'string' || typeof claim.inputSchemaDescription !== 'string') reject(`${row.name}: missing claim`);
    const hash = `sha256:${createHash('sha256').update(JSON.stringify(claim, null, 2) + '\n').digest('hex')}`;
    if (hash !== row.claimHash) reject(`${row.name}: claim hash mismatch`);
  }
  const byTier = counts(ledger.rows);
  const summary = ledger.summary;
  if (!summary || summary.entries !== expected.length || summary.auto !== registry.auto.length || summary.onDemand !== registry.onDemand.length || JSON.stringify(summary.byTier) !== JSON.stringify(byTier) || JSON.stringify(summary.autoByTier) !== JSON.stringify(counts(ledger.rows.filter(row => row.registration === 'auto'))) || JSON.stringify(summary.onDemandByTier) !== JSON.stringify(counts(ledger.rows.filter(row => row.registration === 'on-demand')))) reject('summary differs from registered rows');
  return { entries: ledger.rows.length, byTier, head: ledger.head };
}

export function readToolSummary(): ToolSummary {
  const directory = path.dirname(fileURLToPath(import.meta.url));
  // The build ships the same canonical ledger inside dist; source runs read registry/.
  const bundled = path.resolve(directory, '../registry/tool-capability-ledger.v1.json');
  const source = path.resolve(directory, '../../registry/tool-capability-ledger.v1.json');
  return projectToolSummary(JSON.parse(fs.readFileSync(fs.existsSync(bundled) ? bundled : source, 'utf8')));
}
