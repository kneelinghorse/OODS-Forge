/** S197: only the primary differs by brand; neutral and accent roles are shared. */
export function focusIdentityFailures(computed) {
  const failures = [];
  for (const theme of ['base', 'dark', 'hc']) {
    for (const slot of ['--theme-focus-ring-outer', '--theme-focus-ring-inner', '--theme-focus-text']) {
      const a = computed[`A/${theme}`]?.[slot];
      const b = computed[`B/${theme}`]?.[slot];
      const shouldMatch = theme === 'hc' || slot !== '--theme-focus-ring-outer';
      if (typeof a !== 'string' || !a || typeof b !== 'string' || !b || (a === b) !== shouldMatch) {
        failures.push(`${theme} ${slot}: A paints ${a} and B paints ${b} — expected ${shouldMatch ? 'brand-invariant' : 'brand-distinct'} focus role`);
      }
    }
  }
  return failures;
}
