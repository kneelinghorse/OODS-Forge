#!/usr/bin/env node
// s169-m02 grounding: repo-wide bridged-slot declaration census with selector
// specificity. Design premise for the m02 tie-invariant check:
//   for every bridged slot, the ONLY declarations at brand-block specificity
//   (0,2,0) or higher are the generated bridge's own [data-brand='X'][data-theme='Y']
//   blocks in packages/tokens/dist/css/tokens.css.
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const REPO = '/Users/systemsystems/portfolio/Design-Tools/OODS-Forge';
const { SEMANTIC_BRIDGE } = await import(path.join(REPO, 'packages/tokens/scripts/brand-bridge.mjs'));
const BRIDGED = new Set(SEMANTIC_BRIDGE.map((e) => e.slot));

// Sources: every tracked .css + the generated CSS artifact + the CSS template
// literal embedded in packages/mcp-server/src/render/document.ts.
const tracked = execSync('git ls-files "*.css"', { cwd: REPO, encoding: 'utf8' }).trim().split('\n');
const sources = tracked.map((f) => [f, readFileSync(path.join(REPO, f), 'utf8')]);
sources.push(['packages/tokens/dist/css/tokens.css (GENERATED)', readFileSync(path.join(REPO, 'packages/tokens/dist/css/tokens.css'), 'utf8')]);
// document.ts: extract template-literal CSS chunks (backtick blocks containing --theme-)
const docTs = readFileSync(path.join(REPO, 'packages/mcp-server/src/render/document.ts'), 'utf8');
for (const m of docTs.matchAll(/`([^`]*--theme-[^`]*)`/g)) {
  sources.push(['packages/mcp-server/src/render/document.ts (embedded)', m[1]]);
}

// Brace-aware parse: walks nested at-rules, records (selector, atContext, decls).
function parseDeclarations(css) {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  const stack = []; // at-rule context
  let i = 0, buf = '';
  while (i < stripped.length) {
    const ch = stripped[i];
    if (ch === '{') {
      // discard semicolon-terminated at-statements (@import/@charset) that precede
      // this block header — without this, any block after an @import is silently
      // misread as an at-rule and its declarations are dropped.
      const header = buf.slice(buf.lastIndexOf(';') + 1).trim();
      buf = '';
      if (header.startsWith('@')) {
        stack.push({ at: header, sel: null });
      } else {
        stack.push({ at: null, sel: header });
      }
    } else if (ch === '}') {
      const top = stack.pop();
      if (top && top.sel !== null && buf.trim()) {
        const at = stack.filter((s) => s.at).map((s) => s.at).join(' ');
        for (const line of buf.split(';')) {
          const idx = line.indexOf(':');
          if (idx < 0) continue;
          const prop = line.slice(0, idx).trim();
          if (prop.startsWith('--theme-') && BRIDGED.has(prop)) {
            out.push({ selector: top.sel, at, prop });
          }
        }
      }
      buf = '';
    } else {
      buf += ch;
    }
    i += 1;
  }
  return out;
}

// Specificity (a=IDs, b=classes/attrs/pseudo-classes, c=elements); :where() = 0.
function specificity(sel) {
  let s = sel.replace(/:where\([^)]*\)/g, '');
  const a = (s.match(/#[\w-]+/g) || []).length;
  const b = (s.match(/\.[\w-]+|\[[^\]]*\]|:(?!:)[\w-]+(\([^)]*\))?/g) || []).length;
  const c = (s.match(/(^|[\s>+~(,])[a-zA-Z][\w-]*/g) || []).length;
  return [a, b, c];
}
const geq220 = ([a, b]) => a > 0 || b >= 2;

const rows = [];
for (const [file, css] of sources) {
  for (const d of parseDeclarations(css)) {
    for (const one of d.selector.split(',').map((x) => x.trim())) {
      rows.push({ file, sel: one, at: d.at, prop: d.prop, spec: specificity(one) });
    }
  }
}

// Census by file+selector shape
const seen = new Map();
for (const r of rows) {
  const key = `${r.file} :: ${r.sel}${r.at ? ` [in ${r.at}]` : ''} :: (${r.spec.join(',')})`;
  seen.set(key, (seen.get(key) || 0) + 1);
}
console.log('REPO-WIDE BRIDGED-SLOT DECLARATION CENSUS (file :: selector :: specificity -> count):');
for (const [k, v] of [...seen].sort()) console.log(`  ${k} -> ${v}`);

const offenders = rows.filter(
  (r) => geq220(r.spec) &&
    !(r.file.includes('packages/tokens/dist/css/tokens.css') &&
      /^\[data-brand='[AB]'\]\[data-theme='(base|light|dark|hc)'\]$/.test(r.sel)),
);
console.log(`\ndeclarations at >= (0,2,0) outside the generated bridge: ${offenders.length}`);
for (const o of offenders.slice(0, 20)) console.log(`  OFFENDER ${o.file} :: ${o.sel} :: ${o.prop}`);
process.exit(offenders.length ? 1 : 0);
