#!/usr/bin/env node

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve, relative, extname } from 'path';
import { promises as fs } from 'fs';
import { performance } from 'perf_hooks';

import StyleDictionary from 'style-dictionary';
import { register as registerSdTransforms, expandTypesMap } from '@tokens-studio/sd-transforms';
import ColorJs from 'colorjs.io';

import { auditAllScopes, resolveScopeFiles } from './collision-guard.mjs';
import { renderBridgeBlock } from './brand-bridge.mjs';
import { MOBILE_DEFERRED_TYPES, mobileDimensionClass } from './mobile-manifest.mjs';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = resolve(__dirname, '..');

// Ensure all relative paths inside Style Dictionary resolve from the tokens package root
process.chdir(packageRoot);

const STABLE_TIMESTAMP =
  process.env.OODS_PACKAGES_BUILD_STAMP ?? '1970-01-01T00:00:00.000Z';

const rawConfig = require('../style-dictionary.config.cjs');
// `oodsScoping` is our own scoping metadata, not Style Dictionary config — strip it.
const { oodsScoping, platforms: allPlatforms, ...sharedConfig } = rawConfig;

const args = process.argv.slice(2);
const checkMode = args.includes('--check');
const verbose = args.includes('--verbose');

const prefix = sharedConfig.prefix ?? 'tokens';

// memo SS3 D7 — these four have no selector concept, so they emit the DEFAULT_SCOPE only.
const NON_CSS_PLATFORMS = ['ts', 'tailwind', 'ios-swift', 'compose'];
const CSS_DESTINATION = resolve(packageRoot, 'dist/css/tokens.css');

registerSdTransforms(StyleDictionary);
registerCustomFormats(prefix);
registerCustomTransforms(prefix);
registerMobileTransformGroups();

/**
 * One Style Dictionary instance per brand x theme scope (memo SS3 D1 — a platform
 * entry cannot carry its own `source` in SD 4.4.0, so scoping happens per dictionary).
 *
 * `source` is the file list `resolveScopeFiles()` produced, NOT the raw glob patterns.
 * That is what makes the collision guard trustworthy: it audits the identical list.
 */
async function dictionaryForScope(scope, platforms) {
  const sd = new StyleDictionary({
    ...sharedConfig,
    expand: {
      ...(sharedConfig.expand || {}),
      typesMap: expandTypesMap,
    },
    log: verbose
      ? { ...(sharedConfig.log || {}), verbosity: 'verbose' }
      : sharedConfig.log,
    source: resolveScopeFiles(scope, packageRoot),
    platforms,
  });
  await sd.hasInitialized;
  return sd;
}

const cssPlatformWith = (file) => ({ css: { ...allPlatforms.css, files: [file] } });

/**
 * s171 m03 — the two mobile platforms get (a) the deferral filter (easing quads and
 * font stacks are DEFERRED from mobile output, not silently dropped — the injected
 * file header discloses the exact counts) and (b) that disclosure header. Injected
 * here at runtime so style-dictionary.config.cjs stays untouched beyond the two
 * transformGroup keys (the m02 fence).
 */
const MOBILE_PLATFORM_NAMES = ['ios-swift', 'compose'];
const isMobileDeferred = (token) =>
  Object.keys(MOBILE_DEFERRED_TYPES).includes(token.$type ?? token.type);

function nonCssPlatformConfigs() {
  return Object.fromEntries(
    NON_CSS_PLATFORMS.map((name) => {
      const platform = allPlatforms[name];
      if (!MOBILE_PLATFORM_NAMES.includes(name)) {
        return [name, platform];
      }
      return [
        name,
        {
          ...platform,
          files: (platform.files ?? []).map((file) => ({
            ...file,
            filter: (token) => !isMobileDeferred(token),
            options: { ...(file.options || {}), fileHeader: 'oods/mobile-disclosure' },
          })),
        },
      ];
    }),
  );
}

