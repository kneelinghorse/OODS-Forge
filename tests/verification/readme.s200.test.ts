import fs from 'node:fs';
import path from 'node:path';
import { load as yaml } from 'js-yaml';
import { beforeAll, describe, expect, it } from 'vitest';
import { collectFacts, type Facts } from '../../scripts/docs/generate-forge-claims';

const root = path.resolve(import.meta.dirname, '../..');
const read = (relative: string) => fs.readFileSync(path.join(root, relative), 'utf8');
const readme = read('README.md');
const section = (heading: string) => {
  const start = readme.indexOf(`\n${heading}\n`);
  expect(start, heading).toBeGreaterThan(-1);
  const rest = readme.slice(start + heading.length + 2);
  const next = rest.search(/\n## /);
  return next < 0 ? rest : rest.slice(0, next);
};

describe('s200-m05 README for a newcomer', () => {
  let facts: Facts;
  beforeAll(async () => { facts = await collectFacts(); });

  it('opens with the title, what Forge is, and the three words each in one plain sentence with an example', () => {
    expect(readme.startsWith('# OODS Forge\n')).toBe(true);
    expect(readme).not.toContain('OODS Foundry MCP');
    expect(readme).not.toContain('## Historical upstream reference');
    expect(readme).toContain('OODS Forge is a design-system engine that an AI assistant drives over MCP.');
    const words = section('## Three words');
    expect(words).toMatch(/^- \*\*Object\*\*: a thing your product has[^\n]*`Subscription`/m);
    expect(words).toMatch(/^- \*\*Trait\*\*: a capability an object composes in[^\n]*`Stateful`[^\n]*`Addressable`/m);
    expect(words).toMatch(/^- \*\*Context\*\*: the kind of screen an object is shown in[^\n]*detail, list, form, timeline, card, inline, workflow/m);
    expect(words.match(/^- \*\*/gm)).toHaveLength(3);
  });

  it('takes every count from the generated claims templates', () => {
    expect(readme).toContain(`${facts.objectDefinitions} object definitions`);
    expect(readme).toContain(`${facts.traits} traits`);
    expect(readme).toContain(`${facts.components} governed components`);
    expect(readme).toContain(`${facts.chartTypes} chart types`);
    expect(readme).toContain(`${facts.taxonomyPatterns} named patterns`);
    expect(readme).toContain(`${facts.auto} tools by default (${facts.tools} in all)`);
    expect(readme).toContain(`## MCP tool surface (${facts.tools} tools)`);
    expect(readme).toContain(`${facts.accuracyRules} rules about baselines`);
    expect(readme).toContain(`${facts.dashboardTypes} admitted chart types`);
    for (const key of ['what-forge-is', 'three-words', 'generates-and-certifies', 'first-run-health', 'schema-ttl', 'tool-surface']) {
      expect(readme, key).toContain(`<!-- forge-claim:${key} -->`);
      expect(readme, key).toContain(`<!-- /forge-claim:${key} -->`);
    }
  });

  it('says what Forge generates and that certify is a measurement, not a promise', () => {
    const generates = section('## What Forge generates, and what "certify" means');
    expect(generates).toContain('"Certify" is a measurement, not a promise.');
    expect(generates).toContain('`artifact.certify` takes a chart specification Forge rendered');
    for (const pillar of ['accuracy', 'accessibility equivalence', 'contrast', 'determinism']) expect(generates, pillar).toContain(pillar);
    expect(generates).toContain('`validationReceipt` from `code.generate`');
    expect(generates).toContain('No receipt claims a check it did not run.');
  });

  it('gives the ten-minute first run from the release as six numbered steps with the tool calls', () => {
    const run = section('## The first run, in ten minutes');
    expect(run).toContain('[docs/runtime/install.md](docs/runtime/install.md)');
    const steps = [...run.matchAll(/^\d+\. \*\*([^*]+)\*\*/gm)].map(match => match[1]);
    expect(steps).toEqual(['Download and verify.', 'Install into your client.', 'Compose one screen.', 'Certify a chart.', 'Generate the app.', 'Look at it.']);
    expect(run).toContain('shasum -a 256 -c forge-runtime.tar.gz.sha256');
    expect(run).toContain('claude mcp add forge -- node /path/to/forge-runtime/packages/mcp-adapter/index.js');
    expect(run).toContain('claude mcp get forge');
    for (const call of ['`health`', '`design.compose` with `{"object": "Subscription", "context": "detail"}`', '`viz.render`', '`artifact.certify` with `{"spec": <that normalizedSpec>}`', '`code.generate` with `{"schemaRef": "<from step 3>", "framework": "react", "profile": "build"}`', '`repl` with `{"action": "render", "schemaRef": "<from step 3>", "apply": true, "output": {"compact": false}}`']) {
      expect(run, call).toContain(call);
    }
    // The order of the calls is the order a newcomer performs them.
    const positions = ['`health`', '`design.compose`', '`viz.render`', '`artifact.certify`', '`code.generate`', '`repl`'].map(call => run.indexOf(call));
    expect([...positions].sort((left, right) => left - right)).toEqual(positions);
    expect(run).toContain('`pillars: {"a11yEquivalence": "pass", "determinism": "pass", "contrast": "pass", "accuracy": "pass"}`');
    expect(run).toContain('`src/GeneratedUI.tsx`');
    expect(run).toContain('OODS-N019');
    expect(run).toContain('[FEEDBACK.md](FEEDBACK.md)');
  });

  it('keeps LICENSING, the feedback path, the clone path and the deep explanation, and never calls Forge open source', () => {
    expect(readme).toContain('## LICENSING');
    expect(readme).toContain('## Feedback');
    expect(readme).toContain('## Contributing');
    expect(readme).toContain('[docs/mcp/Connections.md](docs/mcp/Connections.md)');
    expect(readme).toContain('[docs/how-forge-works.html](docs/how-forge-works.html): the deep explanation');
    expect(readme).toContain('issues/new?template=bug-report.yml');
    expect(readme).toContain('issues/new?template=did-not-read-right.yml');
    expect(readme).not.toMatch(/open[ -]source/i);
    expect(readme).not.toMatch(/repl\.(?:render|validate)/);
  });

  it('ships FEEDBACK.md and the issue templates the README points at, with the adoption template retired', () => {
    const feedback = read('FEEDBACK.md');
    for (const phrase of ['A screen that reads wrong', 'A certification result you disagree with', 'Install friction', 'A chart that says the wrong thing', 'A sentence that did not make sense', 'The tool call as you made it', 'template=bug-report.yml', 'template=did-not-read-right.yml', 'template=feature-request.yml', '[COMMERCIAL.md](COMMERCIAL.md)']) {
      expect(feedback, phrase).toContain(phrase);
    }
    const directory = path.join(root, '.github/ISSUE_TEMPLATE');
    expect(fs.readdirSync(directory).sort()).toEqual(['bug-report.yml', 'config.yml', 'did-not-read-right.yml', 'feature-request.yml']);
    const bug = yaml(read('.github/ISSUE_TEMPLATE/bug-report.yml')) as { name: string; body: Array<{ id?: string; attributes?: { options?: string[] } }> };
    expect(bug.name).toBe('Bug report');
    expect(bug.body.map(item => item.id).filter(Boolean)).toEqual(['client', 'runtime', 'call', 'output', 'expected', 'environment']);
    expect(bug.body.find(item => item.id === 'client')!.attributes!.options).toEqual(expect.arrayContaining(['Claude Code', 'Claude Desktop', 'Cursor']));
    const reads = yaml(read('.github/ISSUE_TEMPLATE/did-not-read-right.yml')) as { name: string; labels: string[]; body: Array<{ id?: string }> };
    expect(reads.name).toBe('This did not read right');
    expect(reads.body.map(item => item.id).filter(Boolean)).toEqual(['what', 'where', 'saw', 'expected', 'runtime']);
    const config = yaml(read('.github/ISSUE_TEMPLATE/config.yml')) as { blank_issues_enabled: boolean; contact_links: Array<{ url: string }> };
    expect(config.blank_issues_enabled).toBe(false);
    expect(config.contact_links.map(link => link.url.split('/').at(-1))).toEqual(['FEEDBACK.md', 'COMMERCIAL.md', 'SECURITY.md']);
    expect((yaml(read('.github/ISSUE_TEMPLATE/feature-request.yml')) as { name: string }).name).toBe('Feature Request');
  });
});
