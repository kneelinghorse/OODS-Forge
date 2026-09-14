import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import { handle as pipeline } from '../../src/tools/pipeline.js';
import { RELEASE_EVIDENCE_CLASSES, RELEASE_EVIDENCE_LIMIT } from '../../src/codegen/validation-profile.js';
const root = fileURLToPath(new URL('../../../../', import.meta.url));
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('s198 release is an envelope gate, with one disclosed execution limit', () => {
  it('accepts hash-matched caller assertions without loading even an invalid report, through both public tools', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'oods-release-limit-'));
    try {
      const reference = path.join(directory, 'unread-report.json');
      fs.writeFileSync(reference, 'This is deliberately not JSON evidence.');
      const { schema } = await compose({ object: 'Subscription', context: 'card' });
      const build = await generate({ schema, framework: 'react' });
      expect(build.status).toBe('ok');
      const evidence = Object.fromEntries(RELEASE_EVIDENCE_CLASSES.map(name => [name, { status: 'passed' as const, reference, artifactContentHash: build.artifact!.contentHash }]));
      const direct = await generate({ schema, framework: 'react', profile: 'release', releaseEvidence: evidence });
      const throughPipeline = await pipeline({ object: 'Subscription', context: 'card', framework: 'react', profile: 'release', releaseEvidence: evidence });
      expect(direct.status).toBe('ok');
      expect(throughPipeline.error).toBeUndefined();
      expect(throughPipeline.code?.artifact.contentHash).toBe(build.artifact!.contentHash);
      for (const result of [direct, throughPipeline]) {
        expect(result.validationReceipt?.evidenceVerification).toBe('hash-bound-not-re-executed');
        expect(result.validationReceipt?.evidence.accepted).toHaveLength(6);
        expect(result.validationReceipt?.evidence.accepted.every(item => item.reference === reference)).toBe(true);
      }
      const missing = await generate({ schema, framework: 'react', profile: 'release' });
      expect(missing.errors?.some(error => error.code === 'OODS-V162' && error.message.includes(RELEASE_EVIDENCE_LIMIT))).toBe(true);
      const mismatch = await generate({ schema, framework: 'react', profile: 'release', releaseEvidence: { ...evidence, rendered: { ...evidence.rendered!, artifactContentHash: `sha256:${'0'.repeat(64)}` } } });
      expect(mismatch.errors?.some(error => error.code === 'OODS-V163' && error.message.includes(RELEASE_EVIDENCE_LIMIT))).toBe(true);
    } finally { fs.rmSync(directory, { recursive: true, force: true }); }
  });
  it('keeps runtime, advertised descriptions, ledger caveats and generated narrative on identical wording', () => {
    const descriptions = JSON.parse(read('packages/mcp-adapter/tool-descriptions.json'));
    const caveats = JSON.parse(read('scripts/product-reality/s193-tool-caveats.json'));
    const ledger = JSON.parse(read('packages/mcp-server/registry/tool-capability-ledger.v1.json'));
    for (const tool of ['code.generate', 'pipeline']) {
      expect(descriptions[tool]).toContain(RELEASE_EVIDENCE_LIMIT);
      expect(caveats[tool].find((row: any) => row.file.endsWith('/validation-profile.ts')).reason).toBe(RELEASE_EVIDENCE_LIMIT);
      expect(ledger.rows.find((row: any) => row.name === tool).caveats.find((row: any) => row.file.endsWith('/validation-profile.ts')).reason).toBe(RELEASE_EVIDENCE_LIMIT);
    }
    expect(read('docs/mcp/Tool-Specs.md')).toContain(RELEASE_EVIDENCE_LIMIT);
    expect(read('docs/how-forge-works.html')).toContain(RELEASE_EVIDENCE_LIMIT);
    expect(JSON.parse(read('scripts/docs/forge-claims.templates.json'))['docs/how-forge-works.html']['release-evidence-limit']).toContain('{{releaseEvidenceLimit}}');
  });
});