const log = {
  info: (...messages) => {
    if (!checkMode || verbose) {
      console.log(...messages);
    }
  },
  success: (...messages) => console.log(...messages),
  warn: (...messages) => console.warn(...messages),
  error: (...messages) => console.error(...messages),
};

async function run() {
  try {
    if (!runCollisionGuard()) {
      process.exitCode = 1;
      return;
    }

    if (checkMode) {
      await runCheck();
    } else {
      await runBuild();
    }
  } catch (error) {
    log.error('❌ tokens pipeline failed');
    log.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exitCode = 1;
  }
}

/**
 * The collision guard runs BEFORE any dictionary is loaded, because Style Dictionary
 * deep-merges colliding paths at load time and nothing downstream can see them again.
 */
function runCollisionGuard() {
  const { violations } = auditAllScopes(packageRoot);
  if (violations.length === 0) {
    log.info(`✔︎ collision guard: no non-exempt collisions across ${oodsScoping.BRAND_SCOPES.length} scopes`);
    return true;
  }

  log.error(`❌ collision guard: ${violations.length} colliding token path(s) — refusing to build`);
  for (const { tokenPath, declarations } of violations) {
    log.error(`   ${tokenPath}`);
    for (const { file, value } of declarations) {
      log.error(`       ${file} = ${JSON.stringify(value)}`);
    }
  }
  log.error('   Run `pnpm run tokens:collision-guard` for the full report.');
  return false;
}

/**
 * Assemble dist/css/tokens.css from the six scope runs.
 *
 * Block 1 is the DEFAULT_SCOPE's FULL dictionary under `:root` (memo SS3 D2/D3 — one
 * file, because document.ts:20 inlines exactly one path). Blocks 2..7 carry the
 * `color.brand.<X>.*` literals and declared categorical theme overrides for their cell,
 * under the D9 two-attribute selectors.
 *
 * Brand literals and declared categorical overrides are re-emitted per scope. The `brand.<X>.*` aliases are
 * emitted once at `:root` as `var(--oods-color-brand-...)` references, and a `var()`
 * resolves at computed-value time on the element, so they pick up the scoped override
 * through the cascade without being restated.
 */
async function renderCssBundle() {
  const rootSd = await dictionaryForScope(
    oodsScoping.DEFAULT_SCOPE,
    cssPlatformWith({
      destination: 'tokens.css',
      format: 'css/variables',
      options: { selector: ':root', outputReferences: true },
    }),
  );
  const rootOutput = (await rootSd.formatAllPlatforms({ cache: false })).css[0].output;

  const blocks = [rootOutput.trim()];
  for (const scope of oodsScoping.BRAND_SCOPES) {
    const selectors = oodsScoping.selectorsForScope(scope);
    const scopeSd = await dictionaryForScope(
      scope,
      cssPlatformWith({
        destination: 'tokens.css',
        format: 'css/variables',
        filter: (token) => oodsScoping.isBrandToken(token, scope.brand)
          || (scope.theme !== 'base'
            && /^viz\.scale\.categorical\.0[1-6]$/.test(token.path.join('.'))
            && token.filePath === `src/tokens/brands/${scope.brand}/${scope.theme}.json`),
        options: {
          selector: selectors.join(',\n'),
          outputReferences: false,
          showFileHeader: false,
        },
      }),
    );
    const output = (await scopeSd.formatAllPlatforms({ cache: false })).css[0].output;
    blocks.push(`/**\n * brand ${scope.brand} · theme ${scope.theme} — brand namespace\n */\n${output.trim()}`);

    // memo SS3 D8 — the bridge. Brand values alone are inert: every --theme-* slot
    // resolves to the neutral reference palette at :root, and no semantic declaration
    // in the shipped CSS references a brand var. This block is what makes data-brand
    // change pixels, by re-assigning the shared consumer slots from this cell's values.
    const dictionary = await scopeSd.getPlatformTokens('css', { cache: false });
    const resolvedByPath = new Map(
      dictionary.allTokens.map((token) => [token.path.join('.'), getTokenValue(token)]),
    );
    blocks.push(
      `/**\n * brand ${scope.brand} · theme ${scope.theme} — semantic bridge\n */\n${renderBridgeBlock(scope, resolvedByPath, selectors)}`,
    );
  }

  return `${blocks.join('\n\n')}\n`;
}

