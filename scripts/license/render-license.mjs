#!/usr/bin/env node
/**
 * Render the license holder from ONE source into every place the holder appears.
 *
 *   node scripts/license/render-license.mjs          # write
 *   node scripts/license/render-license.mjs --check  # exit 1 if any rendered file differs
 *
 * Inputs: configs/license/holder.json (the only place the holder string is authored) and
 * configs/license/PolyForm-Noncommercial-1.0.0.txt, the SPDX license-list-data text verbatim,
 * whose sha256 must equal configs/license/polyform-noncommercial-1.0.0.sha256.
 * Outputs: the root LICENSE and the five package LICENSE files (the canonical text with its
 * Required Notice line rendered for the holder), and the holder spans between the
 * license-holder markers in README.md, COMMERCIAL.md and CONTRIBUTING.md.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const HOLDER_PATH = 'configs/license/holder.json';
export const CANONICAL_PATH = 'configs/license/PolyForm-Noncommercial-1.0.0.txt';
export const CANONICAL_SHA256_PATH = 'configs/license/polyform-noncommercial-1.0.0.sha256';
export const CANONICAL_SOURCE = 'https://raw.githubusercontent.com/spdx/license-list-data/main/text/PolyForm-Noncommercial-1.0.0.txt';
export const SPDX_ID = 'PolyForm-Noncommercial-1.0.0';
export const PLACEHOLDER_NOTICE = '> Required Notice: Copyright Yoyodyne, Inc. (http://example.com)';
export const LICENSE_FILES = ['LICENSE', 'packages/tokens/LICENSE', 'packages/tw-variants/LICENSE', 'packages/a11y-tools/LICENSE', 'packages/viz-core/LICENSE', 'packages/viz-render/LICENSE'];
export const MARKER_START = '<!-- license-holder:start -->';
export const MARKER_END = '<!-- license-holder:end -->';

const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const sha256 = (text) => createHash('sha256').update(text).digest('hex');

export function loadHolder(root = ROOT) {
  const holder = JSON.parse(fs.readFileSync(path.join(root, HOLDER_PATH), 'utf8'));
  for (const key of ['holder', 'url', 'contact', 'year']) if (holder[key] === undefined || holder[key] === '') throw new Error(`${HOLDER_PATH} is missing ${key}`);
  return holder;
}

export function loadCanonical(root = ROOT) {
  const text = fs.readFileSync(path.join(root, CANONICAL_PATH), 'utf8');
  const recorded = fs.readFileSync(path.join(root, CANONICAL_SHA256_PATH), 'utf8').trim().split(/\s+/)[0];
  const actual = sha256(text);
  if (actual !== recorded) throw new Error(`${CANONICAL_PATH} sha256 ${actual} differs from the recorded ${recorded}`);
  if (text.split(PLACEHOLDER_NOTICE).length !== 2) throw new Error(`${CANONICAL_PATH} must carry exactly one placeholder Required Notice line`);
  return { text, sha256: actual };
}

export const requiredNotice = (holder) => `Required Notice: Copyright (c) ${holder.year} ${holder.holder} (${holder.url})`;

/** The license text with the holder's Required Notice in place of the placeholder; nothing else changes. */
export function renderLicense(holder, canonical) {
  return canonical.text.replace(PLACEHOLDER_NOTICE, `> ${requiredNotice(holder)}`);
}

/** The holder spans rendered between the markers of the two prose carriers. */
export function holderSpans(holder) {
  return {
    'README.md': `Copyright (c) ${holder.year} ${holder.holder} (${holder.url}). OODS Forge is licensed under the PolyForm Noncommercial License 1.0.0 (SPDX \`${SPDX_ID}\`), the text in [LICENSE](LICENSE). Commercial licensing: [COMMERCIAL.md](COMMERCIAL.md) or ${holder.contact}.`,
    'COMMERCIAL.md': `Licensor: ${holder.holder} (${holder.url}). Contact: ${holder.contact}.`,
    'CONTRIBUTING.md': `By submitting a contribution (code, documentation, tokens, tests or any other material) to OODS Forge, you grant ${holder.holder} a perpetual, irrevocable, worldwide, royalty-free, sublicensable license to use, reproduce, modify, distribute and sublicense that contribution under any terms, including commercial licenses, and you confirm that you have the right to grant it.`,
  };
}

function renderSpan(document, span, file) {
  const start = document.indexOf(MARKER_START), end = document.indexOf(MARKER_END);
  if (start < 0 || end < 0 || end < start || document.indexOf(MARKER_START, start + 1) >= 0) throw new Error(`${file} must carry exactly one license-holder marker pair`);
  return `${document.slice(0, start + MARKER_START.length)}\n${span}\n${document.slice(end)}`;
}

/** Every rendered output as { relativePath: contents }. */
export function renderAll(root = ROOT) {
  const holder = loadHolder(root);
  const canonical = loadCanonical(root);
  const license = renderLicense(holder, canonical);
  const outputs = Object.fromEntries(LICENSE_FILES.map(file => [file, license]));
  for (const [file, span] of Object.entries(holderSpans(holder))) outputs[file] = renderSpan(fs.readFileSync(path.join(root, file), 'utf8'), span, file);
  return { holder, canonical, outputs };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const { holder, canonical, outputs } = renderAll();
  const stale = Object.entries(outputs).filter(([file, contents]) => !fs.existsSync(path.join(ROOT, file)) || read(file) !== contents).map(([file]) => file);
  if (check) {
    if (stale.length) { console.error(`license render is stale: ${stale.join(', ')} (run node scripts/license/render-license.mjs)`); process.exitCode = 1; }
    else console.log(`license render is fresh: ${Object.keys(outputs).length} files carry ${holder.holder} over ${SPDX_ID} (canonical sha256 ${canonical.sha256.slice(0, 12)}…)`);
  } else {
    for (const [file, contents] of Object.entries(outputs)) fs.writeFileSync(path.join(ROOT, file), contents);
    console.log(`rendered ${Object.keys(outputs).length} files for ${holder.holder}; ${stale.length} changed`);
  }
}
