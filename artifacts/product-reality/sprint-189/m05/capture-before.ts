import fs from 'node:fs/promises';
import path from 'node:path';
import { loopRequest, validateReceipt, writeJson } from '../../../../scripts/design-loop/common.js';
const root = path.dirname(new URL(import.meta.url).pathname);
for (const screen of ['archived', 'active-detail']) {
 const input = JSON.parse(await fs.readFile(path.join(root, 'inputs', `before-${screen}.json`), 'utf8'));
 for (const framework of ['react', 'vue']) {
  const source = path.join(root, '../m04/after/on-demand', framework);
  const receipt = JSON.parse(await fs.readFile(path.join(source, 'receipt.json'), 'utf8'));
  const artifact = JSON.parse(await fs.readFile(path.join(source, 'artifact.json'), 'utf8'));
  const output = path.join(root, 'before', screen, framework);
  const result = await loopRequest(4477, '/render', { framework, artifact, schemaHash: receipt.schemaHash, compose: receipt.compose, model: receipt.model, widths: [390, 820, 1440], steps: input.steps, output, sourceHead: receipt.sourceHead, timings: { composeMs: 0, generateMs: 0 } });
  await validateReceipt(result);
  await writeJson(path.join(output, 'provenance.json'), { originalPublicArtifact: path.join(source, 'artifact.json'), artifactHash: artifact.contentHash, originalSourceHead: receipt.sourceHead, why: 'Replay unmodified m04 public workflow artifact; corrected archive selector after original capture timed out.' });
 }
}
