import { createHash } from 'node:crypto';
import path from 'node:path';
import type { Plugin } from 'esbuild';
import { loadEsbuild } from './runtime.js';
import type { PreviewArtifact, PreviewFramework } from './store.js';

/** CSS the page already links (the prebuilt component-styles bundle), so the import is dropped. */
const DROPPED_IMPORTS = new Set(['@oods/component-styles/css']);
const LOADERS: Record<string, 'tsx' | 'ts' | 'js' | 'jsx' | 'json' | 'text' | 'css'> = { '.tsx': 'tsx', '.ts': 'ts', '.js': 'js', '.jsx': 'jsx', '.mjs': 'js', '.json': 'json', '.svg': 'text', '.css': 'css' };

export interface CompiledModule {
  framework: PreviewFramework;
  entry: string;
  /** The artifact's content hash; the cache key. */
  artifactContentHash: string;
  code: string;
  sha256: string;
  bytes: number;
  /** Bare specifiers left for the page's import map. */
  externals: string[];
  durationMs: number;
}

export class PreviewCompileError extends Error {
  constructor(message: string, readonly framework: PreviewFramework, readonly entry: string) { super(message); this.name = 'PreviewCompileError'; }
}

/** The mount entry: a workflow artifact carries its own main; a standalone one exports GeneratedUI. */
export function artifactEntry(artifact: PreviewArtifact): string {
  const paths = new Set(artifact.files.map(file => file.path));
  if (paths.has('package.json')) {
    const main = artifact.framework === 'react' ? 'src/main.tsx' : 'src/main.ts';
    if (!paths.has(main)) throw new PreviewCompileError(`Workflow artifact has no ${main}`, artifact.framework, main);
    return main;
  }
  const first = artifact.files[0]?.path;
  if (!first || !/\.(?:tsx|vue)$/.test(first)) throw new PreviewCompileError('Artifact has no framework source entry', artifact.framework, first ?? '');
  return first;
}

const cache = new Map<string, Promise<CompiledModule>>();

/** Compile one generated artifact into one browser ESM module; bare imports stay external. */
export function compileArtifact(artifact: PreviewArtifact): Promise<CompiledModule> {
  const key = `${artifact.framework}:${artifact.contentHash}`;
  let pending = cache.get(key);
  if (!pending) {
    pending = compile(artifact).catch(error => { cache.delete(key); throw error; });
    cache.set(key, pending);
  }
  return pending;
}

export function compiledCacheSize(): number { return cache.size; }

async function compile(artifact: PreviewArtifact): Promise<CompiledModule> {
  const started = performance.now();
  const entry = artifactEntry(artifact);
  const files = new Map(artifact.files.map(file => [file.path, file.contents]));
  const externals = new Set<string>();
  const esbuild = await loadEsbuild();
  const sfc = artifact.framework === 'vue' ? await import('@vue/compiler-sfc') : undefined;

  const plugin: Plugin = {
    name: 'oods-preview-artifact',
    setup(build) {
      build.onResolve({ filter: /.*/ }, args => {
        if (args.kind === 'entry-point') return { path: args.path, namespace: 'artifact' };
        if (args.path.startsWith('.') || args.path.startsWith('/')) {
          const base = path.posix.normalize(path.posix.join(path.posix.dirname(args.importer), args.path));
          const found = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.vue`, `${base}/index.ts`, `${base}/index.tsx`].find(candidate => files.has(candidate));
          if (!found) return { errors: [{ text: `Artifact import not found: ${args.path} (from ${args.importer})` }] };
          return { path: found, namespace: 'artifact' };
        }
        if (DROPPED_IMPORTS.has(args.path)) return { path: args.path, namespace: 'oods-dropped' };
        externals.add(args.path);
        return { path: args.path, external: true };
      });
      build.onLoad({ filter: /.*/, namespace: 'oods-dropped' }, () => ({ contents: 'export {};', loader: 'js' }));
      build.onLoad({ filter: /.*/, namespace: 'artifact' }, args => {
        const contents = files.get(args.path)!;
        const extension = path.posix.extname(args.path);
        const resolveDir = path.posix.dirname(args.path);
        if (extension === '.vue') {
          if (!sfc) return { errors: [{ text: `A .vue file inside a ${artifact.framework} artifact: ${args.path}` }] };
          const { descriptor, errors } = sfc.parse(contents, { filename: args.path });
          if (errors.length) return { errors: errors.map(error => ({ text: `${args.path}: ${(error as Error).message ?? String(error)}` })) };
          const id = `oods-${createHash('sha256').update(args.path).digest('hex').slice(0, 8)}`;
          const script = sfc.compileScript(descriptor, { id, inlineTemplate: true, templateOptions: { compilerOptions: { mode: 'module' } } });
          let code = script.content;
          const css = descriptor.styles.map(style => sfc.compileStyle({ source: style.content, filename: args.path, id, scoped: style.scoped }).code).join('\n');
          if (css.trim()) code += `\n;(() => { const style = document.createElement('style'); style.dataset.oodsSfc = ${JSON.stringify(args.path)}; style.textContent = ${JSON.stringify(css)}; document.head.appendChild(style); })();\n`;
          return { contents: code, loader: script.lang === 'ts' ? 'ts' : 'js', resolveDir };
        }
        const loader = LOADERS[extension];
        if (!loader) return { errors: [{ text: `No loader for ${args.path}` }] };
        return { contents, loader, resolveDir };
      });
    },
  };

  let result: Awaited<ReturnType<typeof esbuild.build>>;
  try {
    result = await esbuild.build({
      entryPoints: [entry], bundle: true, write: false, format: 'esm', platform: 'browser', target: 'es2022',
      jsx: 'automatic', plugins: [plugin], logLevel: 'silent', legalComments: 'none',
      define: { 'process.env.NODE_ENV': '"production"' },
    });
  } catch (error) {
    const failure = error as { errors?: Array<{ text: string; location?: { file?: string; line?: number } | null }> };
    const text = Array.isArray(failure.errors) && failure.errors.length
      ? failure.errors.map(item => `${(item.location?.file ?? entry).replace(/^artifact:/, '')}:${item.location?.line ?? 0}: ${item.text}`).join('\n')
      : error instanceof Error ? error.message : String(error);
    throw new PreviewCompileError(`${artifact.framework} artifact failed to compile:\n${text}`, artifact.framework, entry);
  }
  const output = result.outputFiles?.[0];
  if (!output) throw new PreviewCompileError('esbuild produced no output', artifact.framework, entry);
  const code = output.text;
  return {
    framework: artifact.framework, entry, artifactContentHash: artifact.contentHash, code,
    sha256: createHash('sha256').update(code).digest('hex'), bytes: Buffer.byteLength(code),
    externals: [...externals].sort(), durationMs: performance.now() - started,
  };
}
