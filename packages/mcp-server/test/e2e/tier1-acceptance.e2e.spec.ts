/**
 * Tier-1 compatibility is intentionally bounded in Sprint 182.
 *
 * The historical composed Subscription flow contains target components outside
 * the 14-family nucleus and therefore returns OODS-N015 for React/Vue. The
 * checked-in saved schema proves only Card/Stack/Tabs/Text compatibility.
 */
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { SchemaStore } from '../../src/schema-store/index.js';
import { handle as codegenHandle } from '../../src/tools/code.generate.js';
import { handle as healthHandle } from '../../src/tools/health.js';
import { handle as pipelineHandle } from '../../src/tools/pipeline.js';
import { handle as schemaLoadHandle } from '../../src/tools/schema/load.js';

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('Tier 1 acceptance — bounded framework compatibility', () => {
  it('uses the saved Card/Stack/Tabs/Text schema successfully for React and Vue', async () => {
    const store = new SchemaStore({ projectRoot: PACKAGE_ROOT });
    const saved = await store.load('tier1-acceptance-sub-detail');

    expect(saved.object).toBe('Subscription');
    expect(saved.context).toBe('detail');
    expect(saved.tags).toContain('bounded-foundation-v1');

    for (const framework of ['react', 'vue'] as const) {
      const result = await codegenHandle({
        schemaRef: saved.schemaRef,
        framework,
        options: { styling: 'tokens', typescript: true },
      });

      expect(result.status).toBe('ok');
      expect(result.code.length).toBeGreaterThan(0);
      expect(result.code).toContain(
        framework === 'react' ? "from '@oods/components-react'" : "from '@oods/components-vue'",
      );
      expect(result.code).toContain("import '@oods/component-styles/css'");
      expect(result.code).toContain('Subscription details');
      expect(result.code).toContain('Current plan and renewal details');
      expect(result.code).toContain('Invoices and payment method');
      expect(result.meta).toEqual({ nodeCount: 6, componentCount: 4 });
    }
  });

  it.each(['react', 'vue'] as const)(
    'returns OODS-N015 with no code for the legacy Subscription detail %s flow',
    async (framework) => {
      const result = await pipelineHandle({
        object: 'Subscription',
        context: 'detail',
        framework,
        styling: 'tailwind',
        options: { skipValidation: true, skipRender: true },
      });

      expect(result.error?.step).toBe('codegen');
      expect(result.error?.code).toBe('OODS-N015');
      expect(result.error?.message).toContain(`not emission-eligible for ${framework}`);
      expect(result.code).toBeUndefined();
      expect(result.pipeline.steps).toEqual(['compose', 'codegen']);
    },
  );

  it('keeps the complete legacy Subscription HTML save, load, and health path', async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'oods-tier1-html-'));
    process.env.MCP_SCHEMA_STORE_ROOT = tempRoot;

    try {
      const result = await pipelineHandle({
        object: 'Subscription',
        context: 'detail',
        framework: 'html',
        styling: 'tokens',
        save: 's182-tier1-legacy-html',
      });

      expect(result.error).toBeUndefined();
      expect(result.code?.framework).toBe('html');
      expect(result.code?.output).toContain('<!DOCTYPE html>');
      expect(result.pipeline.steps).toEqual(['compose', 'validate', 'render', 'codegen', 'save']);
      expect(result.saved?.name).toBe('s182-tier1-legacy-html');

      const loaded = await schemaLoadHandle({ name: 's182-tier1-legacy-html' });
      expect(loaded.name).toBe('s182-tier1-legacy-html');
      expect(loaded.schemaRef).toBeTruthy();
      expect(loaded.version).toBe(1);

      const health = await healthHandle();
      expect(['ok', 'degraded']).toContain(health.status);
      expect(health.schemas.savedCount).toBe(1);
    } finally {
      delete process.env.MCP_SCHEMA_STORE_ROOT;
      delete process.env.MCP_SCHEMA_STORE_DIR;
      await fs.rm(tempRoot, { recursive: true, force: true });
    }
  });
});
