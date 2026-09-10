import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../../../../');
const DOCS_DIR = path.join(ROOT, 'docs/api');
const REGISTRY_PATH = path.join(ROOT, 'packages/mcp-server/src/tools/registry.json');
const DESCRIPTIONS_PATH = path.join(ROOT, 'packages/mcp-adapter/tool-descriptions.json');

describe('API reference generator', () => {
  it('docs/api/ directory exists with generated files', () => {
    expect(fs.existsSync(DOCS_DIR)).toBe(true);
    const files = fs.readdirSync(DOCS_DIR);
    expect(files.length).toBeGreaterThan(0);
    expect(files).toContain('README.md');
  });

  it('generates a markdown file for each auto-registered tool', () => {
    const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
    const autoTools: string[] = registry.auto;

    for (const tool of autoTools) {
      const slug = tool.replace(/\./g, '-');
      const filePath = path.join(DOCS_DIR, `${slug}.md`);
      expect(fs.existsSync(filePath), `Missing doc for ${tool}`).toBe(true);
    }
  });

  it('each doc contains required sections', () => {
    const files = fs.readdirSync(DOCS_DIR).filter((f) => f !== 'README.md');

    for (const file of files) {
      const content = fs.readFileSync(path.join(DOCS_DIR, file), 'utf-8');
      expect(content, `${file} missing Input Parameters`).toContain('## Input Parameters');
      expect(content, `${file} missing Output Shape`).toContain('## Output Shape');
      expect(content, `${file} missing Error Codes`).toContain('## Error Codes');
      expect(content, `${file} missing Example Request`).toContain('## Example Request');
    }
  });

  it('every generated doc maps to a registered tool — bidirectional, no orphans [feedback-73]', () => {
    // The original suite only checked registered→doc (each tool has a page). The
    // reverse — doc→registered — is what catches a RETIRED tool whose page was never
    // pruned. Assert the docs/api tool pages are EXACTLY the registered tool set.
    const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
    const registeredSlugs = [...registry.auto, ...registry.onDemand]
      .map((t: string) => t.replace(/\./g, '-'))
      .sort();
    const docSlugs = fs
      .readdirSync(DOCS_DIR)
      .filter((f) => f.endsWith('.md') && f !== 'README.md')
      .map((f) => f.replace(/\.md$/, ''))
      .sort();

    for (const slug of docSlugs) {
      expect(
        registeredSlugs.includes(slug),
        `Orphaned doc docs/api/${slug}.md has no registered tool — a retired tool leaked its page`,
      ).toBe(true);
    }
    expect(docSlugs).toEqual(registeredSlugs);
  });

  it('README.md index links to all tool docs', () => {
    const indexContent = fs.readFileSync(path.join(DOCS_DIR, 'README.md'), 'utf-8');
    const files = fs.readdirSync(DOCS_DIR).filter((f) => f !== 'README.md');

    for (const file of files) {
      expect(indexContent, `README.md missing link to ${file}`).toContain(`./${file}`);
    }
  });

  it('documents code-generation failures and hash binding without overclaiming early receipts', () => {
    const codeGenerateDoc = fs.readFileSync(path.join(DOCS_DIR, 'code-generate.md'), 'utf-8');
    const pipelineDoc = fs.readFileSync(path.join(DOCS_DIR, 'pipeline.md'), 'utf-8');
    const descriptions = JSON.parse(fs.readFileSync(DESCRIPTIONS_PATH, 'utf-8')) as Record<string, string>;

    for (const code of [
      'OODS-V007',
      'OODS-V009',
      'OODS-V119',
      'OODS-V162',
      'OODS-V163',
      'OODS-N003',
      'OODS-N004',
      'OODS-N013',
      'OODS-N015',
      'OODS-N016',
    ]) {
      expect(codeGenerateDoc).toContain(`| \`${code}\` |`);
    }
    expect(codeGenerateDoc).toContain('HTML renderer unavailable; fallback output is forbidden at build or release confidence');
    expect(codeGenerateDoc).not.toContain('Registry fallback used');
    expect(codeGenerateDoc).not.toContain('| `OODS-N002` |');
    expect(codeGenerateDoc).not.toContain('| `OODS-V006` |');

    for (const code of [
      'OODS-V007',
      'OODS-V162',
      'OODS-V163',
      'OODS-N013',
      'OODS-N015',
      'OODS-N016',
      'OODS-N017',
      'OODS-S009',
      'OODS-S010',
      'OODS-S011',
      'OODS-S012',
      'OODS-S013',
      'OODS-S014',
    ]) {
      expect(pipelineDoc).toContain(`| \`${code}\` |`);
    }

    expect(descriptions['code.generate']).toContain(
      'every response includes a validationReceipt naming applied policy, checks, omissions, and evidence disposition',
    );
    expect(descriptions['code.generate']).toContain(
      "Receipts produced after artifact construction also name that artifact's content hash.",
    );
    expect(descriptions['code.generate']).not.toContain('every response includes a validationReceipt naming applied policy, checks, omissions, and hash-bound evidence');
  });

  it('regeneration is idempotent', () => {
    // Generate once to establish baseline
    execSync('pnpm -w run docs:api', { cwd: ROOT, stdio: 'pipe' });

    // Read all current files
    const filesBefore: Record<string, string> = {};
    const files = fs.readdirSync(DOCS_DIR);
    for (const file of files) {
      filesBefore[file] = fs.readFileSync(path.join(DOCS_DIR, file), 'utf-8');
    }

    // Regenerate again
    execSync('pnpm -w run docs:api', { cwd: ROOT, stdio: 'pipe' });

    // Verify same files, same content
    const filesAfter = fs.readdirSync(DOCS_DIR);
    expect(filesAfter.sort()).toEqual(files.sort());

    for (const file of files) {
      const contentAfter = fs.readFileSync(path.join(DOCS_DIR, file), 'utf-8');
      expect(contentAfter, `${file} changed after regeneration`).toBe(filesBefore[file]);
    }
  });
});
