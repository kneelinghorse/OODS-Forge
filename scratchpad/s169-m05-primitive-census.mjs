// s169 m05 — which --brandX-* primitives are LIVE (referenced anywhere) vs DEAD?
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
const REPO = '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge';
const css = readFileSync(`${REPO}/apps/explorer/src/styles/brand.css`, 'utf8');
const declared = [...css.matchAll(/^\s*(--brand[AB]-[A-Za-z0-9-]+)\s*:/gm)].map((m) => m[1]);
console.log('declared primitives:', declared.length);

// Every tracked file EXCEPT brand.css itself is a potential consumer.
const tracked = execSync('git ls-files', { cwd: REPO, encoding: 'utf8' }).trim().split('\n');
const haystack = tracked
  .filter((f) => f !== 'apps/explorer/src/styles/brand.css')
  .filter((f) => /\.(ts|tsx|js|jsx|css|scss|json|md|mdx|html|cjs|mjs)$/.test(f))
  .map((f) => { try { return [f, readFileSync(`${REPO}/${f}`, 'utf8')]; } catch { return null; } })
  .filter(Boolean);

// brand.css's OWN internal references count as live too (the focus block aliases some).
const live = [], dead = [];
for (const name of declared) {
  const externals = haystack.filter(([, body]) => body.includes(name)).map(([f]) => f);
  const selfRefs = (css.match(new RegExp(`var\\(${name}[,)]`, 'g')) ?? []).length;
  if (externals.length > 0 || selfRefs > 0) live.push({ name, externals, selfRefs });
  else dead.push(name);
}
console.log('\nLIVE:', live.length);
for (const l of live) console.log(`  ${l.name}  selfRefs=${l.selfRefs}  external=${l.externals.join(', ') || '(none)'}`);
console.log('\nDEAD:', dead.length);
console.log(dead.join('\n'));