async function runBuild() {
  const start = performance.now();
  log.info('Building design tokens with Style Dictionary…');

  const nonCssSd = await dictionaryForScope(oodsScoping.DEFAULT_SCOPE, nonCssPlatformConfigs());
  await nonCssSd.cleanAllPlatforms({ cache: false });
  await nonCssSd.buildAllPlatforms({ cache: false });

  const css = await renderCssBundle();
  await fs.mkdir(dirname(CSS_DESTINATION), { recursive: true });
  await fs.writeFile(CSS_DESTINATION, css, 'utf8');

  const issues = await collectValidationIssues();
  reportValidationIssues(issues);

  if (issues.length === 0) {
    const duration = ((performance.now() - start) / 1000).toFixed(2);
    log.success(`✔︎ tokens built successfully in ${duration}s`);
    log.success(`   css:      dist/css/tokens.css (${oodsScoping.BRAND_SCOPES.length} brand × theme scopes)`);
    log.success('   types:    dist/ts/tokens.ts');
    log.success('   tailwind: dist/tailwind/tokens.json');
    log.success('   ios:      dist/ios-swift/OodsTokens.swift');
    log.success('   compose:  dist/compose/OodsTokens.kt');
  } else {
    process.exitCode = 1;
  }
}

async function runCheck() {
  const nonCssSd = await dictionaryForScope(oodsScoping.DEFAULT_SCOPE, nonCssPlatformConfigs());
  const outputs = await nonCssSd.formatAllPlatforms({ cache: false });
  const diffs = await compareWithExistingOutputs(outputs);
  diffs.push(...(await compareCssBundle()));
  const issues = await collectValidationIssues();

  if (diffs.length > 0) {
    log.warn('⚠︎ Generated output would differ from disk:');
    diffs.forEach((diff) => {
      const { file, state } = diff;
      if (state === 'missing') {
        log.warn(`   • ${file} (missing – run yarn build:tokens)`);
      } else if (state === 'stale') {
        log.warn(`   • ${file} (stale – run yarn build:tokens)`);
      }
    });
  }

  reportValidationIssues(issues);

  if (issues.length === 0 && diffs.length === 0) {
    log.success('✔︎ token outputs are up-to-date and pass validation');
  } else {
    process.exitCode = 1;
  }
}

/** The CSS bundle is assembled by hand, so --check has to compare it by hand too. */
async function compareCssBundle() {
  const expected = await renderCssBundle();
  const relativePath = relative(process.cwd(), CSS_DESTINATION);
  try {
    const existing = await fs.readFile(CSS_DESTINATION, 'utf8');
    return existing === expected ? [] : [{ file: relativePath, state: 'stale' }];
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      return [{ file: relativePath, state: 'missing' }];
    }
    throw error;
  }
}

function reportValidationIssues(issues) {
  if (issues.length > 0) {
    log.warn('⚠︎ token validation issues detected:');
    issues.forEach((message) => log.warn(`   • ${message}`));
  }
}

async function compareWithExistingOutputs(outputsByPlatform) {
  const diffs = [];

  for (const platformOutputs of Object.values(outputsByPlatform)) {
    for (const { destination, output } of platformOutputs) {
      if (!destination || typeof output !== 'string') {
        continue;
      }

      const absolute = resolve(packageRoot, destination);
      const relativePath = relative(process.cwd(), absolute);

      try {
        const existing = await fs.readFile(absolute, 'utf8');
        const normalizedExisting = normalizeContent(absolute, existing);
        const normalizedExpected = normalizeContent(absolute, output);
        if (normalizedExisting !== normalizedExpected) {
          diffs.push({ file: relativePath, state: 'stale' });
        }
      } catch (error) {
        if (error && typeof error === 'object' && error.code === 'ENOENT') {
          diffs.push({ file: relativePath, state: 'missing' });
        } else {
          throw error;
        }
      }
    }
  }

  return diffs;
}

