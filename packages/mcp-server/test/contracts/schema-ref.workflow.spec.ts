import { describe, expect, it } from 'vitest';
import { handle as composeHandle } from '../../src/tools/design.compose.js';
import { handle as validateHandle } from '../../src/tools/repl.validate.js';
import { handle as renderHandle } from '../../src/tools/repl.render.js';
import { handle as codegenHandle } from '../../src/tools/code.generate.js';

describe('schemaRef workflow', () => {
  it('design.compose returns a bounded Card schemaRef that downstream tools accept', async () => {
    const compose = await composeHandle({ intent: 'simple card', layout: 'card' });
    expect(compose.status).toBe('ok');
    expect(compose.schemaRef).toBeTruthy();

    const schemaRef = compose.schemaRef!;
    const validation = await validateHandle({ mode: 'full', schemaRef });
    expect(validation.status).toBe('ok');

    const render = await renderHandle({ mode: 'full', schemaRef, apply: true });
    expect(render.status).toBe('ok');
    expect(render.html).toContain('<!DOCTYPE html>');

    const codegen = await codegenHandle({ schemaRef, framework: 'react' });
    expect(codegen.status).toBe('ok');
    expect(codegen.code.length).toBeGreaterThan(0);
    expect(codegen.code).toContain("from '@oods/components-react'");
  });

  it('componentOverrides materialize in schemaRef for render/codegen', async () => {
    const compose = await composeHandle({
      intent: 'list',
      layout: 'list',
      preferences: { componentOverrides: { items: 'Table' } },
    });
    expect(compose.status).toBe('ok');
    expect(compose.schemaRef).toBeTruthy();

    const schemaRef = compose.schemaRef!;
    const render = await renderHandle({ mode: 'full', schemaRef, apply: true });
    expect(render.status).toBe('ok');
    expect(render.html).toContain('data-oods-component="Table"');

    const codegen = await codegenHandle({ schemaRef, framework: 'react' });
    expect(codegen).toMatchObject({
      status: 'ok',
      framework: 'react',
      warnings: [],
      meta: { nodeCount: 9, componentCount: 6 },
    });
    expect(codegen.errors).toBeUndefined();
    expect(codegen.code.length).toBeGreaterThan(0);
    expect(codegen.code).toContain(
      "import { PaginationBar, SearchInput } from '@oods/components-react/ported';",
    );
    expect(codegen.code).toContain("import '@oods/component-styles/css-ported';");
    expect(codegen.code).toContain('<Table id="slot-items-6"');
    expect(codegen.imports).toEqual(expect.arrayContaining([
      '@oods/components-react/ported',
      '@oods/component-styles/css-ported',
    ]));
    expect(codegen.artifact?.files).toHaveLength(1);
    expect(codegen.artifact?.files[0]?.contents.length).toBeGreaterThan(0);
    expect(codegen.validationReceipt.checks).toEqual(expect.arrayContaining([
      'target-readiness',
      'dependency-closure',
    ]));
  });

  it('supports patch validation with schemaRef and renders the patched tree', async () => {
    const compose = await composeHandle({ intent: 'user registration form' });
    expect(compose.status).toBe('ok');
    expect(compose.schemaRef).toBeTruthy();

    const schemaRef = compose.schemaRef!;
    const validation = await validateHandle({
      mode: 'patch',
      schemaRef,
      patch: [{ op: 'replace', path: '/screens/0/component', value: 'Card' }],
    });

    expect(validation.status).toBe('ok');
    expect(validation.appliedPatch).toBe(true);
    expect(validation.normalizedTree?.screens?.[0]?.component).toBe('Card');

    const render = await renderHandle({ mode: 'full', schema: validation.normalizedTree!, apply: true });
    expect(render.status).toBe('ok');
    expect(render.html).toContain('<!DOCTYPE html>');
  });

  it('missing schemaRef returns actionable errors', async () => {
    const missingRef = 'compose-missing-ref';

    const validation = await validateHandle({ mode: 'full', schemaRef: missingRef });
    expect(validation.status).toBe('invalid');
    expect(validation.errors[0].code).toMatch(/OODS-N00[34]/);
    expect(validation.errors[0].hint).toContain('design.compose');

    const render = await renderHandle({ mode: 'full', schemaRef: missingRef });
    expect(render.status).toBe('error');
    expect(render.errors[0].code).toMatch(/OODS-N00[34]/);
    expect(render.errors[0].hint).toContain('design.compose');

    const codegen = await codegenHandle({ schemaRef: missingRef, framework: 'react' });
    expect(codegen.status).toBe('error');
    expect(codegen.errors?.[0].code).toMatch(/OODS-N00[34]/);
    expect(codegen.errors?.[0].message).toContain('design.compose');
  });
});
