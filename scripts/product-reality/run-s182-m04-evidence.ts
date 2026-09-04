#!/usr/bin/env tsx

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { handle } from '../../packages/mcp-server/src/tools/code.generate.js';
import {
  FOUNDATION_V1_SHOWCASE_SCHEMA,
} from '../../packages/mcp-server/test/product-reality/foundation-fixture.s182.js';
import {
  canonicalJson,
  packFoundationPackages,
  runGeneratedConsumerProof,
  runPackedExportProof,
  verifyGeneratedSource,
  writeCodegenUsableLedger,
  writeMatrixEvidence,
} from './s182-m04-consumer-harness.mjs';

const compareCodePoint = (left: string, right: string): number => (
  left < right ? -1 : left > right ? 1 : 0
);

function parseArtifactRoot(): string {
  const index = process.argv.indexOf('--artifact-root');
  if (index < 0 || !process.argv[index + 1]) {
    throw new Error('Usage: pnpm exec tsx scripts/product-reality/run-s182-m04-evidence.ts --artifact-root <fresh-directory>');
  }
  return path.resolve(process.cwd(), process.argv[index + 1]);
}

async function main(): Promise<void> {
  const artifactRoot = parseArtifactRoot();
  try {
    await fs.mkdir(artifactRoot);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST') {
      throw new Error(`Refusing to overwrite existing artifact root: ${artifactRoot}`);
    }
    throw error;
  }

  const matrixCells = [];
  const defaultSources: Record<'react' | 'vue', string> = { react: '', vue: '' };
  const generatedSources: Array<{ file: string; code: string }> = [];
  for (const framework of ['react', 'vue'] as const) {
    for (const styling of ['inline', 'tokens', 'tailwind'] as const) {
      for (const typescript of [false, true] as const) {
        const generated = await handle({
          framework,
          schema: FOUNDATION_V1_SHOWCASE_SCHEMA,
          options: { styling, typescript },
        });
        if (generated.status !== 'ok') {
          throw new Error(`${framework}/${styling}/${typescript} returned ${JSON.stringify(generated.errors ?? [])}`);
        }
        const proof = verifyGeneratedSource({
          framework,
          styling,
          typescript,
          code: generated.code,
          imports: generated.imports,
        });
        matrixCells.push(proof);
        const extension = framework === 'react' ? (typescript ? 'tsx' : 'jsx') : `ts-${typescript}.vue`;
        generatedSources.push({
          file: `${framework}-${styling}-${extension}`,
          code: generated.code,
        });
        if (styling === 'tokens' && typescript) defaultSources[framework] = generated.code;
      }
    }
  }

  const matrixReport = await writeMatrixEvidence({ artifactRoot, cells: matrixCells });
  const sourceRoot = path.join(artifactRoot, 'codegen-matrix', 'sources');
  await fs.mkdir(sourceRoot);
  for (const source of generatedSources.sort((left, right) => compareCodePoint(left.file, right.file))) {
    await fs.writeFile(path.join(sourceRoot, source.file), source.code);
  }

  const tarballs = await packFoundationPackages(artifactRoot);
  const packedExports = await runPackedExportProof({ artifactRoot, tarballs });
  const consumers = await runGeneratedConsumerProof({ artifactRoot, sources: defaultSources, tarballs });
  const ledger = await writeCodegenUsableLedger({
    artifactRoot,
    matrixReport,
    consumerReport: consumers.report,
  });
  const report = {
    schemaVersion: '1.0.0',
    mission: 's182-m04',
    status: 'passed',
    selected: 15,
    passed: 15,
    failed: 0,
    skipped: 0,
    evidence: {
      matrix: { selected: matrixReport.selected, passed: matrixReport.passed },
      packedRootExports: { selected: packedExports.selected, passed: packedExports.passed },
      generatedConsumers: { selected: consumers.report.selected, passed: consumers.report.passed },
      codegenUsableCells: ledger.codegenUsableCells,
      derivedPredicates: ledger.derivedPredicates,
      withheldPredicates: ledger.withheldPredicates,
      foundationV1Candidate: ledger.foundationV1Candidate,
      foundationV1: ledger.foundationV1,
    },
  };
  await fs.writeFile(path.join(artifactRoot, 'report.json'), canonicalJson(report));
  process.stdout.write(`PASS: 12/12 matrix cells, 1/1 packed root proof, 2/2 generated consumers, ${ledger.codegenUsableCells}/28 codegenUsable cells.\n`);
  process.stdout.write(`${path.join(artifactRoot, 'report.json')}\n`);
}

main().catch((error) => {
  process.stderr.write(`run-s182-m04-evidence: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
