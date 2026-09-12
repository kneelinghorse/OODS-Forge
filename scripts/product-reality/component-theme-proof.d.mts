import type { Page, chromium } from 'playwright';

/** The caller mounts an actual public chart; this harness observes its paints. */
export interface VizThemeCase {
  id: string;
  brand: 'A' | 'B';
  theme?: 'light' | 'dark' | 'hc';
  svgCount: number;
  selector?: string;
  expectedSvg?: string;
  accessibleName?: string;
  mount(page: Page): Promise<void>;
}

export interface VizThemeReport {
  mission: string;
  status: 'passed' | 'failed';
  browser: { name: 'chromium'; version: string };
  forcedColors: 'active' | 'by-theme';
  selected: number;
  skipped: 0;
  failed: number;
  failures: string[];
  cells: Array<Record<string, unknown>>;
}

export function runVizThemeProof(options: {
  cases: VizThemeCase[];
  output: string;
  chromium: typeof chromium;
  mission?: string;
}): Promise<VizThemeReport>;

export const runVizForcedColourProof: typeof runVizThemeProof;
