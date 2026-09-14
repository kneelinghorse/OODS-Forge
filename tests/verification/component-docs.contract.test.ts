import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  CONTRACTS_PATH, LEDGER_PATH, MANIFEST_PATH, OUTPUT_DIRECTORY, ROOT, SCENARIOS_PATH, SURFACES,
  generateComponentDocs, readComponentDocInputs, renderComponentDocs, validateComponentDocInputs,
  type ComponentDocInputs,
} from '../../scripts/docs/generate-component-docs.js';

let inputs: ComponentDocInputs;
let documents: Map<string, string>;
const roots: string[] = [];
const read = (file: string, root = ROOT) => readFileSync(join(root, file), 'utf8');
beforeAll(async () => { inputs = await readComponentDocInputs(); documents = renderComponentDocs(inputs); });
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });

function isolatedRoot() {
  const root = mkdtempSync(join(tmpdir(), 'oods-component-docs-'));
  roots.push(root);
  const references = new Set<string>([MANIFEST_PATH]);
  for (const content of documents.values()) for (const match of content.matchAll(/\]\(\.\.\/\.\.\/([^\n)]+)\)/g)) references.add(decodeURI(match[1]!));
  for (const file of references) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    symlinkSync(join(ROOT, file), join(root, file));
  }
  mkdirSync(join(root, 'docs/history/components'), { recursive: true });
  return root;
}

function replaceFixture(root: string, file: string, content: string) {
  if (existsSync(join(root, file))) unlinkSync(join(root, file));
  mkdirSync(dirname(join(root, file)), { recursive: true });
  writeFileSync(join(root, file), content);
}

