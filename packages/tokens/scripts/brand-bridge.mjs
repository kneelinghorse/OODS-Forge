/**
 * s167 m02 — the brand → semantic bridge (memo SS3 D8).
 *
 * WHY A BRIDGE IS THE DELIVERABLE
 * ------------------------------
 * Brand token values on their own are INERT. `src/tokens/themes/theme0/*.json` declares
 * the flat consumer namespace — `theme.surface.canvas`, `theme.text.primary`, … — and
 * resolves every one of them to the brand-agnostic reference palette
 * (`{ref.color.neutral.50}`, `{ref.color.primary.600}`, …). Measured on the shipped CSS:
 * 377 semantic declarations (`--theme-*`, `--sys-*`, `--cmp-*`) and ZERO of them
 * reference any `--oods-color-brand-*` variable.
 *
 * So emitting `[data-brand]` blocks over the brand namespace alone would change ZERO
 * pixels — the brand vars would go on resolving only to each other. What makes
 * `data-brand` mean anything is re-assigning the SHARED consumer slots from the scope's
 * brand values, which is what this table does.
 *
 * VALUES ARE EMITTED AS LITERALS, NOT `var()` REFERENCES
 * -----------------------------------------------------
 * `--theme-surface-canvas: var(--oods-color-brand-a-surface-canvas)` would also work in
 * a browser — a `var()` resolves at computed-value time and would follow the scoped
 * override — and it would collapse the matrix to one block per brand. It is deliberately
 * NOT what we do, for two reasons: the per-cell literal is what lets the artifact-level
 * test verify each cell WITHOUT a CSS engine (it loads only tokens.css), and a matrix of
 * six identical `var()` texts makes "no cell carries another cell's value" unfalsifiable.
 *
 * THE SLOT LIST IS SOURCED FROM `apps/explorer/src/styles/brand.css`
 * -----------------------------------------------------------------
 * That file is the hand-authored copy this bridge is meant to eventually replace, so its
 * slot names are the contract. It assigns 41 distinct `--theme-*` slots; 38 of them have
 * a brand token that corresponds by name and are mapped below. The other three are
 * recorded in UNBRIDGED_SLOTS with the reason.
 */

/**
 * The authored mapping: consumer slot -> the brand token that supplies it, written
 * relative to the brand (full path is `color.brand.<BRAND>.<tokenPath>`).
 *
 * Written out in full rather than derived by string transform. The correspondence
 * happens to be regular, but it is a design decision per slot — deriving it would hide
 * which slots are deliberately mapped and make the two gaps below invisible.
 */
export const SEMANTIC_BRIDGE = Object.freeze([
  // surfaces
  { slot: '--theme-surface-canvas', tokenPath: 'surface.canvas' },
  { slot: '--theme-surface-raised', tokenPath: 'surface.raised' },
  { slot: '--theme-surface-subtle', tokenPath: 'surface.subtle' },
  { slot: '--theme-surface-disabled', tokenPath: 'surface.disabled' },
  { slot: '--theme-surface-backdrop', tokenPath: 'surface.backdrop' },
  { slot: '--theme-surface-inverse', tokenPath: 'surface.inverse' },
  { slot: '--theme-surface-interactive-primary-default', tokenPath: 'surface.interactive.primary.default' },
  { slot: '--theme-surface-interactive-primary-hover', tokenPath: 'surface.interactive.primary.hover' },
  { slot: '--theme-surface-interactive-primary-pressed', tokenPath: 'surface.interactive.primary.pressed' },

  // borders
  { slot: '--theme-border-subtle', tokenPath: 'border.subtle' },
  { slot: '--theme-border-strong', tokenPath: 'border.strong' },

  // text
  { slot: '--theme-text-primary', tokenPath: 'text.primary' },
  { slot: '--theme-text-secondary', tokenPath: 'text.secondary' },
  { slot: '--theme-text-muted', tokenPath: 'text.muted' },
  { slot: '--theme-text-inverse', tokenPath: 'text.inverse' },
  { slot: '--theme-text-accent', tokenPath: 'text.accent' },
  { slot: '--theme-text-on-interactive', tokenPath: 'text.onInteractive' },
  { slot: '--theme-text-disabled', tokenPath: 'text.disabled' },

  // status — info
  { slot: '--theme-status-info-surface', tokenPath: 'status.info.surface' },
  { slot: '--theme-status-info-border', tokenPath: 'status.info.border' },
  { slot: '--theme-status-info-text', tokenPath: 'status.info.text' },
  { slot: '--theme-status-info-icon', tokenPath: 'status.info.icon' },

  // status — success
  { slot: '--theme-status-success-surface', tokenPath: 'status.success.surface' },
  { slot: '--theme-status-success-border', tokenPath: 'status.success.border' },
  { slot: '--theme-status-success-text', tokenPath: 'status.success.text' },
  { slot: '--theme-status-success-icon', tokenPath: 'status.success.icon' },

  // status — warning
  { slot: '--theme-status-warning-surface', tokenPath: 'status.warning.surface' },
  { slot: '--theme-status-warning-border', tokenPath: 'status.warning.border' },
  { slot: '--theme-status-warning-text', tokenPath: 'status.warning.text' },
  { slot: '--theme-status-warning-icon', tokenPath: 'status.warning.icon' },

  // status — critical
  { slot: '--theme-status-critical-surface', tokenPath: 'status.critical.surface' },
  { slot: '--theme-status-critical-border', tokenPath: 'status.critical.border' },
  { slot: '--theme-status-critical-text', tokenPath: 'status.critical.text' },
  { slot: '--theme-status-critical-icon', tokenPath: 'status.critical.icon' },

  // status — neutral
  { slot: '--theme-status-neutral-surface', tokenPath: 'status.neutral.surface' },
  { slot: '--theme-status-neutral-border', tokenPath: 'status.neutral.border' },
  { slot: '--theme-status-neutral-text', tokenPath: 'status.neutral.text' },
  { slot: '--theme-status-neutral-icon', tokenPath: 'status.neutral.icon' },
]);

