import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(import.meta.dirname, '../../../../');
const SUPPORTED_SUBSET_CLAUSE =
  'supported add/remove/replace subset of RFC 6902';

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function collectRfc6902Descriptions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(collectRfc6902Descriptions);
  }
  if (!value || typeof value !== 'object') {
    return [];
  }

  return Object.entries(value).flatMap(([key, child]) => {
    if (
      key === 'description' &&
      typeof child === 'string' &&
      /RFC 6902/i.test(child)
    ) {
      return [child];
    }
    return collectRfc6902Descriptions(child);
  });
}

function expectQualified(label: string, descriptions: string[]): void {
  for (const description of descriptions) {
    expect(
      description,
      `${label} left an RFC 6902 claim unqualified`,
    ).toContain(SUPPORTED_SUBSET_CLAUSE);
  }
}

function generatedSourceSection(source: string): string {
  const generated = read('packages/mcp-server/src/schemas/generated.ts');
  const marker = `// Source: ${source}`;
  const start = generated.indexOf(marker);
  const end = generated.indexOf('// Source: ', start + marker.length);

  expect(
    start,
    `generated.ts is missing the ${source} source section`,
  ).toBeGreaterThanOrEqual(0);
  return generated.slice(start, end < 0 ? generated.length : end);
}

describe('brand.apply RFC 6902 advertised wording (s179-r1)', () => {
  it('pins the source descriptions that Generator A expands into the 13 generated sites', () => {
    const sources = [
      {
        label: 'brand.apply.input.json',
        path: 'packages/mcp-server/src/schemas/brand.apply.input.json',
        expectedDescriptions: 2,
      },
      {
        label: 'repl.patch.json shared references',
        path: 'packages/mcp-server/src/schemas/repl.patch.json',
        expectedDescriptions: 2,
      },
    ] as const;

    for (const source of sources) {
      const descriptions = collectRfc6902Descriptions(
        JSON.parse(read(source.path)) as unknown,
      );
      expect(
        descriptions,
        `${source.label} RFC 6902 description census moved`,
      ).toHaveLength(source.expectedDescriptions);
      expectQualified(source.label, descriptions);
    }

    const generatedSections = [
      ['brand.apply.input.json', 2],
      ['repl.output.json', 2],
      ['repl.patch.json', 2],
      ['repl.render.input.json', 2],
      ['repl.render.output.json', 2],
      ['repl.validate.input.json', 1],
      ['repl.validate.output.json', 2],
    ] as const;

    expect(generatedSections.reduce((sum, [, count]) => sum + count, 0)).toBe(
      13,
    );
    for (const [source, expectedDescriptions] of generatedSections) {
      const descriptions = generatedSourceSection(source)
        .split('\n')
        .filter((line) => /RFC 6902/i.test(line));
      expect(
        descriptions,
        `${source} generated RFC 6902 census moved`,
      ).toHaveLength(expectedDescriptions);
    }
  });

  it('qualifies every site in the locked advertised-surface census', () => {
    const sites = [
      {
        label: 'brand.apply input schema',
        path: 'packages/mcp-server/src/schemas/brand.apply.input.json',
        expectedDescriptions: 2,
      },
      {
        label: 'adapter tool description',
        path: 'packages/mcp-adapter/tool-descriptions.json',
        expectedDescriptions: 1,
      },
      {
        label: 'Generator A TypeScript output',
        path: 'packages/mcp-server/src/schemas/generated.ts',
        expectedDescriptions: 13,
      },
      {
        label: 'generated brand.apply API page',
        path: 'docs/api/brand-apply.md',
        expectedDescriptions: 3,
      },
      {
        label: 'generated API index brand.apply row',
        path: 'docs/api/README.md',
        expectedDescriptions: 1,
        lineFilter: (line: string) => line.includes('[brand.apply]'),
      },
      {
        label: 'multi-brand cookbook',
        path: 'docs/cookbook/03-multi-brand-theming.md',
        expectedDescriptions: 1,
        lineFilter: (line: string) => line.includes('`brand.apply`'),
      },
    ] as const;

    for (const site of sites) {
      const descriptions = read(site.path)
        .split('\n')
        .filter((line) => /RFC 6902/i.test(line))
        .filter((line) => !('lineFilter' in site) || site.lineFilter(line));

      expect(
        descriptions,
        `${site.label} RFC 6902 description census moved`,
      ).toHaveLength(site.expectedDescriptions);
      expectQualified(site.label, descriptions);
    }
  });
});
