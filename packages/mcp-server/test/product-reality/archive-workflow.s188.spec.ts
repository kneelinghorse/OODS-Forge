import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { handle as compose } from '../../src/tools/design.compose.js';
import { handle as generate } from '../../src/tools/code.generate.js';
import type { UiElement, UiSchema } from '../../src/schemas/generated.js';
import { typecheckWorkflow } from './workflow-typecheck.js';

// An isolated integration fixture, not the public m05 workflow proof: the current
// list is valid while the current detail/timeline placements have recorded blockers.
const prior = JSON.parse(readFileSync(new URL('../../../../artifacts/product-reality/sprint-188/m05/baseline-schemas.json', import.meta.url), 'utf8')).workflow as UiSchema;
describe('generated archive-view integration', () => {
  it.each(['react', 'vue'] as const)('%s carries the authored archive label into governed Tabs and row overlays, and typechecks', async (framework) => {
    const fixture = structuredClone(prior);
    const current = await compose({ object: 'Subscription', context: 'workflow' });
    fixture.screens[0] = current.schema.screens[0];
    const visit = (node: UiElement) => { if (node.component === 'ArchivedRowOverlay') node.props!.tabLabel = 'Past subscriptions'; node.children?.forEach(visit); };
    visit(fixture.screens[0]);
    const generated = await generate({ schema: fixture, framework, profile: 'build' });
    expect(generated.status, JSON.stringify(generated.errors)).toBe('ok');
    const files = generated.artifact!.files;
    const controller = files.find((file) => file.path === 'src/application.ts')!.contents;
    expect(controller).toContain('"tabLabel":"Past subscriptions"');
    const app = files.find((file) => file.path === (framework === 'react' ? 'src/App.tsx' : 'src/App.vue'))!.contents;
    expect(app).toContain('<Tabs '); expect(app).toContain('<ArchivedRowOverlay ');
    expect(app).toContain('archivePresentation.tabLabel'); expect(app).toContain('archivePresentation.archivedField');
    const result = typecheckWorkflow(generated.artifact!);
    expect(result.status, result.stdout + result.stderr).toBe(0);
  }, 70_000);
});