/**
 * Slots `brand.css` assigns that this bridge deliberately does NOT emit, and why.
 *
 * All three are focus-ring slots with NO brand token behind them. `theme.focus.*` exists
 * in `src/tokens/themes/theme0/focus.json` but resolves to the neutral reference palette,
 * and `brand.css` derives its per-brand focus values by hand — two of them from brand
 * primitives, but `--theme-focus-ring-outer` from a `color-mix()` whose ratio is itself a
 * hand-authored design decision (55% in the light block, 60% in dark, a flat `Highlight`
 * in hc). Generating those would mean the build INVENTING design values that exist in no
 * token file, which is the fourth-writer problem this sprint exists to shrink, not grow.
 *
 * Consequence, stated plainly rather than hidden: under a bridge block the three focus
 * slots keep their `:root` value from theme0, i.e. the neutral palette. Giving them a
 * real brand source needs a token, not a generator heuristic.
 *
 * ── s169 m02 CORRECTION: brand.css's LIGHT aliases NEVER TAKE EFFECT ──
 * The per-slot reasons below used to read as though brand.css supplied branded focus in
 * light and hard-coded it in dark. Measured in Chromium: brand.css's light blocks are
 * `:where(...)`-wrapped, so they are (0,0,0) and LOSE to `:root` (0,1,0). Light focus
 * resolves to the neutral ring, byte-identically for brands A and B, in every light
 * attribute state. Only dark is branded; hc is keyword-identical across brands. The light
 * aliases are written, parsed, and then beaten — real code that changes nothing.
 * `scripts/quality/brand-cascade-browser-proof.mjs` pins both halves.
 */
export const UNBRIDGED_SLOTS = Object.freeze([
  { slot: '--theme-focus-ring-outer', reason: 'no brand token; brand.css derives it via a hand-authored color-mix() ratio that varies per theme — but only its dark and hc blocks win; the light one is :where()-wrapped and loses to :root' },
  { slot: '--theme-focus-ring-inner', reason: 'no brand token; brand.css hardcodes a literal in dark and aliases surface.canvas in light, though the light alias loses to :root and the neutral ring is what paints' },
  { slot: '--theme-focus-text', reason: 'no brand token; brand.css hardcodes a literal in dark and HighlightText in hc, and aliases text.accent in light — the light alias loses to :root, so light focus text is the neutral accent' },
]);

/**
 * Brand tokens with no consumer slot on the other side of the bridge. Recorded for the
 * same reason as UNBRIDGED_SLOTS: an unmapped token is a fact worth stating, not a
 * silent omission. `accent.*` is a distinct ramp from `text.accent` and `brand.css`
 * never consumed it.
 */
export const UNBRIDGED_TOKENS = Object.freeze([
  'accent.background',
  'accent.border',
  'accent.text',
]);

/**
 * Render one cell's bridge block.
 *
 * @param {{brand: string, theme: string}} scope
 * @param {Map<string, string>} resolvedByPath  dotted token path -> resolved CSS value
 * @param {string[]} selectors                  the D9 selector list for this cell
 */
export function renderBridgeBlock(scope, resolvedByPath, selectors) {
  const lines = [];
  const missing = [];

  for (const { slot, tokenPath } of SEMANTIC_BRIDGE) {
    const fullPath = `color.brand.${scope.brand}.${tokenPath}`;
    const value = resolvedByPath.get(fullPath);
    if (value === undefined) {
      missing.push(fullPath);
      continue;
    }
    lines.push(`  ${slot}: ${value};`);
  }

  if (missing.length > 0) {
    // Fail loud. A silently short bridge block would leave those slots on the neutral
    // :root palette and look like a brand that simply chose neutral values.
    throw new Error(
      `brand bridge ${scope.brand}/${scope.theme}: ${missing.length} mapped token(s) did not resolve: ${missing.join(', ')}`,
    );
  }

  return `${selectors.join(',\n')} {\n${lines.join('\n')}\n}`;
}
