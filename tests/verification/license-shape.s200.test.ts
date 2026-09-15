import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
// The renderer is the single producer of every holder occurrence; the spec reads its exports.
import { CANONICAL_SHA256_PATH, HOLDER_PATH, LICENSE_FILES, SPDX_ID, loadCanonical, renderAll, requiredNotice } from '../../scripts/license/render-license.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');
const sha = (text: string) => createHash('sha256').update(text).digest('hex');
const CANONICAL_SHA256 = 'ffcca38841adb694b6f380647e15f17c446a4d1656fed51a1e2041d064c94cc8';
const GUARDED = ['package.json', ...['a11y-tools', 'tokens', 'tw-variants', 'viz-core', 'viz-render', 'component-contracts', 'component-styles', 'components-react', 'components-vue', 'artifacts', 'mcp-adapter', 'mcp-bridge', 'mcp-server', 'release-utils', 'schemas-tools', 'sdk'].map(name => `packages/${name}/package.json`),
  ...['agents-smoke', 'design-lab-shell', 'oods-agent-cli', 'soak-runner'].map(name => `tools/${name}/package.json`), 'apps/playground/package.json'];
const MANIFESTS = [...GUARDED, 'examples/sample-app/package.json'];
const TERMS_CARRIERS = ['README.md', 'CONTRIBUTING.md', 'COMMERCIAL.md', 'SECURITY.md', 'docs/LICENSE-FAQ.md', 'docs/README.md', 'docs/compositor-readme.md'];
const RENDERED = [...LICENSE_FILES, 'README.md', 'COMMERCIAL.md', 'CONTRIBUTING.md'] as string[];
// Tracked and untracked (unignored) files alike, so a new carrier cannot hide before it is committed.
const textFiles = () => execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '--', '.', ':(exclude)artifacts', ':(exclude)cmos'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim().split('\n')
  .filter(file => /\.(md|json|ts|tsx|mjs|cjs|js|yml|yaml|txt|css|html)$/.test(file) || path.basename(file) === 'LICENSE')
  .filter(file => !/^(artifacts|cmos|node_modules)\//.test(file) && !/\/node_modules\//.test(file));

describe('s200-m03 license shape: PolyForm Noncommercial from one holder source', () => {
  it('commits the canonical SPDX text with its recorded sha256', () => {
    const canonical = loadCanonical(root);
    expect(canonical.sha256).toBe(CANONICAL_SHA256);
    expect(read(CANONICAL_SHA256_PATH).trim().split(/\s+/)[0]).toBe(CANONICAL_SHA256);
    expect(canonical.text).toContain('# PolyForm Noncommercial License 1.0.0');
    expect(canonical.text).toContain('Any noncommercial purpose is a permitted purpose.');
  });

  it('renders the six LICENSE files identically with the holder\'s Required Notice and nothing else changed', () => {
    const { holder, canonical, outputs } = renderAll(root);
    // The name itself is never spelled here: holder.json is the only authored source of it.
    expect(holder).toEqual({ holder: expect.stringMatching(/\S/), url: expect.stringMatching(/^https:\/\/\S+$/), contact: expect.stringMatching(/^\S+@\S+\.\S+$/), year: 2026 });
    for (const file of LICENSE_FILES) {
      expect(read(file), file).toBe(outputs[file]);
      expect(read(file)).toContain(`> ${requiredNotice(holder)}`);
      expect(read(file)).not.toContain('Yoyodyne');
      expect(read(file)).not.toMatch(/\bMIT\b/);
    }
    expect(new Set(LICENSE_FILES.map(file => sha(read(file)))).size).toBe(1);
    // The rendered text differs from the canonical text by exactly the Required Notice line.
    const canonicalLines = canonical.text.split('\n'), renderedLines = read('LICENSE').split('\n');
    expect(renderedLines.length).toBe(canonicalLines.length);
    expect(canonicalLines.filter((line, index) => line !== renderedLines[index])).toEqual(['> Required Notice: Copyright Yoyodyne, Inc. (http://example.com)']);
  });

  it('keeps the holder string in exactly one authored source; every other occurrence is a rendered output', () => {
    const { holder } = renderAll(root);
    const carriers = textFiles().filter(file => read(file).includes(holder.holder)).sort();
    expect(carriers).toEqual([HOLDER_PATH, ...RENDERED].sort());
    for (const file of ['README.md', 'COMMERCIAL.md', 'CONTRIBUTING.md']) {
      const document = read(file);
      const span = document.slice(document.indexOf('<!-- license-holder:start -->'), document.indexOf('<!-- license-holder:end -->'));
      expect(document.split(holder.holder).length - 1, `${file} names the holder only inside its rendered span`).toBe(span.split(holder.holder).length - 1);
    }
  });

  it('render-license --check exits 0 against the tree', () => {
    const result = spawnSync(process.execPath, ['scripts/license/render-license.mjs', '--check'], { cwd: root, encoding: 'utf8' });
    expect(result.status, result.stderr).toBe(0);
  });

  it('declares the SPDX id on all 23 manifests and names the corrected repository', () => {
    for (const file of MANIFESTS) expect(JSON.parse(read(file)).license, file).toBe(SPDX_ID);
    const rootManifest = JSON.parse(read('package.json'));
    expect(rootManifest.repository).toEqual({ type: 'git', url: 'https://github.com/kneelinghorse/OODS-Forge.git' });
    expect(rootManifest.homepage).toBe('https://github.com/kneelinghorse/OODS-Forge#readme');
    expect(rootManifest.private).toBe(true);
  });

  it('packs the terms files beside the manifest and inherits the license id', () => {
    const source = read('scripts/pkg/build.ts');
    expect(source).toContain("export const TERMS_FILES = ['LICENSE', 'COMMERCIAL.md', 'THIRD-PARTY-NOTICES.md'] as const;");
    expect(source).toContain("license: parsedPackage.license ?? 'UNLICENSED',");
    if (fs.existsSync(path.join(root, 'dist/pkg/package.json'))) {
      const packed = JSON.parse(read('dist/pkg/package.json'));
      expect(packed.license).toBe(SPDX_ID);
      expect(packed.files).toEqual(expect.arrayContaining(['LICENSE', 'COMMERCIAL.md']));
      expect(read('dist/pkg/LICENSE')).toBe(read('LICENSE'));
      expect(read('dist/pkg/COMMERCIAL.md')).toBe(read('COMMERCIAL.md'));
    }
  });

  it('leaves no MIT reference outside the historical statement and claims no OSI status', () => {
    const readme = read('README.md');
    const statement = readme.slice(readme.indexOf('**The OODS-Foundry snapshot.**'), readme.indexOf('\n', readme.indexOf('**The OODS-Foundry snapshot.**')));
    expect(statement).toContain('declared MIT');
    expect(readme.replace(statement, '')).not.toMatch(/\bMIT\b/);
    for (const file of TERMS_CARRIERS.filter(file => file !== 'README.md')) expect(read(file), file).not.toMatch(/\bMIT\b/);
    for (const file of MANIFESTS) expect(read(file)).not.toMatch(/"license":\s*"MIT"/);
    for (const file of TERMS_CARRIERS) expect(read(file), file).not.toMatch(/open[ -]source/i);
    const changelog = read('CHANGELOG.md');
    expect(changelog.slice(changelog.indexOf('## Sprint 200'), changelog.indexOf('## Sprint 181'))).not.toMatch(/open[ -]source/i);
  });

  it('states the inbound grant, the PR checkboxes, the contact-only commercial path and the plain-words licensing section', () => {
    const contributing = read('CONTRIBUTING.md');
    expect(contributing).toContain('## Inbound license grant');
    expect(contributing).toContain('perpetual, irrevocable, worldwide, royalty-free, sublicensable license to use, reproduce, modify, distribute and sublicense');
    expect(contributing).toContain('there is no contributor license agreement to sign');
    expect(contributing).toContain('the contributor path');
    for (const file of ['.github/pull_request_template.md', '.github/PULL_REQUEST_TEMPLATE/token-change.md']) expect(read(file), file).toMatch(/- \[ \] I grant this contribution under the inbound license grant in CONTRIBUTING\.md/);
    // 2026-09-15: no published price, no evaluation offer, no agreement text; commercial licensing is by contact, terms case by case.
    const commercial = read('COMMERCIAL.md');
    expect(commercial).toContain(`Contact: ${renderAll(root).holder.contact}.`);
    expect(commercial).toContain('Terms are agreed case by case.');
    for (const carrier of ['COMMERCIAL.md', 'README.md', 'docs/LICENSE-FAQ.md', 'CHANGELOG.md']) expect(read(carrier), carrier).not.toMatch(/USD|\$\s?\d|per organization per year|paid evaluation|commercial-price|commercial-license-agreement|docs\/legal/);
    expect(fs.existsSync(path.join(root, 'docs/legal'))).toBe(false);
    const faq = read('docs/LICENSE-FAQ.md');
    for (const edge of ['freelancer', 'student', 'nonprofit', 'government', 'internally', 'fork', 'OSI-approved', 'Other']) expect(faq, edge).toContain(edge);
    const readme = read('README.md');
    expect(readme.startsWith('# OODS Forge\n')).toBe(true);
    expect(readme).toContain('## LICENSING');
    expect(readme).toContain('GitHub\'s license detector therefore shows "Other"');
    expect(readme).toContain('Nothing in OODS-Forge from this commit on is MIT.');
    expect(read('SECURITY.md')).toContain('OODS Forge');
  });
});
