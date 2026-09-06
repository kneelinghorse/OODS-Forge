/* @vitest-environment jsdom */

import * as React from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Badge, ColorizedBadge } from '../src/index.js';

afterEach(cleanup);

describe('Sprint 185 explicit Badge tone precedence', () => {
  for (const [name, Component] of [['Badge', Badge], ['ColorizedBadge', ColorizedBadge]] as const) {
    it.each(['subtle', 'solid'] as const)(`${name} uses the explicit warning palette over active status for %s emphasis`, emphasis => {
      const { container, rerender } = render(<Component status="active" tone="warning" emphasis={emphasis}>Review</Component>);
      const badge = container.querySelector<HTMLElement>(`[data-oods-component="${name}"]`)!;
      expect(badge.dataset).toMatchObject({ status: 'active', tone: 'warning', emphasis });
      expect(badge.textContent).toContain('Review');
      for (const [property, role] of [
        ['--cmp-badge-background', 'surface'],
        ['--cmp-badge-border', 'border'],
        ['--cmp-badge-text', 'text'],
        ['--statusable-badge-background', 'surface'],
        ['--statusable-badge-border', 'border'],
        ['--statusable-badge-foreground', 'text'],
        ['--statusable-badge-icon-color', 'text'],
      ]) {
        expect(badge.style.getPropertyValue(property)).toBe(`var(--sys-status-warning-${role})`);
      }

      rerender(<Component status="active" emphasis={emphasis}>Review</Component>);
      expect(badge.dataset.tone).toBe('success');
      expect(badge.style.getPropertyValue('--cmp-badge-background')).toBe('var(--sys-status-success-surface)');
      expect(badge.style.getPropertyValue('--cmp-badge-border')).toBe('var(--sys-status-success-border)');
      expect(badge.style.getPropertyValue('--cmp-badge-text')).toBe('var(--sys-status-success-text)');
    });
  }
});