/**
 * Post-load sanity checks on the DEFAULT_SCOPE dictionary. NOTE: this is NOT the
 * collision guard — `dictionary.allTokens` is the list Style Dictionary produces
 * AFTER deep-merging the sources, so a source collision has already been resolved
 * by the time this runs and can never appear here. Source collisions are caught
 * pre-load by `runCollisionGuard()`. What this still earns its keep for is
 * undefined resolved values (an unresolvable reference).
 */
async function collectValidationIssues() {
  const issues = [];
  const cssSd = await dictionaryForScope(
    oodsScoping.DEFAULT_SCOPE,
    cssPlatformWith({
      destination: 'tokens.css',
      format: 'css/variables',
      options: { selector: ':root', outputReferences: true },
    }),
  );
  const dictionary = await cssSd.getPlatformTokens('css', { cache: false });
  const seenNames = new Map();
  const seenVariables = new Map();

  for (const token of dictionary.allTokens) {
    const path = token.path.join('.');
    const cssVariable = token.name.startsWith(`${prefix}-`)
      ? `--${token.name}`
      : `--${prefix}-${token.name}`;
    const resolvedValue = getTokenValue(token);

    if (seenNames.has(token.name)) {
      const existing = seenNames.get(token.name);
      issues.push(
        `Duplicate token name "${token.name}" (${path}) collides with ${existing.path.join('.')}`,
      );
    } else {
      seenNames.set(token.name, token);
    }

    if (seenVariables.has(cssVariable)) {
      const existing = seenVariables.get(cssVariable);
      issues.push(
        `Duplicate CSS variable "${cssVariable}" (${path}) collides with ${existing.path.join('.')}`,
      );
    } else {
      seenVariables.set(cssVariable, token);
    }

    if (resolvedValue === undefined || resolvedValue === null) {
      issues.push(`Token "${path}" produced an undefined value`);
    }
  }

  return issues;
}

function registerCustomFormats(defaultPrefix) {
  if (!StyleDictionary.hooks?.formats?.['typescript/tokens']) {
    StyleDictionary.registerFormat({
      name: 'typescript/tokens',
      format: ({ dictionary, options }) => {
        const bannerEnabled = options?.banner !== false;
        const tsPrefix = options?.prefix || defaultPrefix;
        const banner = `/**\n * -------------------------------------------------------------------\n * ⚠️  AUTO-GENERATED FILE — DO NOT EDIT BY HAND\n * -------------------------------------------------------------------\n * Generated by Style Dictionary. Update tokens via src/tokens/*\n * -------------------------------------------------------------------\n */`;

        const nestedTokens = JSON.stringify(dictionary.tokens, null, 2);
        const flatTokens = buildFlatTokenMap(dictionary.allTokens, tsPrefix);

        const lines = [];
        if (bannerEnabled) {
          lines.push(banner);
          lines.push('');
        }

        lines.push('export const tokens = ' + nestedTokens + ' as const;');
        lines.push('');
        lines.push('export type Tokens = typeof tokens;');
        lines.push('');
        lines.push('export const flatTokens = ' + JSON.stringify(flatTokens, null, 2) + ' as const;');
        lines.push('');
        lines.push('export type FlatTokenName = keyof typeof flatTokens;');
        lines.push('export type FlatToken = typeof flatTokens[FlatTokenName];');
        lines.push('');
        lines.push('export const tokenNames = Object.keys(flatTokens) as FlatTokenName[];');
        lines.push('');
        lines.push('export function token<TName extends FlatTokenName>(pathOrName: TName) {');
        lines.push('  return flatTokens[pathOrName];');
        lines.push('}');
        lines.push('');
        lines.push('export default tokens;');

        return lines.join('\n');
      },
    });
  }

  if (!StyleDictionary.hooks?.formats?.['tailwind/tokens']) {
    StyleDictionary.registerFormat({
      name: 'tailwind/tokens',
      format: ({ dictionary, options, platform }) => {
        const twPrefix = options?.prefix || defaultPrefix;
        const indent = options?.indent ?? 2;
        const meta = {
          generatedAt: STABLE_TIMESTAMP,
          tool: 'style-dictionary',
          version: StyleDictionary.VERSION,
          platform: platform?.name ?? 'tailwind',
        };

        const payload = {
          $schema: 'https://open-oods.dev/schemas/tailwind-tokens.v1.json',
          meta,
          prefix: twPrefix,
          tokens: dictionary.tokens,
          flat: buildFlatTokenMap(dictionary.allTokens, twPrefix),
          cssVariables: buildCssVariableMap(dictionary.allTokens, twPrefix),
        };

        return JSON.stringify(payload, null, indent) + '\n';
      },
    });
  }
}