describe('governed component documentation derives its claims from four agreeing sources (s196 m04)', () => {
  it('publishes exactly one page for every ledger, contract, catalog and shared-scenario component', () => {
    const ids = inputs.ledger.rows.map(row => row.id).sort();
    expect(ids).toHaveLength(110);
    expect(Object.keys(inputs.contracts).sort()).toEqual(ids);
    expect(inputs.catalog.components.map(component => component.id).sort()).toEqual(ids);
    expect([...new Set(inputs.scenarios.map(scenario => scenario.oodsComponentId))].sort()).toEqual(ids);
    // The planning memo counted 72 literals; public source exports now supply 110 scenarios.
    expect(inputs.scenarios).toHaveLength(110);
    expect([...documents.keys()].sort()).toEqual([...ids.map(id => `${OUTPUT_DIRECTORY}/${id}.md`), `${OUTPUT_DIRECTORY}/README.md`].sort());
    const index = documents.get(`${OUTPUT_DIRECTORY}/README.md`)!;
    expect([...index.matchAll(/\| \[([^\]]+)\]\(\.\/([^)]+)\.md\)/g)].map(match => [match[1], match[2]])).toEqual(ids.map(id => [id, id]));
  });

  it('preserves all nine evidence scopes and every exact reference without inventing resolvable symbol anchors', () => {
    for (const row of inputs.ledger.rows) {
      const page = documents.get(`${OUTPUT_DIRECTORY}/${row.id}.md`)!;
      expect(page).toContain(`Proposed classification: \`${row.proposedClassification}\``);
      expect(page).toContain(`Reconciliation state: \`${row.reconciliationState}\``);
      for (const surface of SURFACES) {
        expect(page).toContain(`| \`${surface}\` | \`${row.surfaces[surface].state}\` |`);
        for (const evidence of row.surfaces[surface].evidence) {
          expect(page, `${row.id}/${surface} must retain ${evidence}`).toContain(`[${evidence}](../../${evidence.split('#')[0]})`);
        }
      }
      expect(page).toContain('do not imply a newly approved runtime census');
    }
    // Historical generated-consumer coverage must not be inflated by a newer, separate runtime sweep.
    const index = documents.get(`${OUTPUT_DIRECTORY}/README.md`)!;
    expect(index).toContain('| `generatedConsumer` | `implemented-evidence-complete` | 67 |');
    expect(index).toContain('| `generatedConsumer` | `unavailable` | 43 |');
  });

  it('documents exported behavior and scenario intent rather than only counting authored literals', () => {
    const button = documents.get(`${OUTPUT_DIRECTORY}/Button.md`)!;
    expect(button).toContain('| `events` | `activate` |');
    expect(button).toContain('Role: `button`.');
    expect(button).toContain('Accessible name: `label` strategy targeting `button`.');
    expect(button).toContain('| `Enter` | Activate the control |');
    expect(button).toContain('React asChild remains an extension and is not a Vue parity requirement.');
    expect(button).toContain('### `button-activate`');
    expect(button).toContain('activation handler called once');
    expect(button).toContain('- focus is visible');
    for (const row of inputs.ledger.rows) {
      const page = documents.get(`${OUTPUT_DIRECTORY}/${row.id}.md`)!;
      const scenarios = inputs.scenarios.filter(scenario => scenario.oodsComponentId === row.id);
      expect(page).toContain(`## Shared scenarios (${scenarios.length})`);
      expect(page).toContain('authored scenarios, not executed passes');
      expect([...page.matchAll(/^### `([^`]+)`$/gm)].map(match => match[1]).sort()).toEqual(scenarios.map(scenario => scenario.id).sort());
    }
    const timeline = documents.get(`${OUTPUT_DIRECTORY}/AddressValidationTimeline.md`)!;
    expect(timeline).toContain('| `Addressable` | `core` | `timeline` | Not recorded | Not recorded |');
    expect(timeline).not.toContain('| null |');
  });

  it.each(['ledger duplicate', 'contract missing', 'contract identity', 'catalog missing', 'catalog duplicate', 'scenario missing', 'scenario duplicate', 'surface missing', 'evidence escape'])(
    'rejects %s so partial or inconsistent sources cannot produce a complete-looking reference', mutation => {
      const changed = structuredClone(inputs);
      if (mutation === 'ledger duplicate') changed.ledger.rows.push(changed.ledger.rows[0]!);
      if (mutation === 'contract missing') delete (changed.contracts as Record<string, unknown>).Button;
      if (mutation === 'contract identity') changed.contracts.Button!.id = 'Text';
      if (mutation === 'catalog missing') changed.catalog.components = changed.catalog.components.filter(row => row.id !== 'Button');
      if (mutation === 'catalog duplicate') changed.catalog.components.push(changed.catalog.components[0]!);
      if (mutation === 'scenario missing') changed.scenarios = changed.scenarios.filter(row => row.oodsComponentId !== 'Button');
      if (mutation === 'scenario duplicate') changed.scenarios = [...changed.scenarios, changed.scenarios[0]!];
      if (mutation === 'surface missing') delete (changed.ledger.rows[0]!.surfaces as Record<string, unknown>).vue;
      if (mutation === 'evidence escape') changed.ledger.rows[0]!.surfaces.react.evidence = ['../unowned/evidence.json'];
      expect(() => validateComponentDocInputs(changed)).toThrow();
    },
  );

  it('has deterministic bytes and regenerates claims when a source changes', () => {
    const reordered = structuredClone(inputs);
    reordered.ledger.rows.reverse();
    reordered.catalog.components.reverse();
    reordered.scenarios = [...reordered.scenarios].reverse();
    expect([...renderComponentDocs(reordered)]).toEqual([...documents]);
    const changed = structuredClone(inputs);
    changed.ledger.rows.find(row => row.id === 'Button')!.surfaces.interaction = { state: 'unverified', evidence: [], reason: 'Keyboard proof was withdrawn.' };
    const generated = renderComponentDocs(changed);
    expect(generated.get(`${OUTPUT_DIRECTORY}/Button.md`)).toContain('| `interaction` | `unverified` | None recorded | Keyboard proof was withdrawn. |');
    expect(generated.get(`${OUTPUT_DIRECTORY}/README.md`)).toContain('| `interaction` | `unverified` | 1 |');
    expect(generated.get(`${OUTPUT_DIRECTORY}/Text.md`)).toBe(documents.get(`${OUTPUT_DIRECTORY}/Text.md`));
  });

  it('checks the actual committed pages, exact index population and every local source link', async () => {
    expect(await generateComponentDocs({ check: true })).toMatchObject({ ok: true, stale: [], orphans: [] });
    expect(readdirSync(join(ROOT, OUTPUT_DIRECTORY)).filter(file => file.endsWith('.md')).sort()).toEqual([...documents.keys()].map(file => file.split('/').at(-1)!).sort());
    for (const [file, expected] of documents) {
      expect(read(file)).toBe(expected);
      for (const match of expected.matchAll(/\]\(([^\n)]+)\)/g)) {
        const target = resolve(ROOT, dirname(file), decodeURI(match[1]!).split('#')[0]!);
        expect(existsSync(target), `${file} must resolve ${match[1]}`).toBe(true);
      }
    }
  });

  it('rejects hand edits, missing pages and nested orphan pages without writing in check mode', async () => {
    const root = isolatedRoot();
    await generateComponentDocs({ root, inputs });
    const button = `${OUTPUT_DIRECTORY}/Button.md`;
    const index = `${OUTPUT_DIRECTORY}/README.md`;
    writeFileSync(join(root, button), `${read(button, root)}\nUnsupported certification claim.\n`);
    unlinkSync(join(root, `${OUTPUT_DIRECTORY}/Text.md`));
    mkdirSync(join(root, OUTPUT_DIRECTORY, 'orphan'), { recursive: true });
    writeFileSync(join(root, OUTPUT_DIRECTORY, 'orphan/Unofficial.md'), '# Not governed\n');
    const before = read(button, root);
    const result = await generateComponentDocs({ root, inputs, check: true });
    expect(result).toMatchObject({ ok: false, orphans: [`${OUTPUT_DIRECTORY}/orphan/Unofficial.md`] });
    expect(result.stale.sort()).toEqual([button, `${OUTPUT_DIRECTORY}/Text.md`].sort());
    expect(read(button, root)).toBe(before);
    expect(existsSync(join(root, `${OUTPUT_DIRECTORY}/Text.md`))).toBe(false);
    expect(existsSync(join(root, result.orphans[0]!))).toBe(true);
    await generateComponentDocs({ root, inputs });
    expect(await generateComponentDocs({ root, inputs, check: true })).toMatchObject({ ok: true, stale: [], orphans: [] });
    expect(read(button, root)).toBe(documents.get(button));
    writeFileSync(join(root, index), read(index, root).replace('110 component pages', '111 component pages'));
    expect((await generateComponentDocs({ root, inputs, check: true })).stale).toEqual([index]);
  });

  it('refuses a missing evidence file instead of publishing an unresolved proof link', async () => {
    const changed = structuredClone(inputs);
    changed.ledger.rows[0]!.surfaces.react.evidence = ['artifacts/component-docs-missing-proof.json'];
    await expect(generateComponentDocs({ root: isolatedRoot(), inputs: changed })).rejects.toThrow('Component documentation source is missing: artifacts/component-docs-missing-proof.json');
  });

  it('loads all four sources through the pnpm separator and returns a failing CLI exit status for stale documentation', async () => {
    const root = isolatedRoot();
    const changed = structuredClone(inputs);
    changed.contracts.Button!.role = 'fixture-button';
    changed.scenarios = changed.scenarios.map(scenario => scenario.oodsComponentId === 'Button' ? { ...scenario, id: 'fixture-button-scenario' } : scenario);
    changed.catalog.components.find(row => row.id === 'Button')!.displayName = 'Fixture button';
    changed.ledger.rows.find(row => row.id === 'Button')!.reconciliationState = 'fixture-reconciliation';
    replaceFixture(root, CONTRACTS_PATH, `export const componentContracts = ${JSON.stringify(changed.contracts)};\n`);
    replaceFixture(root, SCENARIOS_PATH, `export const sharedScenarios = ${JSON.stringify(changed.scenarios)};\n`);
    replaceFixture(root, LEDGER_PATH, JSON.stringify(changed.ledger));
    replaceFixture(root, changed.catalogPath, JSON.stringify(changed.catalog));
    const command = (check: boolean) => spawnSync('pnpm', ['run', 'docs:components', '--', '--root', root, ...(check ? ['--check'] : [])], { cwd: ROOT, encoding: 'utf8', timeout: 30_000 });
    const generation = command(false);
    expect(generation.status, generation.stderr).toBe(0);
    const button = read(`${OUTPUT_DIRECTORY}/Button.md`, root);
    for (const claim of ['fixture-button', 'fixture-button-scenario', 'Fixture button', 'fixture-reconciliation']) expect(button).toContain(claim);
    expect(command(true).status).toBe(0);
    writeFileSync(join(root, OUTPUT_DIRECTORY, 'Button.md'), `${button}\nStale edit.\n`);
    const stale = command(true);
    expect(stale.status).toBe(1);
    expect(stale.stderr).toContain('docs/components/Button.md');
  }, 30_000);

  it('keeps 31 dated historical guides outside the generated census and repairs active references', () => {
    const history = readdirSync(join(ROOT, 'docs/history/components')).filter(file => file.endsWith('.md'));
    expect(history).toHaveLength(31);
    const current = readdirSync(join(ROOT, OUTPUT_DIRECTORY));
    expect(current).not.toContain('table.md');
    expect(current).not.toContain('tag-input.md');
    expect(current).toEqual(expect.arrayContaining(['Table.md', 'TagInput.md']));
    for (const file of history) {
      const body = read(`docs/history/components/${file}`);
      expect(body).toMatch(/^> Archived on 2026-09-12 \(s196-m04\)\./);
      expect(body).toContain('excluded from current governed component claims');
      for (const match of body.matchAll(/\]\(([^\n)]+)\)/g)) if (!/^https?:/.test(match[1]!)) {
        expect(existsSync(resolve(ROOT, 'docs/history/components', match[1]!)), `${file}: ${match[1]}`).toBe(true);
      }
    }
    const referenceFiles = ['docs/adoption/brownfield-guide.md', 'docs/viz/README.md', 'docs/viz/system-overview.md', ...['Tabs', 'Pagination', 'Breadcrumbs', 'Progress', 'Toast', 'EmptyState'].map(name => `stories/components/${name}.docs.mdx`)];
    for (const file of referenceFiles) {
      const body = read(file);
      for (const legacy of history) expect(body).not.toContain(`docs/components/${legacy}`);
      const historyLinks = [...body.matchAll(/\]\(([^)]+history\/components\/[^)]*)\)/g)];
      expect(historyLinks.length, `${file} must link to its archived reference`).toBeGreaterThan(0);
      for (const match of historyLinks) expect(existsSync(resolve(ROOT, dirname(file), match[1]!))).toBe(true);
    }
  });
});
