import recipes from './viz-recipes.v1.json';

export interface VizRecipeCapability {
  chartType: string;
  specEngine: 'vega-lite' | 'echarts';
  publicSvg: boolean;
  dashboardDrawn: true | 'excluded (#881)';
  themes: { light: boolean; dark: boolean; hc: boolean };
  brands: Array<'A' | 'B'>;
  a11yDescription: boolean;
  /** Offered codes; a resolved-operand count is a separate certification field. */
  accuracyRules: string[];
  certifyCoverage: 'certified' | 'uncertified';
  /** Which data-bearing certification path the census actually exercised. */
  certifyProfile: 'cartesian' | 'echarts-data';
  /** Preserve measured booleans per scope; certified coverage never implies conformance. */
  certifyScopes: Array<{
    theme: 'light' | 'dark';
    brand: 'A' | 'B';
    coverage: 'certified' | 'uncertified';
    conformant: boolean | null;
    pillars: { a11yEquivalence: string; determinism: string; contrast: string; accuracy: string };
    accuracySummary: { rulesEvaluated: number; failing: number };
  }>;
  /** Actual categorical canvas grades, including failures; never exempt/unchecked. */
  contrastMeasured: Array<'light' | 'dark'>;
  /** Every brand has a measured pass in this theme; exemptions are not passes. */
  contrastPassed: Array<'light' | 'dark'>;
  chartInApp: 'placed' | 'not-placed';
  notes: string[];
}

/** Measured by the public-tool census; the contract test rejects unmeasured changes. */
export const VIZ_RECIPES: readonly VizRecipeCapability[] = recipes as VizRecipeCapability[];