function buildFlatTokenMap(tokens, prefixForVariable) {
  const entries = tokens.map((token) => {
    const key = token.name;
    const cssVariable = `--${prefixForVariable}-${token.name}`;
    const resolvedValue = getTokenValue(token);
    return [
      key,
      {
        name: token.name,
        value: resolvedValue,
        type: token.type,
        path: token.path,
        cssVariable,
        originalValue: token.original?.value ?? token.original?.$value ?? null,
        description: token.description ?? token.original?.description ?? '',
      },
    ];
  });

  entries.sort(([a], [b]) => a.localeCompare(b));
  return Object.fromEntries(entries);
}

function buildCssVariableMap(tokens, prefixForVariable) {
  const entries = tokens.map((token) => {
    const name = `--${prefixForVariable}-${token.name}`;
    return [name, getTokenValue(token)];
  });

  entries.sort(([a], [b]) => a.localeCompare(b));
  return Object.fromEntries(entries);
}

function registerCustomTransforms(prefixForCss) {
  if (!StyleDictionary.hooks?.transforms?.['name/css-prefix']) {
    StyleDictionary.registerTransform({
      name: 'name/css-prefix',
      type: 'name',
      transform: (token) => {
        const preserveNamespaces = new Set(['ref', 'theme', 'sys', 'cmp']);
        const kebabName = token.name;
        const namespace = Array.isArray(token.path) ? token.path[0] : undefined;

        if (typeof namespace === 'string' && preserveNamespaces.has(namespace)) {
          return kebabName;
        }

        const inferredNamespace = typeof kebabName === 'string' ? kebabName.split('-')[0] : undefined;
        if (typeof inferredNamespace === 'string' && preserveNamespaces.has(inferredNamespace)) {
          return kebabName;
        }

        if (!prefixForCss || prefixForCss.length === 0) {
          return kebabName;
        }

        return `${prefixForCss}-${kebabName}`;
      },
    });
  }
}

/**
 * s171 m02 — REPLACEMENT transform groups for the mobile platforms. The stock
 * `ios-swift`/`compose` groups cannot be extended: their colour transform rejects
 * oklch (tinycolor gate) and their size transforms assume rem sources, and an
 * appended transform runs AFTER that damage. So the groups are replaced wholesale,
 * keeping only the stock members that are correct on these sources.
 */
