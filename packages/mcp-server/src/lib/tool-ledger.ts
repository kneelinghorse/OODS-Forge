import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import registry from '../tools/registry.json' with { type: 'json' };

const TIERS = ['product-reality', 'contract', 'unit', 'none'] as const;
type Tier = typeof TIERS[number];
type ImportRef = { path: string; line: number; handler: string };
type PortableOutcome = { outcome: 'pass' | 'typed'; code?: string; retryable?: boolean; receiptSha256: string };
type PortableLimit = { tool: string; status: string; kind: string; code: string; retryable: boolean; receipt: { path: string; sha256: string; bundleHead: string } };
type PortableExecution = { path: string; sha256: string; bundleHead: string; dirty: boolean; tools: number; pass: number; typed: number };
type ToolRow = { portableE2E: boolean; portableOutcome?: PortableOutcome; portableLimits?: PortableLimit[]; caveats: Array<{ kind: string }>; name: string; registration: 'auto' | 'on-demand'; proofTier: Tier; testImports: Record<Exclude<Tier, 'none'>, ImportRef[]>; advertisedClaim: { description: string; inputSchemaDescription: string }; claimHash: string };
type ToolLedger = { mode?: 's194' | 's196' | 's200' | 's201'; portableExecution?: PortableExecution; schemaVersion: string; head: string; builderSelfCertified: false; rows: ToolRow[]; summary: { entries: number; auto: number; onDemand: number; byTier: Record<Tier, number>; autoByTier: Record<Tier, number>; onDemandByTier: Record<Tier, number>; portableE2E: number } };
export type ToolSummary = { entries: number; byTier: Record<Tier, number>; head: string };
/** One retained extracted-runtime receipt per bound mode; s200 ships the brand source (design.preview stays typed), s201 ships the preview host (nothing typed). */
const PORTABLE_RECEIPTS = { s196: 'artifacts/product-reality/sprint-196/m02/e2e-host.json', s200: 'artifacts/product-reality/sprint-200/m04/e2e-host.json', s201: 'artifacts/product-reality/sprint-201/m07/pre-freeze/e2e-host.json' } as const;
const PORTABLE_TYPED_CODES: Record<keyof typeof PORTABLE_RECEIPTS, Record<string, string>> = { s196: { 'brand.apply': 'OODS-N020', 'design.preview': 'OODS-N019' }, s200: { 'design.preview': 'OODS-N019' }, s201: {} };
const counts = (rows: ToolRow[]) => Object.fromEntries(TIERS.map(tier => [tier, rows.filter(row => row.proofTier === tier).length])) as Record<Tier, number>;

