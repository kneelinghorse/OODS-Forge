import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { handle as compose } from '../../packages/mcp-server/src/tools/design.compose.js';
import { handle as generate } from '../../packages/mcp-server/src/tools/code.generate.js';
import { validateGeneratedArtifact } from '../../packages/mcp-server/src/codegen/artifact-envelope.js';
import { deriveConsumerModel } from '../product-reality/s185-m04-consumer-contract.js';
import { workflowSampleRecords } from '../../packages/mcp-server/src/codegen/workflow-data-emitter.js';
import type { UiElement } from '../../packages/mcp-server/src/schemas/generated.js';
import { recordCollectionEvents } from '@oods/component-contracts';
import { snakeToCamel } from '../../packages/mcp-server/src/codegen/binding-utils.js';
import { DEFAULT_PORT, ROOT, digest, loopRequest, outputDirectory, validateReceipt, verifyTheme, writeJson, type RenderInput } from './common.js';

/** Composition/generation run in the caller so producer edits take effect without restarting consumers. */
export async function render(input: RenderInput) {
  const started = performance.now();
  const port = input.port ?? DEFAULT_PORT;
  await loopRequest(port, '/status'); // Fail before writing partial output if serve is stopped.
  const output = await outputDirectory(input.output);
  const widths = input.widths ?? [390, 820, 1440];
  if (!widths.length || widths.some(width => !Number.isInteger(width) || width < 200 || width > 3840)) throw new Error('Invalid capture widths.');
  const theme = input.theme ?? input.compose.preferences?.theme ?? 'light';
  const brand = input.brand ?? input.compose.preferences?.brand ?? 'A';
  if ((theme !== 'light' && theme !== 'dark') || (brand !== 'A' && brand !== 'B')) throw new Error('Unsupported render theme or brand.');
  const composition = await compose({ ...input.compose, preferences: { ...input.compose.preferences, theme, brand } });
  if (composition.status !== 'ok' || !composition.schema) throw new Error(`Composition failed: ${JSON.stringify(composition)}`);
  const composeMs = performance.now() - started;
  const schemaHash = digest(JSON.stringify(composition.schema));
  const model = deriveConsumerModel(composition.schema, input.model);
  if (Array.isArray(input.model?.rows)) model.collectionQuery = { page: 1, pageSize: Math.max(10, input.model.rows.length), total: input.model.rows.length };
  if (input.compose.context !== 'workflow' && input.compose.object && input.compose.object !== 'Chunk') {
    // The preview uses the same object/trait seed policy as its workflow app.
    // Generated standalone components still receive rows through their public API.
    const workflow = await compose({ ...input.compose, context: 'workflow' });
    if (workflow.status !== 'ok') throw new Error(`List seed composition failed: ${JSON.stringify(workflow.errors)}`);
    const records = workflowSampleRecords(workflow.schema).filter(record => !record.is_archived);
    const rows = records.map(record => Object.fromEntries(Object.entries(record).map(([key, value]) => [snakeToCamel(key), value])));
    // Absence in the seed is meaningful (for example, an active record has no cancellation date).
    // Do not retain the older consumer probe's invented values for omitted domain fields.
    for (const field of Object.keys(workflow.schema.objectSchema ?? {})) delete model[snakeToCamel(field)];
    Object.assign(model, rows[2] ?? rows[0], input.model);
    if (input.compose.context === 'timeline' && !Object.hasOwn(input.model ?? {}, 'events')) {
      const nodes = (elements: UiElement[]): UiElement[] => elements.flatMap(node => [node, ...nodes(node.children ?? [])]);
      const payment = nodes(composition.schema.screens).find(node => node.component === 'PaymentEventTimeline');
      const payments = payment ? [{ field: payment.props?.lastPaymentField, title: 'Last payment' }, { field: payment.props?.nextPaymentField, title: 'Next payment' }].filter((entry): entry is { field: string; title: string } => typeof entry.field === 'string') : [];
      model.events = recordCollectionEvents(records[2] ?? records[0]!, { payments, minorUnits: workflow.schema.workflow?.data.minorUnits });
    }
    if (input.compose.context === 'list' && !Object.hasOwn(input.model ?? {}, 'rows')) {
      model.rows = rows;
      model.collectionQuery = { page: 1, pageSize: 10, total: records.length };
    }
  }
  const sourceHead = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
  const receipts = [];
  for (const framework of input.framework && input.framework !== 'both' ? [input.framework] : ['react', 'vue'] as const) {
    const generationStarted = performance.now();
    const generated = await generate({ schema: composition.schema, framework, profile: 'build', options: { theme, brand } });
    if (generated.status !== 'ok' || !generated.artifact) throw new Error(`Generation failed: ${JSON.stringify(generated.errors)}`);
    const issues = validateGeneratedArtifact(generated.artifact);
    if (issues.length) throw new Error(issues.join('\n'));
    const receipt = await loopRequest(port, '/render', {
      framework, theme, brand, artifact: generated.artifact, schemaHash, compose: input.compose,
      model: { ...model, ...Object.fromEntries(['rows', 'events', 'collectionQuery'].filter(key => input.model && Object.hasOwn(input.model, key)).map(key => [key, input.model![key]])) }, steps: input.steps ?? [], widths,
      output: path.join(output, framework), sourceHead,
      timings: { composeMs, generateMs: performance.now() - generationStarted },
    });
    await validateReceipt(receipt);
    verifyTheme(receipt);
    receipts.push(receipt);
  }
  await writeJson(path.join(output, 'composition.json'), composition);
  const result = { schemaHash, receipts, durationMs: performance.now() - started };
  await writeJson(path.join(output, 'render.json'), result);
  return result;
}