function registerMobileTransformGroups() {
  const tokenType = (token) => token.$type ?? token.type;
  const rawValue = (token, options) => (options.usesDtcg ? token.$value : token.value);

  // One shared 8-bit quantisation after CSS-Color-4 gamut mapping, so the Swift
  // floats, the Compose hex, and the committed gamut table agree at the byte level.
  const colorBytes = (value) => {
    const srgb = new ColorJs(value).to('srgb').toGamut({ method: 'css' });
    const byte = (coord) => Math.min(255, Math.max(0, Math.round(coord * 255)));
    const [r, g, b] = srgb.coords.map(byte);
    return { r, g, b, alpha: srgb.alpha ?? 1 };
  };

  StyleDictionary.registerTransform({
    name: 'oods/color/uicolor-swift',
    type: 'value',
    filter: (token) => tokenType(token) === 'color',
    transform: (token, _, options) => {
      const raw = rawValue(token, options);
      let bytes;
      try {
        bytes = colorBytes(raw);
      } catch {
        log.warn(`⚠︎ oods/color/uicolor-swift: unparseable colour ${JSON.stringify(raw)} at ${token.path.join('.')} — passed through`);
        return raw;
      }
      const channel = (n) => (n / 255).toFixed(3);
      return `UIColor(red: ${channel(bytes.r)}, green: ${channel(bytes.g)}, blue: ${channel(bytes.b)}, alpha: ${bytes.alpha})`;
    },
  });

  StyleDictionary.registerTransform({
    name: 'oods/color/compose',
    type: 'value',
    filter: (token) => tokenType(token) === 'color',
    transform: (token, _, options) => {
      const raw = rawValue(token, options);
      let bytes;
      try {
        bytes = colorBytes(raw);
      } catch {
        log.warn(`⚠︎ oods/color/compose: unparseable colour ${JSON.stringify(raw)} at ${token.path.join('.')} — passed through`);
        return raw;
      }
      const hex2 = (n) => n.toString(16).padStart(2, '0').toUpperCase();
      const alphaByte = Math.min(255, Math.max(0, Math.round(bytes.alpha * 255)));
      return `Color(0x${hex2(alphaByte)}${hex2(bytes.r)}${hex2(bytes.g)}${hex2(bytes.b)})`;
    },
  });

  // The bare-identifier classes (strokeStyle `solid`, textCase `uppercase`/`none`):
  // valid CSS keywords, invalid bare tokens in Swift/Kotlin — emit as string literals.
  StyleDictionary.registerTransform({
    name: 'oods/string-literal',
    type: 'value',
    filter: (token) => ['strokeStyle', 'textCase', 'border'].includes(tokenType(token)),
    transform: (token, _, options) => {
      const raw = rawValue(token, options);
      if (typeof raw !== 'string' || raw.startsWith('"')) {
        return raw;
      }
      return JSON.stringify(raw);
    },
  });

  // s171 m03 — the ×16 dimension class, bound per the committed path manifest
  // (never $type: post-preprocess fontSize arrives as $type dimension). px is 1:1
  // (basePxFontSize is NOT the mechanism); lineHeight % becomes a unitless
  // multiplier; letterSpacing em becomes an em number. A token missing from the
  // manifest, or a unit outside its class policy, passes through with a warning —
  // the compile gates red rather than the build throwing (CI runs build first).
  const DIMENSION_CANDIDATE_TYPES = ['dimension', 'lineHeight', 'letterSpacing', 'radius'];
  const NUMBER_RE = /^(-?\d*\.?\d+)(px|%|em|ms)$/;
  const fmt = (n) => String(n);
  const parseUnit = (raw, expected) => {
    if (typeof raw !== 'string') return null;
    const match = raw.trim().match(NUMBER_RE);
    if (!match || match[2] !== expected) return null;
    return Number(match[1]);
  };
  const passthrough = (name, token, raw, why) => {
    log.warn(`⚠︎ ${name}: ${why} at ${token.path.join('.')} (${JSON.stringify(raw)}) — passed through`);
    return raw;
  };

  const dimensionTransform = (name, emit) => ({
    name,
    type: 'value',
    filter: (token) => DIMENSION_CANDIDATE_TYPES.includes(tokenType(token)),
    transform: (token, _, options) => {
      const raw = rawValue(token, options);
      const cls = mobileDimensionClass(token.path);
      if (!cls) {
        return passthrough(name, token, raw, 'path not in mobile-manifest');
      }
      const expectedUnit = cls === 'lineHeight' ? '%' : cls === 'letterSpacing' ? 'em' : 'px';
      const value = parseUnit(raw, expectedUnit);
      if (value === null) {
        return passthrough(name, token, raw, `value outside the ${cls} policy (${expectedUnit})`);
      }
      return emit(cls, cls === 'lineHeight' ? value / 100 : value);
    },
  });

  StyleDictionary.registerTransform(
    dimensionTransform('oods/size/ios-swift', (cls, n) => {
      if (cls === 'lineHeight' || cls === 'letterSpacing') {
        return fmt(n);
      }
      return `CGFloat(${fmt(n)})`;
    }),
  );

  StyleDictionary.registerTransform(
    dimensionTransform('oods/size/compose', (cls, n) => {
      if (cls === 'lineHeight') {
        return fmt(n);
      }
      const literal = n < 0 ? `(${fmt(n)})` : fmt(n);
      if (cls === 'letterSpacing') {
        return `${literal}.em`;
      }
      const suffix = cls === 'fontSize' ? 'sp' : 'dp';
      return `${literal}.${suffix}`;
    }),
  );

  // Durations: iOS TimeInterval seconds, Compose Int milliseconds (header-documented).
  const durationTransform = (name, emit) => ({
    name,
    type: 'value',
    filter: (token) => tokenType(token) === 'duration',
    transform: (token, _, options) => {
      const raw = rawValue(token, options);
      const ms = parseUnit(raw, 'ms');
      if (ms === null || !Number.isInteger(ms)) {
        return passthrough(name, token, raw, 'value outside the duration policy (integer ms)');
      }
      return emit(ms);
    },
  });

  StyleDictionary.registerTransform(
    durationTransform('oods/duration/ios-swift', (ms) => `TimeInterval(${fmt(ms / 1000)})`),
  );

  StyleDictionary.registerTransform(durationTransform('oods/duration/compose', (ms) => fmt(ms)));

  StyleDictionary.registerFileHeader({
    name: 'oods/mobile-disclosure',
    fileHeader: (defaultMessages = []) => [
      ...defaultMessages,
      '',
      's171 mobile emission policy:',
      '• durations — iOS TimeInterval seconds (180ms → 0.18) · Compose Int milliseconds (180ms → 180)',
      '• lineHeight — unitless multiplier on both platforms (160% → 1.6)',
      '• letterSpacing — em number: Compose .em · iOS Double, kerning(pt) = value × fontSize(pt)',
      '• px dimensions — 1:1: iOS CGFloat · Compose .dp; the fontSize class emits Compose .sp',
      'DEFERRED from mobile output (exact counts):',
      `• ${MOBILE_DEFERRED_TYPES.cubicBezier} easing curves ($type cubicBezier) — mobile-relevant, with typed targets`,
      '  (Compose CubicBezierEasing, iOS CAMediaTimingFunction); typed emission is a consumer-API',
      '  commitment deferred to the mobile walk with a consumer in view',
      `• ${MOBILE_DEFERRED_TYPES.fontFamily} font stacks ($type fontFamily) — CSS font-stack strings do not map to mobile font APIs`,
    ],
  });

  StyleDictionary.registerTransformGroup({
    name: 'oods/ios-swift',
    transforms: [
      'attribute/cti',
      'name/camel',
      'oods/color/uicolor-swift',
      'content/swift/literal',
      'asset/swift/literal',
      'oods/string-literal',
      'oods/size/ios-swift',
      'oods/duration/ios-swift',
    ],
  });

  StyleDictionary.registerTransformGroup({
    name: 'oods/compose',
    transforms: [
      'attribute/cti',
      'name/camel',
      'oods/color/compose',
      'oods/string-literal',
      'oods/size/compose',
      'oods/duration/compose',
    ],
  });
}

function getTokenValue(token) {
  if (token.value !== undefined) {
    return token.value;
  }
  if (token.$value !== undefined) {
    return token.$value;
  }
  if (token.original?.value !== undefined) {
    return token.original.value;
  }
  if (token.original?.$value !== undefined) {
    return token.original.$value;
  }
  return null;
}

function normalizeContent(filePath, content) {
  if (extname(filePath) === '.json') {
    try {
      const parsed = JSON.parse(content);
      if (parsed?.meta?.generatedAt) {
        parsed.meta.generatedAt = '__normalized__';
      }
      return JSON.stringify(parsed, null, 2) + '\n';
    } catch {
      return content;
    }
  }

  return content;
}

await run();
