import path from 'node:path';
import fs from 'node:fs';
import { tokenPackageRoot, runTokenBuild, readTokenScopes, canRunTokenBuild } from '../lib/token-build.js';
import { todayDir, loadPolicy, withinAllowed } from '../lib/security.js';
import { writeTranscript, writeBundleIndex, sha256File } from '../lib/transcript.js';
import type { TokensBuildInput, GenericOutput, ToolPreview, ArtifactDetail } from './types.js';
import { ToolError } from '../errors/tool-error.js';

type TokensBuildOutputs = {
  css: string;
  ts: string;
  tailwind: string;
};

function isNonEmptyFile(filePath: string): boolean {
  try {
    const stat = fs.statSync(filePath);
    return stat.isFile() && stat.size > 0;
  } catch {
    return false;
  }
}

async function ensureTokensBuildOutputs(): Promise<TokensBuildOutputs> {
  const TOKENS_DIST_DIR = path.join(tokenPackageRoot(), 'dist');
  const outputs: TokensBuildOutputs = {
    css: path.join(TOKENS_DIST_DIR, 'css', 'tokens.css'),
    ts: path.join(TOKENS_DIST_DIR, 'ts', 'tokens.ts'),
    tailwind: path.join(TOKENS_DIST_DIR, 'tailwind', 'tokens.json'),
  };

  const required = [...Object.values(outputs), path.join(TOKENS_DIST_DIR, 'css-variables-by-scope.json')];
  const missing = required.filter((filePath) => !isNonEmptyFile(filePath));
  if (missing.length) {
    if (!canRunTokenBuild()) {
      throw new ToolError('OODS-N011', 'tokens.build: required token dist outputs are missing; this runtime cannot rebuild canonical tokens.', {
        tool: 'tokens.build', dependency: 'token-dist-outputs', missing, buildAttempted: false,
      });
    }
    const build = await runTokenBuild();
    if (build.exitCode !== 0) {
      const tail = build.commands.map(command => command.stdout + command.stderr).join('\n').split('\n').slice(-40).join('\n');
      throw new ToolError('OODS-S019', `Token build failed (exit ${build.exitCode}).\n${tail}`, { build });
    }
  }

  const stillMissing = required.some((filePath) => !isNonEmptyFile(filePath));
  if (stillMissing) {
    throw new ToolError('OODS-N007', 'tokens build outputs are missing after running the pipeline');
  }

  return outputs;
}

function ensureAllowed(base: string, candidate: string): void {
  if (!withinAllowed(base, candidate)) {
    throw new ToolError('OODS-S015', `Path not allowed: ${candidate}`, { path: candidate });
  }
  fs.mkdirSync(path.dirname(candidate), { recursive: true });
}

function recordArtifact(
  filePath: string,
  name: string,
  purpose: string,
  artifacts: string[],
  details: ArtifactDetail[],
): void {
  artifacts.push(filePath);
  try {
    const stat = fs.statSync(filePath);
    details.push({
      path: filePath,
      name,
      purpose,
      sha256: sha256File(filePath),
      sizeBytes: stat.size,
    });
  } catch {
    // ignore missing stats; verification will catch missing files
  }
}

export async function handle(input: TokensBuildInput = {}): Promise<GenericOutput> {
  const policy = loadPolicy();
  const base = todayDir(policy.artifactsBase);
  const outDir = path.join(base, 'tokens.build');
  const startedAt = new Date();
  const artifacts: string[] = [];
  const details: ArtifactDetail[] = [];
  let preview: ToolPreview | undefined;

  fs.mkdirSync(outDir, { recursive: true });

  const brand = input.brand ?? 'A';
  const theme = input.theme ?? 'dark';
  if (!['A', 'B'].includes(brand) || !['light', 'dark', 'hc'].includes(theme)) {
    throw new ToolError('OODS-V001', `Unknown token scope ${brand}/${theme}.`, { brand, theme });
  }

  if (input.apply) {
    const outputs = await ensureTokensBuildOutputs();

    const scopes = readTokenScopes();
    const variables = scopes[brand]?.[theme];
    if (!variables) throw new ToolError('OODS-V001', `Token scope ${brand}/${theme} was not built.`, { brand, theme });
    const tokensPayload = { cssVariables: variables, meta: { brand, theme, scope: 'requested' } };

    const themeFile = path.join(outDir, `tokens.${theme}.json`);
    ensureAllowed(policy.artifactsBase, themeFile);
    fs.writeFileSync(themeFile, JSON.stringify(tokensPayload, null, 2), 'utf8');
    recordArtifact(
      themeFile,
      `tokens.${theme}.json`,
      'Resolved variables for the requested brand and theme.',
      artifacts,
      details,
    );

    const scopeCss = `[data-brand='${brand}'][data-theme='${theme}'] {\n${Object.entries(variables).map(([name, value]) => `  ${name.replace(/^--oods-(sys|theme|ref|cmp)-/, '--$1-')}: ${value};`).join('\n')}\n}\n`;
    const scopeOut = path.join(outDir, 'tokens.scope.css');
    ensureAllowed(policy.artifactsBase, scopeOut);
    fs.writeFileSync(scopeOut, scopeCss, 'utf8');
    recordArtifact(scopeOut, 'tokens.scope.css', 'Resolved CSS variables for only the requested brand and theme.', artifacts, details);

    const cssOut = path.join(outDir, 'tokens.css');
    ensureAllowed(policy.artifactsBase, cssOut);
    fs.copyFileSync(outputs.css, cssOut);
    recordArtifact(cssOut, 'tokens.css', 'Compiled CSS custom properties.', artifacts, details);

    const tsOut = path.join(outDir, 'tokens.ts');
    ensureAllowed(policy.artifactsBase, tsOut);
    fs.copyFileSync(outputs.ts, tsOut);
    recordArtifact(tsOut, 'tokens.ts', 'Legacy default-scope TypeScript token map (A/light).', artifacts, details);

    const tailwindOut = path.join(outDir, 'tokens.tailwind.json');
    ensureAllowed(policy.artifactsBase, tailwindOut);
    fs.copyFileSync(outputs.tailwind, tailwindOut);
    recordArtifact(tailwindOut, 'tokens.tailwind.json', 'Legacy default-scope Tailwind token JSON (A/light).', artifacts, details);
  } else {
    const expected = [
      `tokens.${theme}.json`,
      'tokens.css',
      'tokens.scope.css',
      'tokens.ts',
      'tokens.tailwind.json',
    ];
    preview = {
      summary: `Preview only: would return ${expected.length} token artifact${expected.length === 1 ? '' : 's'} for brand ${brand} (${theme} theme).`,
      notes: expected.map((name) => `artifact: ${name}`),
      specimens: expected.map((name) => path.join(outDir, name)),
    };
  }

  const transcriptPath = writeTranscript(outDir, {
    tool: 'tokens.build',
    input,
    apply: Boolean(input.apply),
    artifacts,
    startTime: startedAt,
    endTime: new Date(),
  });
  const bundleIndexPath = writeBundleIndex(outDir, [transcriptPath, ...artifacts]);
  return {
    artifacts,
    transcriptPath,
    bundleIndexPath,
    ...(preview ? { preview } : {}),
    ...(details.length ? { artifactsDetail: details } : {}),
  };
}