/** Validate the finite roster and evidence-derived tier before serving any count. */
export function projectToolSummary(value: unknown): ToolSummary {
  const ledger = value as ToolLedger;
  const reject = (reason: string): never => { throw new Error(`Tool ledger rejected: ${reason}`); };
  if (!ledger || ledger.schemaVersion !== '1.0.0' || !/^[0-9a-f]{40}$/.test(ledger.head ?? '') || ledger.builderSelfCertified !== false || !Array.isArray(ledger.rows)) reject('invalid identity or approval state');
  if (ledger.mode !== undefined && ledger.mode !== 's194' && ledger.mode !== 's196' && ledger.mode !== 's200' && ledger.mode !== 's201') reject('unknown mode');
  const bound = ledger.mode === 's196' || ledger.mode === 's200' || ledger.mode === 's201' ? ledger.mode : undefined;
  const typedCodes = bound ? PORTABLE_TYPED_CODES[bound] : {};
  const typedCount = Object.keys(typedCodes).length;
  const execution = ledger.portableExecution;
  if (bound && (!execution || execution.path !== PORTABLE_RECEIPTS[bound] || !/^sha256:[0-9a-f]{64}$/.test(execution.sha256) || !/^[0-9a-f]{40}$/.test(execution.bundleHead) || typeof execution.dirty !== 'boolean' || execution.tools !== 19 || execution.pass !== 19 - typedCount || execution.typed !== typedCount)) reject('portable execution proof missing or malformed');
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
    if (ledger.mode === 's194' || bound) {
      if (!Array.isArray(row.caveats) || row.caveats.some(caveat => caveat.kind !== 'documented-limit')) reject(`${row.name}: unresolved claim`);
      if (row.registration === 'auto' && (row.proofTier !== 'product-reality' || row.portableE2E !== true)) reject(`${row.name}: advertised boundary coverage missing`);
      if (row.registration === 'on-demand' && !['contract', 'product-reality'].includes(row.proofTier)) reject(`${row.name}: on-demand boundary coverage missing`);
    }
    if (bound) {
      const outcome = row.portableOutcome;
      const limits = row.portableLimits;
      if (!Array.isArray(limits)) reject(`${row.name}: portable limits missing`);
      if (row.registration === 'auto') {
        if (!outcome || !['pass', 'typed'].includes(outcome.outcome) || outcome.receiptSha256 !== execution!.sha256) reject(`${row.name}: portable outcome not bound to receipt`);
        const expectedCode = typedCodes[row.name];
        if (expectedCode) {
          if (outcome!.outcome !== 'typed' || outcome!.code !== expectedCode || outcome!.retryable !== (row.name === 'design.preview')) reject(`${row.name}: typed portable dependency code missing`);
          const limit = limits![0];
          if (limits!.length !== 1 || limit?.tool !== row.name || limit.status !== 'typed' || limit.kind !== 'documented-limit' || limit.code !== expectedCode || limit.retryable !== outcome!.retryable || limit.receipt?.path !== execution!.path || limit.receipt.sha256 !== execution!.sha256 || limit.receipt.bundleHead !== execution!.bundleHead) reject(`${row.name}: portable limit not bound to typed outcome`);
        } else if (outcome!.outcome !== 'pass' || outcome!.code !== undefined || limits!.length !== 0) reject(`${row.name}: successful portable execution required`);
      } else if (outcome !== undefined || limits!.length !== 0) reject(`${row.name}: unexecuted on-demand portable claim`);
    }
    const claim = row.advertisedClaim;
    if (!claim || typeof claim.description !== 'string' || typeof claim.inputSchemaDescription !== 'string') reject(`${row.name}: missing claim`);
    const hash = `sha256:${createHash('sha256').update(JSON.stringify(claim, null, 2) + '\n').digest('hex')}`;
    if (hash !== row.claimHash) reject(`${row.name}: claim hash mismatch`);
  }
  const byTier = counts(ledger.rows);
  const summary = ledger.summary;
  if (!summary || summary.entries !== expected.length || summary.auto !== registry.auto.length || summary.onDemand !== registry.onDemand.length || JSON.stringify(summary.byTier) !== JSON.stringify(byTier) || JSON.stringify(summary.autoByTier) !== JSON.stringify(counts(ledger.rows.filter(row => row.registration === 'auto'))) || JSON.stringify(summary.onDemandByTier) !== JSON.stringify(counts(ledger.rows.filter(row => row.registration === 'on-demand')))) reject('summary differs from registered rows');
  if (summary.portableE2E !== ledger.rows.filter(row => row.portableE2E).length) reject('portable summary differs from rows');
  return { entries: ledger.rows.length, byTier, head: ledger.head };
}

export function readToolSummary(): ToolSummary {
  const directory = path.dirname(fileURLToPath(import.meta.url));
  // The build ships the same canonical ledger inside dist; source runs read registry/.
  const bundled = path.resolve(directory, '../registry/tool-capability-ledger.v1.json');
  const source = path.resolve(directory, '../../registry/tool-capability-ledger.v1.json');
  return projectToolSummary(JSON.parse(fs.readFileSync(fs.existsSync(bundled) ? bundled : source, 'utf8')));
}
