import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PORTED_COMPONENT_STYLE_IDS } from '../src/ported.js';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = fs.readFileSync(path.join(packageRoot, 'src/components-ported.css'), 'utf8');

describe('Sprint 184 ported component style contract', () => {
  it('covers exactly the separate eight-component union', () => {
    expect(PORTED_COMPONENT_STYLE_IDS).toEqual([
      'StatusBadge',
      'PriceBadge',
      'StatusTimeline',
      'AuditTimeline',
      'CancellationSummary',
      'SearchInput',
      'PaginationBar',
      'RelativeTimestamp',
    ]);
    for (const id of PORTED_COMPONENT_STYLE_IDS) {
      expect(css, id).toContain(`[data-oods-component='${id}']`);
    }
  });

  it('packages the previously orphaned statusable rules through css-ported', () => {
    expect(css).toContain('@import "./statusables.css"');
    const statusables = fs.readFileSync(path.join(packageRoot, '../../src/styles/statusables.css'), 'utf8');
    expect(statusables).toContain('.statusable-badge');
  });

  it('keeps token and forced-color styling in the additive stylesheet', () => {
    expect(css).toContain('@import "@oods/tokens/css"');
    expect(css).toMatch(/var\(--cmp-/);
    expect(css).toMatch(/@media \(forced-colors: active\)[\s\S]*forced-color-adjust: none/);
  });
});
